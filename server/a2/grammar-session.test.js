import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {curriculum} from './curriculum.js';

test('specific grammar feedback survives session completion and appears in Meine Fehler',async()=>{
 const directory=await mkdtemp(path.join(tmpdir(),'satzivo-grammar-'));
 const child=spawn(process.execPath,[fileURLToPath(new URL('../index.js',import.meta.url))],{env:{...process.env,DATA_DIR:directory,PORT:'0'},stdio:['ignore','pipe','pipe']});let stderr='';child.stderr.on('data',chunk=>stderr+=chunk);
 try{
  const base=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`Startup timeout: ${stderr}`)),10000);child.once('error',reject);child.once('exit',code=>{clearTimeout(timer);reject(new Error(`Server exited ${code}: ${stderr}`));});child.stdout.on('data',chunk=>{const match=String(chunk).match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timer);resolve(match[0]);}});});
  const request=async(route,body,method='POST')=>{const response=await fetch(`${base}/api/a2${route}`,body===undefined?undefined:{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});assert.ok(response.ok,`${method} ${route}: ${response.status}`);return response.json();};
  const exercise=curriculum.flatMap(lesson=>lesson.exercises).find(item=>item.model==='Die Fahrkarten liegen auf dem kleinen Tisch neben der Tür.');assert.ok(exercise);
  const run=await request('/runs',{kind:'lesson',ref:exercise.lessonId,mode:'practice'}),answer='Die Fahrkarten liegen auf dem Tisch kleinen neben der Tür.';
  await request(`/runs/${run.id}`,{answers:{[exercise.id]:answer},position:run.exercises.findIndex(item=>item.id===exercise.id)},'PUT');
  const checked=await request(`/runs/${run.id}/check`,{exerciseId:exercise.id,answer});assert.equal(checked.errors[0].type,'adjective-placement');assert.equal(checked.errors[0].actual,'auf dem Tisch kleinen');
  await request(`/runs/${run.id}/finish`,{});const dashboard=await request('/bootstrap',undefined,'GET');const mistake=dashboard.stats.mistakes.find(item=>item.exerciseId===exercise.id);assert.ok(mistake);assert.equal(mistake.feedback.errors[0].expected,'auf dem kleinen Tisch');assert.match(mistake.feedback.errors[0].explanation.es,/dativo/);
 }finally{child.kill();await new Promise(resolve=>child.once('exit',resolve));await rm(directory,{recursive:true,force:true});}
});
