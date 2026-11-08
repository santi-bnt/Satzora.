import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import React from 'react';
import {translate} from './i18n';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost/'});
for(const key of ['window','document','navigator','HTMLElement','HTMLInputElement','HTMLTextAreaElement','Event','MouseEvent','MutationObserver'])Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true,writable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const {render,screen,fireEvent,cleanup}=await import('@testing-library/react');
const {Flashcards}=await import('./Flashcards');
const {AppContext}=await import('./context');

test('active translation mode accepts typed answer and records separate mode mastery',async()=>{
 const old=globalThis.fetch;let review:any=null;
 const card={id:'fc-test',lemma:'Termin',article:'der',plural:'Termine',es:'cita',en:'appointment',topic:'Termine',examples:['Der Termin ist morgen.','Ich verschiebe den Termin.'],cloze:{sentence:'Können wir den _____ verschieben?',answer:'Termin',hint:'Termine'},state:null,modeStats:{}};
 globalThis.fetch=async(input,options)=>{const url=String(input),body=options?.body?JSON.parse(String(options.body)):null;if(url.endsWith('/check'))return new Response(JSON.stringify({correct:body.answer==='der Termin'&&body.mode==='reverse'}),{headers:{'Content-Type':'application/json'}});if(url.endsWith('/review')){review=body;return new Response(JSON.stringify({saved:true}),{headers:{'Content-Type':'application/json'}});}return new Response(JSON.stringify({cards:[card],settings:{new_limit:10,review_limit:30},stats:{new:1,due:0,mastered:0,newToday:0,reviewedToday:0,history:[]}}),{headers:{'Content-Type':'application/json'}});};
 try{const context={locale:'en' as const,t:(key:Parameters<typeof translate>[0])=>translate(key,'en'),word:()=>{},dictionaryEnabled:true,capabilities:{feedback:false,transcription:false,conversation:false},refresh:async()=>{}};render(<AppContext.Provider value={context}><Flashcards/></AppContext.Provider>);await screen.findByText('Wortschatz');fireEvent.click(screen.getByRole('button',{name:'Reverse translation'}));fireEvent.change(screen.getByLabelText('Session'),{target:{value:'new'}});fireEvent.click(screen.getByRole('button',{name:'Start session'}));assert.ok(screen.getByText('appointment'));fireEvent.change(screen.getByLabelText('Type your answer in German'),{target:{value:'der Termin'}});fireEvent.click(screen.getByRole('button',{name:'Check answer'}));await screen.findByText('Correct');assert.ok(screen.getByText('der Termin'));fireEvent.click(screen.getByRole('button',{name:'Good'}));await screen.findByText('Session complete');assert.equal(review.mode,'reverse');assert.equal(review.correct,true);assert.equal(review.rating,'good');}finally{cleanup();globalThis.fetch=old;}
});
