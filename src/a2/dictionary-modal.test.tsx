import test from 'node:test';
import assert from 'node:assert/strict';
import React,{useState} from 'react';
import {JSDOM} from 'jsdom';
import {lookup} from '../../server/a2/dictionary.js';
const dom=new JSDOM('<!doctype html><html lang="es"><body></body></html>',{url:'http://localhost/'});
for(const key of ['window','document','navigator','HTMLElement','HTMLInputElement','Event','MouseEvent','KeyboardEvent','MutationObserver','localStorage'])Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true,writable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const {render,screen,fireEvent,cleanup}=await import('@testing-library/react');
const {AppContext,German}=await import('./context');
const {Dictionary}=await import('./A2App');
const {translate}=await import('./i18n');

test('a word selected in a real German lesson opens the compact modal with the dictionary API entry',async()=>{
 const previous=globalThis.fetch,calls:{method?:string;url?:string}[]=[];
 globalThis.fetch=async(input,options={})=>{const url=typeof input==='string'?input:'';calls.push({method:options.method,url});assert.equal(options.method||'GET','GET');assert.match(url,/api\/a2\/dictionary\?word=Besucher/);const entry=lookup('Besucher');return new Response(JSON.stringify({entry,source:'local',status:'found'}),{status:200,headers:{'Content-Type':'application/json'}});};
 function Harness(){const [word,setWord]=useState<string|null>(null);return <AppContext.Provider value={{locale:'es',t:key=>translate(key,'es'),word:chosen=>setWord(chosen),dictionaryEnabled:true,capabilities:{feedback:false,feedbackProvider:null,transcription:false,conversation:false},refresh:async()=>{}}}><p><German text="Vor dem Haus warten zwei Besucher."/></p>{word&&<Dictionary word={word} sentence="Vor dem Haus warten zwei Besucher." data={{savedWords:[]} as never} onClose={()=>setWord(null)} onSaved={()=>{}}/>}</AppContext.Provider>;}
 try{render(<Harness/>);fireEvent.click(screen.getByRole('button',{name:'Besucher'}));await screen.findByText('Besucher',{selector:'h2'});assert.ok(screen.getByText('der'));assert.ok(screen.getByText('visitante'));assert.ok(screen.getByText('visitor'));assert.ok(screen.getByText('Plural:'));assert.ok(screen.getByText('Vor dem Haus warten zwei Besucher.'));assert.equal(calls.length,1);assert.equal(document.querySelectorAll('.a2-modal').length,1);}finally{cleanup();globalThis.fetch=previous;dom.window.close();}
});
