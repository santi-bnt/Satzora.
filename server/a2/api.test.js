import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {DatabaseSync} from 'node:sqlite';
import {curriculum,exerciseBank} from './curriculum.js';
import {examExercises} from './exams.js';
const script=fileURLToPath(new URL('../index.js',import.meta.url));
async function start(directory){const child=spawn(process.execPath,[script],{env:{...process.env,DATA_DIR:directory,PORT:'0',OPENAI_API_KEY:'',OPENAI_TEXT_MODEL:''},stdio:['ignore','pipe','pipe']});let errors='';child.stderr.on('data',chunk=>errors+=chunk);const url=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{child.kill();reject(new Error(`Startup timeout: ${errors}`));},10000);child.once('error',reject);child.once('exit',code=>{clearTimeout(timer);reject(new Error(`Server exited ${code}: ${errors}`));});child.stdout.on('data',chunk=>{const match=String(chunk).match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timer);resolve(match[0]);}});});return {child,url};}
async function stop(child){if(child.exitCode!==null)return;await new Promise(resolve=>{child.once('exit',resolve);child.kill();});}
test('A2 lifecycle preserves legacy data, resumes answers, grades once, records errors, respects exam limits, and persists preferences',async()=>{
 const directory=await mkdtemp(path.join(tmpdir(),'deutsch-a2-'));let server;
 try{
 server=await start(directory);
 const req=async(route,body,method='POST')=>{const res=await fetch(`${server.url}/api${route}`,body!==undefined?{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:undefined);return {status:res.status,data:await res.json()};};
 const initial=(await req('/a2/bootstrap')).data;assert.equal(initial.counts.lessons,80);assert.equal(initial.counts.exercises,1200);assert.equal(initial.stats.answered,0);assert.equal(initial.capabilities.feedback,false);assert.ok(initial.modules.flatMap(m=>m.lessons).every(l=>!l.exercises&&l.exerciseCount===15));
 await req('/lessons/hallo/complete',{answers:[1,0,2]});const before=(await req('/bootstrap')).data;assert.equal(before.completions.length,1);
 assert.equal((await req('/a2/preferences',{locale:'fr',theme:'light'},'PUT')).status,400);await req('/a2/preferences',{locale:'en',theme:'dark'},'PUT');
 const lesson=curriculum[0],run=(await req('/a2/runs',{kind:'lesson',ref:lesson.id})).data;assert.equal(run.exercises.length,15);assert.ok(run.exercises.every(e=>!('answers'in e)&&!('focus'in e)));
 const answers=Object.fromEntries(lesson.exercises.map((e,i)=>[e.id,i===0?'falsch':e.type==='write'?'Ich beschreibe eine andere Situation und benutze eigene Wörter.':e.answers[0]]));
 assert.equal((await req(`/a2/runs/${run.id}`,{answers:{notanid:'x'},position:0},'PUT')).status,409);
 assert.equal((await req(`/a2/runs/${run.id}`,{answers,position:6},'PUT')).status,200);const restored=(await req(`/a2/runs/${run.id}`)).data;assert.equal(restored.state.position,6);assert.equal(restored.state.answers[lesson.exercises[0].id],'falsch');assert.ok(restored.deadline===run.deadline);
 const finished=(await req(`/a2/runs/${run.id}/finish`,{})).data;assert.equal(finished.result.total,15);assert.equal(finished.result.correct,12);assert.equal(finished.result.objective,13);assert.equal(finished.result.evaluations[lesson.exercises[8].id].correct,null);await req(`/a2/runs/${run.id}/finish`,{});let stats=(await req('/a2/bootstrap')).data.stats;assert.equal(stats.answered,15);assert.equal(stats.mistakes.length,1);assert.equal(stats.completed,1);
 const review=(await req('/a2/runs',{kind:'errors',minutes:15})).data;assert.ok(review.exercises.length>0);assert.ok(review.exercises.every(e=>e.topic===lesson.exercises[0].topic));
 for(const minutes of [15,30,45,60]){const session=(await req('/a2/runs',{kind:'intensive',minutes,focus:'all'})).data;assert.equal(session.deadline-session.started,minutes*60000);for(const skill of ['Grammatik','Lesen','Hören','Schreiben','Sprechen'])assert.ok(session.exercises.some(e=>e.skill===skill),skill);}
 const exam=(await req('/a2/runs',{kind:'exam',ref:'modell-01',focus:'Hören',mode:'exam'})).data;assert.equal(exam.exercises.length,20);assert.equal(exam.deadline-exam.started,1800000);assert.ok(!JSON.stringify(exam.sections).includes('transcript'));assert.equal((await req(`/a2/runs/${exam.id}/check`,{exerciseId:exam.exercises[0].id,answer:'x'})).status,409);assert.equal((await req(`/a2/runs/${exam.id}/coach`,{exerciseId:exam.exercises[0].id,answer:'x'})).status,409);
 const clipId=exam.sections[0].parts[0].clips[0].id;assert.equal((await req(`/a2/runs/${exam.id}/play`,{clipId})).status,200);assert.equal((await req(`/a2/runs/${exam.id}/play`,{clipId})).status,200);assert.equal((await req(`/a2/runs/${exam.id}/play`,{clipId})).status,409);
 const full=(await req('/a2/runs',{kind:'exam',ref:'modell-02',mode:'exam'})).data;assert.equal((await req(`/a2/runs/${full.id}`,{answers:{[full.exercises[20].id]:'a'},position:20},'PUT')).status,409);
 const dictionary=(await req('/a2/dictionary?word=gefahren')).data.entry;assert.equal(dictionary.lemma,'fahren');await req('/a2/vocabulary',{id:dictionary.id});assert.equal((await req(`/reviews/${dictionary.id}`,{known:true})).status,200);assert.equal((await req(`/reviews/${dictionary.id}`,{known:true})).status,409);
 const oral=(await req('/a2/runs',{kind:'exam',ref:'modell-01',focus:'Sprechen'})).data;const audio=Buffer.concat([Buffer.from([0x1a,0x45,0xdf,0xa3]),Buffer.alloc(1024,1)]);const response=await fetch(`${server.url}/api/a2/runs/${oral.id}/recordings/${oral.exercises[0].id}`,{method:'POST',headers:{'Content-Type':'audio/webm'},body:audio});assert.equal(response.status,201);const recording=await response.json();assert.equal((await fetch(`${server.url}${recording.url}`)).status,200);assert.equal((await req(`/a2/recordings/${recording.id}/transcribe`,{})).data.error,'service_unconfigured');
 await stop(server.child);const db=new DatabaseSync(path.join(directory,'deutsch-lernen.sqlite'));db.prepare('UPDATE a2_runs SET deadline=? WHERE id=?').run(Date.now()-1000,exam.id);db.close();server=await start(directory);
 const expired=(await req(`/a2/runs/${exam.id}`)).data;assert.ok(expired.finished);assert.equal(expired.result.correct,0);assert.equal(expired.result.total,20);assert.equal((await req(`/a2/runs/${exam.id}`,{answers:{[exam.exercises[0].id]:'a'},position:0},'PUT')).status,409);
 const final=(await req('/a2/bootstrap')).data;assert.deepEqual(final.preferences,{locale:'en',theme:'dark'});assert.ok(final.savedWords.includes(dictionary.id));assert.equal((await req('/bootstrap')).data.completions.length,1);assert.deepEqual((await req(`/a2/runs/${run.id}`)).data.state.answers,answers);assert.equal((await req(`/a2/runs/${oral.id}/recordings`)).data.length,1);
 }finally{if(server)await stop(server.child);await rm(directory,{recursive:true,force:true});}
});
