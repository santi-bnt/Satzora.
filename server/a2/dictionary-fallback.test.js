import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {DatabaseSync} from 'node:sqlite';
import {lookupWithFallback,resetDictionaryFallbackForTests} from './dictionary-fallback.js';
import {lookup,dictionary} from './dictionary.js';
import {createA2Router} from './router.js';

const response=(payload,status=200)=>new Response(JSON.stringify(payload),{status,headers:{'Content-Type':'application/json'}});
const spanishEntry=(word='Flugzeug')=>({word,edition:'es',entries:[{senses:[{glosses:['Avión.'],tags:['neuter'],categories:['German nouns']}],forms:[{form:'Flugzeuge',tags:['plural']}]}]});
const englishEntry=(word='Mietvertrag')=>({de:[{language:'German',partOfSpeech:'Noun',definitions:[{definition:'a <a>rental agreement</a>'},{definition:'a lease'}]}]});

test('curated dictionary has the required visitors entry and conservative inflection handling',()=>{
 const visitor=lookup('Besucher');assert.equal(visitor.lemma,'Besucher');assert.equal(visitor.article,'der');assert.equal(visitor.es,'visitante');assert.equal(visitor.en,'visitor');assert.equal(visitor.plural,'Besucher');assert.equal(lookup('Besuchern')?.lemma,'Besucher');
 for(const [form,lemma] of [['Tische','Tisch'],['Häuser','Haus'],['Kindern','Kind'],['gehofft','hoffen'],['gegangen','gehen'],['fährt','fahren'],['kleinen','klein']])assert.equal(lookup(form)?.lemma||null,lemma,`${form} => ${lemma}`);
 assert.ok(dictionary.length>140);
});

test('Spanish lookup uses Spanish Wiktionary glosses, never English glosses, and keeps verified metadata only',async()=>{
 resetDictionaryFallbackForTests();let calls=0;
 const fetchImpl=async(url,options)=>{calls++;assert.match(String(url),/^https:\/\/api\.wiktapi\.dev\/v1\/es\/word\/Flugzeug\?lang=de$/);assert.ok(options.headers['User-Agent'].includes('satzivo'));return response(spanishEntry());};
 const result=await lookupWithFallback('Flugzeug',{locale:'es',fetchImpl}),again=await lookupWithFallback('Flugzeug',{locale:'es',fetchImpl});
 assert.equal(calls,1);assert.equal(result.source,'wiktionary-es');assert.equal(result.entry.es,'Avión');assert.equal(result.entry.en,'');assert.equal(result.entry.definitionLanguage,'es');assert.equal(result.entry.article,'das');assert.equal(result.entry.plural,'Flugzeuge');assert.equal(result.entry.wordType,'Nomen');assert.equal(result.entry.source.url,'https://es.wiktionary.org/wiki/Flugzeug');assert.equal(result.entry.source.license,'CC BY-SA 4.0');assert.deepEqual(again,result);
});

test('a Spanish miss falls back to a clearly English-only definition, and caches remain locale-specific',async()=>{
 resetDictionaryFallbackForTests();let spanishCalls=0,englishCalls=0;
 const fetchImpl=async(url)=>{if(String(url).startsWith('https://api.wiktapi.dev/')){spanishCalls++;return response({},404);}englishCalls++;assert.match(String(url),/api\/rest_v1\/page\/definition\/Mietvertrag/);return response(englishEntry());};
 const spanish=await lookupWithFallback('Mietvertrag',{locale:'es',fetchImpl}),spanishAgain=await lookupWithFallback('Mietvertrag',{locale:'es',fetchImpl});
 assert.equal(spanishCalls,1);assert.equal(englishCalls,1);assert.equal(spanish.source,'wiktionary-en');assert.equal(spanish.entry.es,'');assert.equal(spanish.entry.en,'a rental agreement');assert.equal(spanish.entry.definitionLanguage,'en');assert.equal(spanish.entry.wordType,'Nomen');assert.deepEqual(spanishAgain,spanish);
 const english=await lookupWithFallback('Mietvertrag',{locale:'en',fetchImpl});assert.equal(englishCalls,2);assert.equal(english.entry.en,'a rental agreement');
});

test('fallback distinguishes no entry from network failure and enforces per-source timeout',async()=>{
 resetDictionaryFallbackForTests();const missing=await lookupWithFallback('satzivonotaword',{locale:'es',fetchImpl:async()=>response({},404)});assert.equal(missing.status,'not_found');
 resetDictionaryFallbackForTests();const failed=await lookupWithFallback('anotherunknown',{locale:'es',fetchImpl:async()=>{throw new TypeError('network');}});assert.equal(failed.status,'unavailable');
 resetDictionaryFallbackForTests();const timed=await lookupWithFallback('timeoutword',{locale:'es',timeoutMs:5,fetchImpl:(_url,{signal})=>new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted'))))});assert.equal(timed.status,'unavailable');
});

test('dictionary HTTP route returns local data, language-specific external results, and English fallback transparently',async()=>{
 const db=new DatabaseSync(':memory:'),app=express();app.use(express.json());app.use('/api/a2',createA2Router(db,()=>{},()=>new Date().toISOString().slice(0,10)));const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));const oldFetch=globalThis.fetch;
 try{
  resetDictionaryFallbackForTests();let spanishCalls=0,englishCalls=0;
  globalThis.fetch=async(url,options={})=>{const address=String(url);if(address.startsWith('https://api.wiktapi.dev/')){assert.equal(options.headers['User-Agent'].startsWith('satzivo/'),true);spanishCalls++;return address.includes('/Flugzeug?')?response(spanishEntry()):response({},404);}if(address.includes('en.wiktionary.org')){assert.equal(options.headers['User-Agent'].startsWith('satzivo/'),true);englishCalls++;return response(englishEntry());}return oldFetch(url,options);};
  const base=`http://127.0.0.1:${server.address().port}/api/a2`,local=await oldFetch(`${base}/dictionary?word=Besucher&locale=es`),visitor=(await local.json()).entry;assert.equal(local.status,200);assert.equal(visitor.article,'der');assert.equal(visitor.es,'visitante');assert.equal(visitor.en,'visitor');assert.equal(visitor.plural,'Besucher');
  const spanish=await oldFetch(`${base}/dictionary?word=Flugzeug&locale=es`),spanishBody=await spanish.json();assert.equal(spanishBody.entry.es,'Avión');assert.equal(spanishBody.entry.en,'');assert.equal(spanishBody.source,'wiktionary-es');
  const noSpanish=await oldFetch(`${base}/dictionary?word=Mietvertrag&locale=es`),noSpanishBody=await noSpanish.json();assert.equal(noSpanishBody.entry.es,'');assert.equal(noSpanishBody.entry.en,'a rental agreement');assert.equal(noSpanishBody.entry.definitionLanguage,'en');
  const english=await oldFetch(`${base}/dictionary?word=Mietvertrag&locale=en`);assert.equal((await english.json()).entry.en,'a rental agreement');assert.equal(spanishCalls,2);assert.equal(englishCalls,2);
 }finally{globalThis.fetch=oldFetch;server.close();db.close();}
});
