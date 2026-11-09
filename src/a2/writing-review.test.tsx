import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {JSDOM} from 'jsdom';
import {ProductionReview} from './ExamResults';
import {AppContext} from './context';
import {translate} from './i18n';
import type {AppContextType,Exercise,Run} from './types';

const dom=new JSDOM('<!doctype html><html lang="es"><body></body></html>',{url:'http://localhost/'});
for(const key of ['window','document','navigator','HTMLElement','HTMLInputElement','Event','MouseEvent','KeyboardEvent','MutationObserver'])Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true,writable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const {cleanup,render,screen}=await import('@testing-library/react');

test('writing feedback UI renders all three point reviews, concrete corrections and the improved text',()=>{
 const exercise:Exercise={id:'modell-01-Schreiben-SMS',lessonId:'exam',moduleId:'exam',type:'write',skill:'Schreiben',topic:'writing-sms',difficulty:2,prompt:'Schreiben Sie eine SMS.',situation:'Ihr Fahrrad ist kaputt.',recipient:'Anna',register:'informal',range:[20,30],points:['Entschuldigen Sie sich für die Verspätung.','Erklären Sie den Grund.','Schlagen Sie eine neue Uhrzeit und einen Treffpunkt vor.'],tags:[]};
 const answer='Entchuligen für die Verspätung. Mein Auto ist kaputt. Können wir uns um 8 Uhr treffen?';
 const run:Run={id:'run-1',kind:'exam',ref:'modell-01',mode:'practice',duration:30,focus:'Schreiben',started:0,deadline:1,finished:1,serverNow:1,remaining:0,state:{ids:[exercise.id],answers:{[exercise.id]:answer},position:0,plays:{},coach:{[exercise.id]:{task:'El motivo contradice la situación y falta el lugar.',grammar:'Corrige la ortografía.',vocabulary:'Vocabulario cotidiano.',coherence:'Falta el lugar.',register:'El tono es informal.',suggestion:'Añade un lugar concreto.',corrected:'Entschuldige bitte die Verspätung. Mein Fahrrad ist kaputt. Können wir uns um 8 Uhr vor dem Bahnhof treffen?',coverage:[{point:exercise.points![0],status:'partial',evidence:'Entchuligen für die Verspätung',explanation:'La disculpa se entiende, pero contiene un error ortográfico.'},{point:exercise.points![1],status:'partial',evidence:'Mein Auto ist kaputt',explanation:'Explicas una avería, pero la consigna dice que la bicicleta está rota.'},{point:exercise.points![2],status:'partial',evidence:'um 8 Uhr',explanation:'Propones una hora, pero falta indicar el lugar.'}],errors:[{category:'spelling',original:'Entchuligen',corrected:'Entschuldigen',explanation:'La forma correcta lleva una d después de l.'}],assessment:{taskBand:'C',languageBand:'D'},orientative:true,evaluatedAnswer:answer}}},exercises:[exercise],result:null};
 const context:AppContextType={locale:'es',t:key=>translate(key,'es'),word:()=>{},dictionaryEnabled:false,capabilities:{feedback:true,feedbackProvider:'gemini',transcription:false,conversation:true},refresh:async()=>{}};
 const {container}=render(<AppContext.Provider value={context}><ProductionReview exercise={exercise} answer={answer} run={run} onUpdate={()=>{}}/></AppContext.Provider>),text=container.textContent||'';
 for(const point of exercise.points!)assert.ok(text.includes(point),point);
 for(const detail of ['falta el lugar','Entchuligen','Entschuldigen','La disculpa se entiende','Entschuldige bitte die Verspätung. Mein Fahrrad ist kaputt. Können wir uns um 8 Uhr vor dem Bahnhof treffen?'])assert.ok(text.includes(detail),detail);
 cleanup();dom.window.close();
});
