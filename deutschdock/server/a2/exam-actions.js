import {randomUUID} from 'node:crypto';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {examAudio} from './exams.js';
export function registerExamActions(router,{read,persist,active,editableIds,publicRun,bank}){
 router.post('/runs/:id/recording-ticket',(req,res)=>{try{const run=read(req.params.id);active(run);const {exerciseId}=req.body||{};if(!run.state.ids.includes(exerciseId)||bank.get(exerciseId).type!=='speak'||!editableIds(run).includes(exerciseId))throw new Error('invalid_recording');run.state.recordingTickets ||= {};const token=randomUUID();run.state.recordingTickets[token]={exerciseId,started:Date.now(),used:false};persist(run);res.json({token});}catch(e){res.status(409).json({error:e.message});}});
 router.post('/runs/:id/play',(req,res)=>{try{
  const run=read(req.params.id);active(run);const {clipId,action,token}=req.body||{};
  const matches=run.state.ids.flatMap(id=>(bank.get(id).material?.clips||[]).filter(c=>c.id===clipId));
  if(!matches.length)throw new Error('not_found');const clip=matches[0],script=examAudio.find(c=>c.id===clipId);
  if(!script||!existsSync(fileURLToPath(new URL(`../../public${clip.audio}`,import.meta.url))))throw new Error('audio_missing');
  if(run.mode==='exam'&&!matches.some(c=>c.questionIds.some(id=>editableIds(run).includes(id))))throw new Error('section_locked');
  const limit=script.plays,used=run.state.plays[clipId]||0;run.state.playReservations ||= {};
  const reservation=run.state.playReservations[clipId];
  if(action==='confirm'){
   if(!reservation||reservation.token!==token)throw new Error('invalid_play_token');
   if(reservation.confirmed)return res.json({used:run.state.plays[clipId]||0,limit});
   if(reservation.expires<Date.now())throw new Error('invalid_play_token');
   if(run.mode==='exam'&&used>=limit)throw new Error('play_limit');
   reservation.confirmed=true;run.state.plays[clipId]=used+1;persist(run);return res.json({used:used+1,limit});
  }
  if(run.mode==='exam'&&used>=limit)throw new Error('play_limit');
  if(action==='reserve'){
   const next=reservation&&!reservation.confirmed&&reservation.expires>Date.now()?reservation:{token:randomUUID(),expires:Date.now()+120000,confirmed:false};
   run.state.playReservations[clipId]=next;persist(run);return res.json({token:next.token,used,limit});
  }
  // Compatibility for the previous client. New clients reserve and confirm on playing.
  run.state.plays[clipId]=used+1;persist(run);res.json({used:used+1,limit});
 }catch(e){res.status(409).json({error:e.message});}});
 router.get('/runs/:id/transcript/:clipId',(req,res)=>{try{
  const run=read(req.params.id);if(!run)throw new Error('not_found');
  const clips=run.state.ids.flatMap(id=>bank.get(id).material?.clips||[]).filter(c=>c.id===req.params.clipId);
  if(!clips.length)throw new Error('not_found');
  if(!run.finished&&(run.mode==='exam'||!clips[0].questionIds.filter(id=>run.state.ids.includes(id)).every(id=>run.state.answers[id]?.trim())))throw new Error('attempt_before_transcript');
  res.json({text:examAudio.find(c=>c.id===req.params.clipId).text});
 }catch(e){res.status(409).json({error:e.message});}});
 router.post('/runs/:id/self-check',(req,res)=>{try{
  const run=read(req.params.id);if(!run)throw new Error('not_found');if(run.mode==='exam'&&!run.finished)throw new Error('exam_no_hints');
  const {exerciseId,checks}=req.body||{};
  if(!run.state.ids.includes(exerciseId)||!['write','speak'].includes(bank.get(exerciseId).type)||!checks||typeof checks!=='object'||Array.isArray(checks)||Object.keys(checks).length>20||Object.entries(checks).some(([key,value])=>key.length>40||!['yes','partly','no'].includes(value)))throw new Error('invalid_answer');
  run.state.selfChecks ||= {};run.state.selfChecks[exerciseId]=checks;persist(run);res.json({saved:true});
 }catch(e){res.status(409).json({error:e.message});}});
 router.post('/runs/:id/assessment',(req,res)=>{try{
  const run=read(req.params.id);if(!run||run.kind!=='exam')throw new Error('not_found');if(!run.finished)throw new Error('run_not_finished');
  const {skill,points}=req.body||{};if(!['Schreiben','Sprechen'].includes(skill)||typeof points!=='number'||!Number.isFinite(points)||points<0||points>25||!run.state.ids.some(id=>bank.get(id).skill===skill))throw new Error('invalid_answer');
  run.state.assessments ||= {};run.state.assessments[skill]={points,source:'self'};persist(run);res.json(publicRun(run));
 }catch(e){res.status(409).json({error:e.message});}});
}
