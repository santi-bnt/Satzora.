import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {JSDOM} from 'jsdom';
import {writingActivities} from '../../server/a2/bank-writing.js';
import type {Exercise,Run} from './types';
const dom=new JSDOM('<!doctype html><html lang="es"><body></body></html>',{url:'http://localhost/'});
for(const key of ['window','document','navigator','HTMLElement','HTMLInputElement','Event','MouseEvent','KeyboardEvent','MutationObserver','localStorage','location'])Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true,writable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const {render,screen,fireEvent,waitFor,cleanup}=await import('@testing-library/react');
const {RunView}=await import('./RunView');
const {AppContext}=await import('./context');
const {translate}=await import('./i18n');

test('RunView practice keeps structured SMS and email points visible while writing and preserves answers through navigation/reload',async()=>{
 const sms=writingActivities.find(a=>a.part.questions[0].writingType==='sms')!.part.questions[0] as Exercise,email=writingActivities.find(a=>a.part.questions[0].writingType==='email')!.part.questions[0] as Exercise;
 const now=Date.now(),stored:Record<string,string>={},originalFetch=globalThis.fetch;
 globalThis.fetch=async(input,options={})=>{assert.match(String(input),/\/api\/a2\/runs\/run-writing-ui$/);assert.equal(options.method,'PUT');Object.assign(stored,JSON.parse(String(options.body)).answers);return new Response(JSON.stringify({saved:true}),{status:200,headers:{'Content-Type':'application/json'}});};
 const context={locale:'es' as const,t:(key:Parameters<typeof translate>[0])=>translate(key,'es'),word:()=>{},dictionaryEnabled:true,capabilities:{feedback:false,feedbackProvider:null,transcription:false,conversation:false},refresh:async()=>{}};
 const makeRun=(answers:Record<string,string>={},position=0):Run=>({id:'run-writing-ui',kind:'activity',ref:'writing-bank',mode:'practice',duration:15,focus:'Schreiben',started:now-1000,deadline:now+900000,finished:null,serverNow:now,remaining:900,state:{ids:[sms.id,email.id],answers,position,plays:{},coach:{},dialogue:[]},exercises:[sms,email],result:null});
 const verifyTask=(exercise:Exercise,format:string,range:RegExp)=>{assert.equal(document.querySelector('.writing-situation')?.textContent,exercise.situation);assert.ok(document.querySelector('.writing-format-instruction')?.textContent?.includes(format));assert.equal(document.querySelectorAll('.writing-task-points li').length,3);assert.equal(document.querySelectorAll('.writing-task-points h4').length,1);for(const point of exercise.points!)assert.ok(document.querySelector('.writing-task-points')?.textContent?.includes(point));const lengthText=document.querySelector('.writing-length-instruction')?.textContent||'';assert.match(lengthText,range);assert.doesNotMatch(lengthText,/Schreiben Sie zu allen drei Punkten/i);assert.equal(document.querySelector('.exercise-prompt'),null);};
 try{
  const view=render(<AppContext.Provider value={context}><RunView initial={makeRun()} onExit={()=>{}} onFinished={()=>{}}/></AppContext.Provider>);
  verifyTask(sms,'SMS',/20.{1,3}30 W.?rter/);assert.ok(screen.getByText('Schreiben Sie zu allen drei Punkten:'));
  const smsAnswer='Hallo Anna, es tut mir leid. Mein Fahrrad ist kaputt. Treffen wir uns um sechs vor dem Bahnhof?';fireEvent.change(screen.getByRole('textbox'),{target:{value:smsAnswer}});assert.equal(document.querySelectorAll('.writing-task-points li').length,3);
  fireEvent.click(screen.getByRole('button',{name:'Siguiente'}));await waitFor(()=>assert.equal(document.querySelector('.writing-situation')?.textContent,email.situation));verifyTask(email,'E-Mail',/30.{1,3}40 W.?rter/);
  const emailAnswer='Guten Tag, Frau Braun, vielen Dank. Ich besuche den Kurs. Können Sie mir bitte den Termin bestätigen? Freundliche Grüße';fireEvent.change(screen.getByRole('textbox'),{target:{value:emailAnswer}});fireEvent.click(screen.getByRole('button',{name:'Anterior'}));await waitFor(()=>assert.equal((screen.getByRole('textbox') as HTMLTextAreaElement).value,smsAnswer));verifyTask(sms,'SMS',/20.{1,3}30 W.?rter/);
  fireEvent.click(screen.getByRole('button',{name:'Siguiente'}));await waitFor(()=>assert.equal((screen.getByRole('textbox') as HTMLTextAreaElement).value,emailAnswer));await waitFor(()=>assert.equal(stored[sms.id],smsAnswer));await waitFor(()=>assert.equal(stored[email.id],emailAnswer));
  view.unmount();render(<AppContext.Provider value={context}><RunView initial={makeRun(stored,1)} onExit={()=>{}} onFinished={()=>{}}/></AppContext.Provider>);assert.equal((screen.getByRole('textbox') as HTMLTextAreaElement).value,emailAnswer);verifyTask(email,'E-Mail',/30.{1,3}40 W.?rter/);
 }finally{cleanup();globalThis.fetch=originalFetch;dom.window.close();}
});
