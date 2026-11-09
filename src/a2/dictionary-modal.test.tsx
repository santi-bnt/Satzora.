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
 try{render(<Harness/>);fireEvent.click(screen.getByRole('button',{name:'Besucher'}));await screen.findByText('Besucher',{selector:'h2'});assert.ok(screen.getByText('der'));assert.ok(screen.getByText('visitante'));assert.ok(screen.getByText('visitor'));assert.ok(screen.getByText('Plural:'));assert.equal(screen.getAllByText('Vor dem Haus warten zwei Besucher.').length,2);assert.equal(calls.length,1);assert.equal(document.querySelectorAll('.a2-modal').length,1);}finally{cleanup();globalThis.fetch=previous;dom.window.close();}
});

test('external English-only results never masquerade as Spanish, and changing locale fetches the requested gloss',async()=>{
 const previous=globalThis.fetch,requests:string[]=[];let setLocale:(locale:'es'|'en')=>void=()=>{};
 globalThis.fetch=async(input)=>{const url=String(input);requests.push(url);if(url.includes('locale=es'))return new Response(JSON.stringify({entry:{id:'wiktionary-en-de-mietvertrag',lemma:'Mietvertrag',es:'',en:'lease agreement',definitions:['lease agreement'],definitionLanguage:'en',example:'',article:'',source:{name:'Wiktionary',url:'https://en.wiktionary.org/wiki/Mietvertrag',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'}},source:'wiktionary-en',status:'found'}),{status:200,headers:{'Content-Type':'application/json'}});return new Response(JSON.stringify({entry:{id:'wiktionary-en-de-mietvertrag',lemma:'Mietvertrag',es:'',en:'lease agreement',definitions:['lease agreement'],definitionLanguage:'en',example:'',article:'',source:{name:'Wiktionary',url:'https://en.wiktionary.org/wiki/Mietvertrag',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'}},source:'wiktionary-en',status:'found'}),{status:200,headers:{'Content-Type':'application/json'}});};
 function Harness(){const [locale,changeLocale]=useState<'es'|'en'>('es');setLocale=changeLocale;return <AppContext.Provider value={{locale,t:key=>translate(key,locale),word:()=>{},dictionaryEnabled:true,capabilities:{feedback:false,feedbackProvider:null,transcription:false,conversation:false},refresh:async()=>{}}}><Dictionary word="Mietvertrag" sentence="Ich unterschreibe morgen den Mietvertrag." data={{savedWords:[]} as never} onClose={()=>{}} onSaved={()=>{}}/></AppContext.Provider>;}
 try{render(<Harness/>);assert.ok(await screen.findByText('Traducción al español no disponible.'));assert.ok(screen.getByText('Definición en inglés:'));assert.ok(screen.getByText('lease agreement'));assert.ok(screen.getByText('Ich unterschreibe morgen den Mietvertrag.'));await import('@testing-library/react').then(({act})=>act(()=>setLocale('en')));await screen.findByText('English Wiktionary definition. External entries are not saved to flashcards yet.');assert.ok(requests.some(url=>url.includes('locale=es')));assert.ok(requests.some(url=>url.includes('locale=en')));assert.equal(requests.length,2);}finally{cleanup();globalThis.fetch=previous;}
});
