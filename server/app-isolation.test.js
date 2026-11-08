import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createApp} from './index.js';

test('injected databases keep independent profile and progress data',async()=>{
 const first=new DatabaseSync(':memory:'),second=new DatabaseSync(':memory:');
 const a=createApp(first).listen(0,'127.0.0.1'),b=createApp(second).listen(0,'127.0.0.1');
 try{
  await Promise.all([new Promise(r=>a.once('listening',r)),new Promise(r=>b.once('listening',r))]);
  const url=server=>`http://127.0.0.1:${server.address().port}/api`;
  const changed=await fetch(`${url(a)}/profile`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Prueba',goal:15})});assert.equal(changed.status,200);
  const other=await fetch(`${url(b)}/bootstrap`).then(r=>r.json());assert.equal(other.profile.name,'');
  const original=await fetch(`${url(a)}/bootstrap`).then(r=>r.json());assert.equal(original.profile.name,'Prueba');
 }finally{await Promise.all([new Promise(r=>a.close(r)),new Promise(r=>b.close(r))]);first.close();second.close();}
});
