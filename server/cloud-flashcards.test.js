import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {createCloudFlashcardRouter} from './cloud/flashcards.js';
import {dictionary} from './a2/dictionary.js';

test('cloud vocabulary verifies the token and uses its subject for writes',async()=>{
 const writes=[];
 const makeClient=(_url,_key,options)=>options.global?{
  from(table){assert.equal(table,'dl_saved_words');return {upsert(row){writes.push({row,authorization:options.global.headers.Authorization});return Promise.resolve({error:null});}};}
 }:{auth:{getUser:async token=>token==='valid'?{data:{user:{id:'verified-user'}},error:null}:{data:{user:null},error:new Error('invalid')}}};
 const app=express();app.use(express.json());app.use('/cloud',createCloudFlashcardRouter({url:'https://example.supabase.co',key:'public-test',makeClient}));
 const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 try{
  const url=`http://127.0.0.1:${server.address().port}/cloud/vocabulary`;
  const body=JSON.stringify({id:dictionary[0].id,sentence:'Ein Beispiel.',user_id:'other-user'});
  const invalid=await fetch(url,{method:'POST',headers:{authorization:'Bearer invalid','content-type':'application/json'},body});
  assert.equal(invalid.status,401);assert.equal(writes.length,0);
  const valid=await fetch(url,{method:'POST',headers:{authorization:'Bearer valid','content-type':'application/json'},body});
  assert.equal(valid.status,200);assert.equal(writes.length,1);assert.equal(writes[0].row.user_id,'verified-user');assert.equal(writes[0].authorization,'Bearer valid');
 }finally{await new Promise(resolve=>server.close(resolve));}
});

test('external dictionary cards are stored using the verified owner and require licensed source metadata',async()=>{
 const writes=[];const entry={id:'dict-ext-de-mietvertrag',lemma:'Mietvertrag',es:'contrato de arrendamiento',en:'lease',article:'der',plural:'Mietverträge',wordType:'Nomen',example:'Wir haben den Mietvertrag unterschrieben.',forms:['Mietvertrag','Mietverträge'],definitions:['contrato de arrendamiento'],definitionLanguage:'es',source:{name:'Wiktionary alemán (WiktAPI)',url:'https://de.wiktionary.org/wiki/Mietvertrag',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'}};
 const makeClient=(_url,_key,options)=>options.global?{from(table){assert.equal(table,'dl_dictionary_cards');return {upsert(row){writes.push({row,authorization:options.global.headers.Authorization});return Promise.resolve({error:null});}};}}:{auth:{getUser:async token=>token==='valid'?{data:{user:{id:'verified-user'}},error:null}:{data:{user:null},error:new Error('invalid')}}};
 const app=express();app.use(express.json());app.use('/cloud',createCloudFlashcardRouter({url:'https://example.supabase.co',key:'public-test',makeClient}));const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 try{const url=`http://127.0.0.1:${server.address().port}/cloud/vocabulary`,response=await fetch(url,{method:'POST',headers:{authorization:'Bearer valid','content-type':'application/json'},body:JSON.stringify({id:entry.id,entry,sentence:'Ich unterschreibe den Mietvertrag.',user_id:'attacker-selected-user'})});assert.equal(response.status,200);assert.equal(writes.length,1);assert.equal(writes[0].row.user_id,'verified-user');assert.equal(writes[0].row.card_id,entry.id);assert.equal(writes[0].row.entry.es,'contrato de arrendamiento');assert.equal(writes[0].authorization,'Bearer valid');
 const invalid=await fetch(url,{method:'POST',headers:{authorization:'Bearer valid','content-type':'application/json'},body:JSON.stringify({id:entry.id,entry:{...entry,source:{...entry.source,url:'https://evil.invalid/wiki/Mietvertrag'}}})});assert.equal(invalid.status,400);assert.equal(writes.length,1);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
