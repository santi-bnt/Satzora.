import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createServer} from 'node:http';
import {createApp} from './index.js';

test('Vercel blocks shared SQLite study data while retaining public A2 content and authenticated route handling',async()=>{
 const previous=process.env.VERCEL;process.env.VERCEL='1';const db=new DatabaseSync(':memory:');const server=createServer(createApp(db));
 try{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}/api`;
  const blocked=await fetch(`${base}/a2/bootstrap`);assert.equal(blocked.status,401);assert.equal((await blocked.json()).error,'sign_in_required');
  const blockedWrite=await fetch(`${base}/a2/profile`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Test',goal:15})});assert.equal(blockedWrite.status,401);
  const content=await fetch(`${base}/a2/dictionary?word=Termin`);assert.equal(content.status,200);
  const cloud=await fetch(`${base}/a2/cloud-study/base`);assert.equal(cloud.status,401);assert.notEqual((await cloud.json()).error,'sign_in_required');
 }finally{await new Promise(resolve=>server.close(resolve));db.close();if(previous===undefined)delete process.env.VERCEL;else process.env.VERCEL=previous;}
});

test('Vercel catch-all entrypoint is an Express handler and applies the guest guard',async()=>{
 const previous=process.env.VERCEL;process.env.VERCEL='1';let server;
 try{const {default:handler}=await import('../api/[...path].js');server=createServer(handler);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}/api`;
  assert.equal((await fetch(`${base}/a2/bootstrap`)).status,401);assert.equal((await fetch(`${base}/a2/lessons/m01-verbposition`)).status,200);
 }finally{if(server)await new Promise(resolve=>server.close(resolve));if(previous===undefined)delete process.env.VERCEL;else process.env.VERCEL=previous;}
});
