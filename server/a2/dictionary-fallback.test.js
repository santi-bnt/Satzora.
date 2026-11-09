import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {DatabaseSync} from 'node:sqlite';
import {lookupWithFallback,resetDictionaryFallbackForTests} from './dictionary-fallback.js';
import {lookup,dictionary} from './dictionary.js';
import {createA2Router} from './router.js';

test('curated dictionary has the required visitors entry and conservative inflection handling',()=>{
 const visitor=lookup('Besucher');assert.equal(visitor.lemma,'Besucher');assert.equal(visitor.article,'der');assert.equal(visitor.es,'visitante');assert.equal(visitor.en,'visitor');assert.equal(visitor.plural,'Besucher');assert.equal(lookup('Besuchern')?.lemma,'Besucher');
 for(const [form,lemma] of [['Tische','Tisch'],['Häuser','Haus'],['Kindern','Kind'],['gehofft','hoffen'],['gegangen','gehen'],['fährt','fahren'],['kleinen','klein']])assert.equal(lookup(form)?.lemma||null,lemma,`${form} => ${lemma}`);
 assert.ok(dictionary.length>140);
});

test('Wiktionary fallback parses a German entry, attributes it and caches duplicate queries',async()=>{
 resetDictionaryFallbackForTests();let calls=0;const fetchImpl=async(url,options)=>{calls++;assert.match(url,/api\/rest_v1\/page\/definition\/Mietvertrag/);assert.ok(options.headers['User-Agent'].includes('satzivo'));return new Response(JSON.stringify({de:[{language:'German',partOfSpeech:'Noun',definitions:[{definition:'a <a>rental agreement</a>'},{definition:'a lease'}]}]}),{status:200});};
 const first=await lookupWithFallback('Mietvertrag',{fetchImpl}),second=await lookupWithFallback('Mietvertrag',{fetchImpl});assert.equal(calls,1);assert.equal(first.source,'wiktionary');assert.equal(first.entry.en,'a rental agreement');assert.equal(first.entry.es,'');assert.equal(first.entry.wordType,'Nomen');assert.equal(first.entry.source.license,'CC BY-SA 4.0');assert.deepEqual(second,first);
});

test('fallback distinguishes missing words from network failure and applies request timeout',async()=>{
 resetDictionaryFallbackForTests();const missing=await lookupWithFallback('satzivonotaword',{fetchImpl:async()=>new Response('{}',{status:404})});assert.equal(missing.status,'not_found');
 resetDictionaryFallbackForTests();const failed=await lookupWithFallback('anotherunknown',{fetchImpl:async()=>{throw new TypeError('network');}});assert.equal(failed.status,'unavailable');
 resetDictionaryFallbackForTests();const timed=await lookupWithFallback('timeoutword',{timeoutMs:5,fetchImpl:(_url,{signal})=>new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted'))))});assert.equal(timed.status,'unavailable');
});

test('dictionary HTTP route returns the entry and uses the Wiktionary fallback for unresolved local terms',async()=>{
 const db=new DatabaseSync(':memory:'),app=express();app.use(express.json());app.use('/api/a2',createA2Router(db,()=>{},()=>new Date().toISOString().slice(0,10)));const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));const oldFetch=globalThis.fetch;
 try{resetDictionaryFallbackForTests();let calls=0;globalThis.fetch=async(url,options)=>{if(!String(url).includes('en.wiktionary.org'))return oldFetch(url,options);calls++;assert.match(String(url),/api\/rest_v1\/page\/definition\/Mietvertrag/);assert.equal(options.headers['User-Agent'].startsWith('satzivo/'),true);return new Response(JSON.stringify({de:[{language:'German',partOfSpeech:'Noun',definitions:[{definition:'rental agreement'}]}]}),{status:200});};
  const base=`http://127.0.0.1:${server.address().port}/api/a2`,local=await fetch(`${base}/dictionary?word=Besucher`),visitor=(await local.json()).entry;assert.equal(local.status,200);assert.equal(visitor.article,'der');assert.equal(visitor.es,'visitante');assert.equal(visitor.en,'visitor');assert.equal(visitor.plural,'Besucher');
  const first=await fetch(`${base}/dictionary?word=Mietvertrag`),second=await fetch(`${base}/dictionary?word=Mietvertrag`);assert.equal(first.status,200);assert.equal((await first.json()).entry.en,'rental agreement');assert.equal((await second.json()).source,'wiktionary');assert.equal(calls,1);
 }finally{globalThis.fetch=oldFetch;server.close();db.close();}
});
