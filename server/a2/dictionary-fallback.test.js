import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {DatabaseSync} from 'node:sqlite';
import {lookupWithFallback,resetDictionaryFallbackForTests} from './dictionary-fallback.js';
import {lookup,dictionary} from './dictionary.js';
import {createA2Router} from './router.js';
import {isPersistableExternalEntry} from './external-dictionary-entry.js';

const response=(payload,status=200)=>new Response(JSON.stringify(payload),{status,headers:{'Content-Type':'application/json'}});
const spanishEntry=(word='Flugzeug')=>({word,edition:'es',entries:[{senses:[{glosses:['Avión.'],tags:['neuter'],categories:['German nouns']}],forms:[{form:'Flugzeuge',tags:['plural']}]}]});
const englishEntry=(word='Mietvertrag')=>({de:[{language:'German',partOfSpeech:'Noun',definitions:[{definition:'a <a>rental agreement</a>'},{definition:'a lease'}]}]});

test('curated dictionary has the required visitors entry and conservative inflection handling',()=>{
 const visitor=lookup('Besucher');assert.equal(visitor.lemma,'Besucher');assert.equal(visitor.article,'der');assert.equal(visitor.es,'visitante');assert.equal(visitor.en,'visitor');assert.equal(visitor.plural,'Besucher');assert.equal(lookup('Besuchern')?.lemma,'Besucher');
 for(const [form,lemma] of [['liegt','liegen'],['Personen','Person'],['n\u00e4chsten','n\u00e4chste'],['erkl\u00e4rt','erkl\u00e4ren'],['Werkst\u00e4tten','Werkstatt'],['Menschen','Mensch'],['Reisep\u00e4sse','Reisepass']])assert.equal(lookup(form)?.lemma,lemma,String(form)+' => '+String(lemma));
 assert.ok(dictionary.length>140);
});

test('coverage report priorities are now available offline with verified forms and contextual Spanish examples',()=>{
 for(const [form,lemma] of [['liegt','liegen'],['Personen','Person'],['n\u00e4chsten','n\u00e4chste'],['erkl\u00e4rt','erkl\u00e4ren'],['Werkst\u00e4tten','Werkstatt'],['Menschen','Mensch'],['Reisep\u00e4sse','Reisepass']])assert.equal(lookup(form)?.lemma,lemma,String(form)+' => '+String(lemma));
 for(const lemma of ['liegen','Person','dann','Montag','Sonntag','erkl\u00e4ren','statt','Werkstatt','Donnerstag','Mitarbeiter','Bescheid','Praxis','Schwester','alt','danach','halb','Gruppe','hier','Mensch','neun','Reisepass']){const entry=lookup(lemma);assert.ok(entry?.es,`${lemma} Spanish gloss`);assert.ok(entry?.example,`${lemma} example`);}
});

test('Spanish lookup uses Spanish Wiktionary glosses, never English glosses, and keeps verified metadata only',async()=>{
 resetDictionaryFallbackForTests();let calls=0;
 const fetchImpl=async(url,options)=>{calls++;assert.match(String(url),/^https:\/\/api\.wiktapi\.dev\/v1\/es\/word\/Flugzeug\?lang=de$/);assert.ok(options.headers['User-Agent'].includes('satzivo'));return response(spanishEntry());};
 const result=await lookupWithFallback('Flugzeug',{locale:'es',fetchImpl}),again=await lookupWithFallback('Flugzeug',{locale:'es',fetchImpl});
 assert.equal(calls,1);assert.equal(result.source,'wiktionary-es');assert.equal(result.entry.es,'Avión');assert.equal(result.entry.en,'');assert.equal(result.entry.definitionLanguage,'es');assert.equal(result.entry.article,'das');assert.equal(result.entry.plural,'Flugzeuge');assert.equal(result.entry.wordType,'Nomen');assert.equal(result.entry.source.url,'https://es.wiktionary.org/wiki/Flugzeug');assert.equal(result.entry.source.license,'CC BY-SA 4.0');assert.deepEqual(again,result);
});

test('German Wiktionary translation tables provide Spanish only when the translation sense matches a German gloss',async()=>{
 resetDictionaryFallbackForTests();const sense='Vereinbarung zu den Bedingungen einer vorübergehenden Nutzung einer Wohnung gegen Zahlung eines Entgelts';let calls=[];
 const translations={word:'Mietvertrag',edition:'de',translations:[{lang_code:'de',pos:'Noun',translations:[{lang_code:'es',word:'contrato de arrendamiento',sense}]}]};
 const german={word:'Mietvertrag',edition:'de',entries:[{forms:[{form:'Mietvertrag',tags:['nominative','singular'],article:'der'},{form:'Mietverträge',tags:['nominative','plural']}],senses:[{glosses:[sense],examples:[{text:'Wir haben den Mietvertrag unterschrieben.'}]}]}]};
 const fetchImpl=async url=>{const value=String(url);calls.push(value);if(value.includes('/v1/es/'))return response({},404);if(value.includes('/translations'))return response(translations);if(value.includes('/v1/de/word/Mietvertrag?'))return response(german);throw Error('unexpected source');};
 const result=await lookupWithFallback('Mietvertrag',{locale:'es',fetchImpl});assert.equal(result.source,'wiktionary-de');assert.equal(result.entry.es,'contrato de arrendamiento');assert.equal(result.entry.article,'der');assert.equal(result.entry.plural,'Mietverträge');assert.equal(result.entry.wordType,'Nomen');assert.equal(result.entry.example,'Wir haben den Mietvertrag unterschrieben.');assert.equal(result.entry.definitionLanguage,'es');assert.equal(calls.length,3);
 resetDictionaryFallbackForTests();const wrong={...translations,translations:[{...translations.translations[0],translations:[{lang_code:'es',word:'contrato de arrendamiento',sense:'persona que alquila una vivienda'}]}]};
 const rejected=await lookupWithFallback('Mietvertrag',{locale:'es',fetchImpl:async url=>{const value=String(url);if(value.includes('/v1/es/'))return response({},404);if(value.includes('/translations'))return response(wrong);if(value.includes('/v1/de/word/Mietvertrag?'))return response(german);return response(englishEntry());}});assert.equal(rejected.entry.es,'');assert.equal(rejected.source,'wiktionary-en');
});

test('external Wiktionary entries can be saved locally and reappear as owned flashcards',async()=>{
 resetDictionaryFallbackForTests();const db=new DatabaseSync(':memory:'),app=express();app.use(express.json());app.use('/api/a2',createA2Router(db,()=>{},()=>new Date().toISOString().slice(0,10)));const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 const entry={id:'dict-ext-de-mietvertrag',lemma:'Mietvertrag',es:'contrato de arrendamiento',en:'lease',article:'der',plural:'Mietverträge',wordType:'Nomen',example:'Wir haben den Mietvertrag unterschrieben.',exampleEs:'Firmamos el contrato de arrendamiento.',forms:['Mietvertrag','Mietverträge'],definitions:['contrato de arrendamiento'],definitionLanguage:'es',source:{name:'Wiktionary alemán (WiktAPI)',url:'https://de.wiktionary.org/wiki/Mietvertrag',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'}};
 try{const base=`http://127.0.0.1:${server.address().port}/api/a2`;const saved=await fetch(`${base}/vocabulary`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:entry.id,sentence:'Ich unterschreibe morgen den Mietvertrag.',entry})});assert.equal(saved.status,200);const cards=await fetch(`${base}/flashcards`);assert.equal(cards.status,200);const card=(await cards.json()).cards.find(item=>item.id===entry.id);assert.equal(card.lemma,'Mietvertrag');assert.equal(card.es,'contrato de arrendamiento');assert.equal(card.article,'der');assert.equal(card.personal,true);assert.equal(card.source,'Ich unterschreibe morgen den Mietvertrag.');assert.equal(isPersistableExternalEntry(entry),true);assert.equal(isPersistableExternalEntry({...entry,source:{...entry.source,url:'https://attacker.invalid/wiki/Mietvertrag'}}),false);
 const rejected=await fetch(`${base}/vocabulary`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:entry.id,entry:{...entry,source:{...entry.source,url:'javascript:alert(1)'}}})});assert.equal(rejected.status,400);
 }finally{server.close();db.close();}
});

test('a Spanish miss falls back to a clearly English-only definition, and caches remain locale-specific',async()=>{
 resetDictionaryFallbackForTests();let spanishCalls=0,englishCalls=0;
 const fetchImpl=async(url)=>{if(String(url).startsWith('https://api.wiktapi.dev/')){spanishCalls++;return response({},404);}englishCalls++;assert.match(String(url),/api\/rest_v1\/page\/definition\/Mietvertrag/);return response(englishEntry());};
 const spanish=await lookupWithFallback('Mietvertrag',{locale:'es',fetchImpl}),spanishAgain=await lookupWithFallback('Mietvertrag',{locale:'es',fetchImpl});
 assert.equal(spanishCalls,2);assert.equal(englishCalls,1);assert.equal(spanish.source,'wiktionary-en');assert.equal(spanish.entry.es,'');assert.equal(spanish.entry.en,'a rental agreement');assert.equal(spanish.entry.definitionLanguage,'en');assert.equal(spanish.entry.wordType,'Nomen');assert.deepEqual(spanishAgain,spanish);
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
  const english=await oldFetch(`${base}/dictionary?word=Mietvertrag&locale=en`);assert.equal((await english.json()).entry.en,'a rental agreement');assert.equal(spanishCalls,3);assert.equal(englishCalls,2);
 }finally{globalThis.fetch=oldFetch;server.close();db.close();}
});
