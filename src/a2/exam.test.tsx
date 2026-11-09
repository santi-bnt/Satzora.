import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {examModels} from '../../server/a2/exams.js';
const dom=new JSDOM('<!doctype html><html lang="es"><body></body></html>',{url:'http://localhost/#exam'});
for(const key of ['window','document','navigator','HTMLElement','HTMLInputElement','Event','MouseEvent','KeyboardEvent','MutationObserver','localStorage','location'])Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true,writable:true});
Object.defineProperty(window,'innerWidth',{value:390,configurable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const {render,screen,fireEvent,within,waitFor,cleanup}=await import('@testing-library/react');
const {default:A2App}=await import('./A2App');
const {Speech}=await import('./Speech');
const {ListeningPlayer}=await import('./ExamMaterials');
const {AppContext}=await import('./context');
const {translate}=await import('./i18n');
test('simulator component journey against real API: 4 reading parts, free writing, cards, mobile document position and bilingual review',async()=>{
 const directory=await mkdtemp(path.join(tmpdir(),'a2-exam-ui-'));
 const child=spawn(process.execPath,[fileURLToPath(new URL('../../server/index.js',import.meta.url))],{env:{...process.env,DATA_DIR:directory,PORT:'0',OPENAI_API_KEY:'',OPENAI_TEXT_MODEL:''},stdio:['ignore','pipe','pipe']});const originalFetch=globalThis.fetch;
 try{
 const url=await new Promise<string>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Startup timeout')),10000);child.once('error',reject);child.stdout.on('data',data=>{const match=String(data).match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timer);resolve(match[0]);}});});
 globalThis.fetch=(input,options)=>originalFetch(typeof input==='string'&&input.startsWith('/')?`${url}${input}`:input,options);
 const view=render(<A2App/>);await screen.findByRole('heading',{name:'Modell 01 · Stadt und Alltag'});
 fireEvent.click(screen.getByRole('button',{name:'Abrir menú'}));assert.ok(document.querySelector('.sidebar.open'));fireEvent.click(screen.getByRole('button',{name:'Cerrar'}));assert.equal(document.querySelector('.sidebar.open'),null);
 fireEvent.change(screen.getByRole('combobox',{name:'Habilidad'}),{target:{value:'Lesen'}});fireEvent.click(screen.getAllByRole('button',{name:'Empezar'})[0]);await screen.findByRole('heading',{name:'Teil 1 · Artikel'});
 assert.equal(screen.getAllByRole('group').length,5);const region=screen.getByRole('region',{name:'Lesetext'});assert.match(region.textContent||'',/Nachbarschaftstreff/);region.scrollTop=140;fireEvent.scroll(region);fireEvent.click(screen.getByRole('button',{name:'Preguntas (5)'}));assert.equal(document.querySelector('.exam-task-layout')?.getAttribute('data-pane'),'questions');fireEvent.click(screen.getByRole('button',{name:'Documento'}));assert.equal(screen.getByRole('region',{name:'Lesetext'}).scrollTop,140);
 for(const part of examModels[0].sections[0].parts){if(part!==examModels[0].sections[0].parts[0]){fireEvent.click(screen.getByRole('button',{name:new RegExp(`Lesen ${part.title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`)}));await waitFor(()=>assert.ok(screen.getByRole('heading',{name:part.title})));}for(const question of part.questions){const group=screen.getByRole('group',{name:question.prompt});fireEvent.click(within(group).getAllByRole('radio')[question.options.indexOf(question.answers[0])]);}}
 fireEvent.click(screen.getByRole('button',{name:'Finalizar y evaluar'}));await screen.findByRole('heading',{name:'Resultados por habilidad'});assert.ok(screen.getByText('No hay resultado global: faltan habilidades por evaluar.'));assert.ok(screen.getByText('Clave de respuestas verificada'));assert.ok(screen.getByText('25'));fireEvent.click(screen.getByRole('button',{name:'Volver'}));await screen.findByRole('heading',{name:'Modell 01 · Stadt und Alltag'});
 fireEvent.change(screen.getByRole('combobox',{name:'Habilidad'}),{target:{value:'Schreiben'}});fireEvent.click(screen.getAllByRole('button',{name:'Empezar'})[2]);await screen.findByRole('heading',{name:'Teil 1 · SMS'});
 const sms=examModels[2].sections[2].parts[0].questions[0],mail=examModels[2].sections[2].parts[1].questions[0];assert.equal(document.querySelectorAll('.writing-task-points li').length,3);assert.ok(document.querySelector('.writing-situation')?.textContent?.includes(sms.situation));assert.ok(document.querySelector('.writing-format-instruction')?.textContent?.includes('SMS'));assert.match(document.querySelector('.writing-length-instruction')?.textContent||'',/20.{1,3}30 W.?rter/);for(const point of sms.points)assert.ok(document.querySelector('.writing-task-points')?.textContent?.includes(point));assert.equal(document.body.textContent?.includes(sms.model),false);fireEvent.change(screen.getByRole('textbox'),{target:{value:sms.model}});fireEvent.click(screen.getByRole('button',{name:'Siguiente'}));await screen.findByRole('heading',{name:'Teil 2 · E-Mail'});fireEvent.change(screen.getByRole('textbox'),{target:{value:mail.model}});fireEvent.click(screen.getByRole('button',{name:'Finalizar y evaluar'}));await screen.findByRole('heading',{name:'Tu texto original'});assert.equal(document.querySelector('.original-production')?.textContent,mail.model);
 const select=screen.getByRole('combobox',{name:mail.points[0]});fireEvent.change(select,{target:{value:'yes'}});fireEvent.click(screen.getByRole('button',{name:'Guardar autoevaluación'}));await waitFor(()=>assert.ok(screen.getByText('Guardado',{selector:'.production-review p'})));
 fireEvent.change(screen.getByRole('combobox',{name:'Idioma de la interfaz'}),{target:{value:'en'}});await screen.findByRole('heading',{name:'Your original text'});assert.ok(screen.getByRole('button',{name:'Save self-assessment'}));assert.ok(screen.getByText('No global result: some skills have not been assessed.'));fireEvent.click(screen.getByRole('button',{name:'Back'}));await screen.findByRole('heading',{name:'Modell 01 · Stadt und Alltag'});
 fireEvent.change(screen.getByRole('combobox',{name:'Skill'}),{target:{value:'Sprechen'}});fireEvent.click(screen.getAllByRole('button',{name:'Start'})[2]);await screen.findByRole('heading',{name:'Teil 1 · Fragen zur Person'});assert.equal(document.querySelectorAll('.speaking-keyword').length,4);assert.equal(screen.queryByRole('textbox'),null);fireEvent.click(screen.getByRole('button',{name:'Next'}));await screen.findByRole('heading',{name:'Wie lernen Sie etwas Neues?'});assert.equal(document.querySelectorAll('.topic-speaking-card>div>span').length,4);fireEvent.click(screen.getByRole('button',{name:'Next'}));await waitFor(()=>assert.ok(document.querySelector('.planning-card')));assert.ok(screen.getByText('Person A'));assert.equal(screen.queryByText('Person B'),null);
 view.unmount();cleanup();
 // Browser-contract checks, not physical-device certification: verify negotiated
 // recorder MIME and persisted upload for Windows/Android WebM and iOS MP4.
 for(const [platform,mime] of [['Windows','audio/webm'],['Android','audio/webm'],['iOS','audio/mp4']]){
  const response=await originalFetch(`${url}/api/a2/runs`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'exam',ref:'modell-01',focus:'Sprechen',mode:'practice'})});const run=await response.json();let stopped=false;
  Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>({getTracks:()=>[{stop:()=>{stopped=true;}}]})}});
  class Recorder{static isTypeSupported(type:string){return type===mime;}mimeType=mime;state='inactive';ondataavailable:((e:{data:Blob})=>void)|null=null;onstop:(()=>void)|null=null;constructor(_stream:unknown,options:{mimeType:string}){assert.equal(options.mimeType,mime);}start(){this.state='recording';}stop(){this.state='inactive';const header=mime==='audio/mp4'?new Uint8Array([0,0,0,24,102,116,121,112]):new Uint8Array([26,69,223,163]);this.ondataavailable?.({data:new Blob([header,new Uint8Array(256)],{type:mime})});this.onstop?.();}}
  Object.defineProperty(globalThis,'MediaRecorder',{value:Recorder,configurable:true});let active=false;
  const context={locale:'en' as const,t:(key:Parameters<typeof translate>[0])=>translate(key,'en'),word:()=>{},dictionaryEnabled:true,capabilities:{feedback:false,transcription:false,conversation:false},refresh:async()=>{}};
  const speech=render(<AppContext.Provider value={context}><Speech run={run} exerciseId={run.exercises[0].id} exercise={run.exercises[0]} onText={()=>{}} onRecording={v=>{active=v;}}/></AppContext.Provider>);
  fireEvent.click(screen.getByRole('button',{name:'Record answer'}));await screen.findByRole('button',{name:'Stop and save'});assert.equal(active,true,platform);fireEvent.click(screen.getByRole('button',{name:'Stop and save'}));await waitFor(()=>assert.ok(document.querySelector('.recording-item audio')),{timeout:4000});assert.equal(stopped,true,platform);const src=document.querySelector('.recording-item audio')!.getAttribute('src');const stored=await originalFetch(`${url}${src}`);assert.equal(stored.headers.get('content-type'),mime,platform);assert.equal(active,false,platform);speech.unmount();cleanup();
 }
 // Exercise iOS-style autoplay rejection: reserving is not a consumed listen.
 const listenResponse=await originalFetch(`${url}/api/a2/runs`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'exam',ref:'modell-03',focus:'Hören',mode:'exam'})});
 const listening=await listenResponse.json(),clip=listening.sections[0].parts[1].clips[0];
 const mp3=await originalFetch(`${url}${clip.audio}`);assert.ok((await mp3.arrayBuffer()).byteLength>1000);
 const originalPlay=dom.window.HTMLMediaElement.prototype.play,originalPause=dom.window.HTMLMediaElement.prototype.pause;let playCalls=0;
 dom.window.HTMLMediaElement.prototype.play=function(){playCalls++;if(playCalls===1)return Promise.reject(new dom.window.DOMException('User gesture required','NotAllowedError'));this.dispatchEvent(new dom.window.Event('playing'));return Promise.resolve();};
 dom.window.HTMLMediaElement.prototype.pause=function(){this.dispatchEvent(new dom.window.Event('pause'));};
 try{
 const context={locale:'en' as const,t:(key:Parameters<typeof translate>[0])=>translate(key,'en'),word:()=>{},dictionaryEnabled:false,capabilities:{feedback:false,transcription:false,conversation:false},refresh:async()=>{}};
 const player=render(<AppContext.Provider value={context}><ListeningPlayer clip={clip} run={listening} limit={1} attempted={false} onPlayed={()=>{}}/></AppContext.Provider>);
 fireEvent.click(screen.getByRole('button',{name:'Play audio'}));await screen.findByText('Tap again to allow playback. No playback has been consumed yet.');
 let state=await (await originalFetch(`${url}/api/a2/runs/${listening.id}`)).json();assert.equal(state.state.plays[clip.id],undefined);
 fireEvent.click(screen.getByRole('button',{name:'Play audio'}));await waitFor(async()=>{state=await (await originalFetch(`${url}/api/a2/runs/${listening.id}`)).json();assert.equal(state.state.plays[clip.id],1);});
 fireEvent.ended(document.querySelector('audio')!);assert.equal((screen.getByRole('button',{name:'Play audio'}) as HTMLButtonElement).disabled,true);assert.equal(screen.queryByRole('button',{name:'Transcript'}),null);player.unmount();
 }finally{dom.window.HTMLMediaElement.prototype.play=originalPlay;dom.window.HTMLMediaElement.prototype.pause=originalPause;}
 }finally{cleanup();globalThis.fetch=originalFetch;Object.defineProperty(globalThis,'MediaRecorder',{value:undefined,configurable:true});if(child.exitCode===null)await new Promise<void>(resolve=>{child.once('exit',()=>resolve());child.kill();});await rm(directory,{recursive:true,force:true});dom.window.close();}
});
