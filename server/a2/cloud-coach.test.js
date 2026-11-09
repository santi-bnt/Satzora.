import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {createCloudStudyRouter} from '../cloud/study.js';
import {examModels} from './exams.js';

test('authenticated cloud study route returns a saved identical writing evaluation without another provider call',async()=>{
 const originalFetch=globalThis.fetch,previous=Object.fromEntries(['OPENAI_API_KEY','OPENAI_TEXT_MODEL','A2_AI_PROVIDER'].map(key=>[key,process.env[key]]));
 process.env.OPENAI_API_KEY='test-only-key';process.env.OPENAI_TEXT_MODEL='test-writing-model';process.env.A2_AI_PROVIDER='openai';
 const exercise=examModels[0].sections.find(section=>section.id==='Schreiben').parts[0].questions[0],answer='Entschuldige bitte. Mein Fahrrad ist kaputt. Treffen wir uns um acht Uhr vor dem Kino?';
 const row={id:'ea8f6f01-e7d8-4ff8-a00f-8d9dfcc53d08',user_id:'test-user',kind:'exam',ref:'modell-01',mode:'practice',focus:'Schreiben',started_at:new Date(Date.now()-60000).toISOString(),deadline:new Date(Date.now()+1800000).toISOString(),finished_at:new Date().toISOString(),revision:0,state:{ids:[exercise.id],answers:{[exercise.id]:answer},coach:{},assessments:{}},result:{}};
 let providerCalls=0,rpcCalls=0;
 globalThis.fetch=async(url,options)=>{if(!String(url).startsWith('https://api.openai.com/'))return originalFetch(url,options);providerCalls++;assert.equal(url,'https://api.openai.com/v1/responses');const input=JSON.parse(JSON.parse(options.body).input),coverage=input.requiredPoints.map((point,index)=>({point,status:'fulfilled',evidence:['Entschuldige bitte','Mein Fahrrad ist kaputt','um acht Uhr vor dem Kino'][index],explanation:'Der Inhalt ist vorhanden.'}));return new Response(JSON.stringify({output:[{content:[{type:'output_text',text:JSON.stringify({task:'Punkte erfüllt.',grammar:'A2 verständlich.',vocabulary:'Passend.',coherence:'Klar.',register:'Informell.',suggestion:'Gut gemacht.',corrected:answer,coverage,assessment:{taskBand:'A',languageBand:'B'},errors:[]})}]}]}),{status:200});};
 const makeClient=(_url,_key,options={})=>{
  if(!options.global?.headers?.Authorization)return {auth:{async getUser(token){return {data:{user:token==='valid-token'?{id:row.user_id}:null},error:token==='valid-token'?null:new Error('invalid')};}}};
  return {
   from(table){let id;const query={select(){return query;},eq(column,value){if(column==='id')id=value;return query;},async maybeSingle(){return {data:table==='dl_sessions'&&id===row.id?structuredClone(row):null,error:null};}};return query;},
   async rpc(name,args){rpcCalls++;assert.equal(name,'dl_update_finished_session_state');if(args.p_expected_revision!==row.revision)return {data:false,error:null};row.state=args.p_state;row.revision++;return {data:true,error:null};}
  };
 };
 const app=express();app.use(express.json());app.use('/api/a2/cloud-study',createCloudStudyRouter({url:'https://project.supabase.co',key:'public-test-key',makeClient}));const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 try{const url=`http://127.0.0.1:${server.address().port}/api/a2/cloud-study/runs/${row.id}/coach`,post=(revision,text=answer)=>fetch(url,{method:'POST',headers:{Authorization:'Bearer valid-token','Content-Type':'application/json'},body:JSON.stringify({exerciseId:exercise.id,answer:text,locale:'es',revision})});let response=await post(0);assert.equal(response.status,200);const first=await response.json();assert.equal(first.revision,1);assert.equal(providerCalls,1);assert.equal(rpcCalls,1);response=await post(1);assert.equal(response.status,200);const second=await response.json();assert.equal(second.revision,1);assert.equal(second.evaluatedAnswer,answer);assert.equal(providerCalls,1,'the saved exact answer is not sent to the provider twice');assert.equal(rpcCalls,1,'a cached retry does not write a duplicate review');const revisedAnswer=`${answer} Danke fürs Warten.`;response=await post(1,revisedAnswer);assert.equal(response.status,200);const revised=await response.json();assert.equal(revised.evaluatedAnswer,revisedAnswer);assert.equal(providerCalls,2,'a changed answer is sent for a fresh evaluation');assert.equal(rpcCalls,2);assert.equal(row.state.coach[exercise.id].evaluatedAnswer,revisedAnswer);}
 finally{await new Promise(resolve=>server.close(resolve));globalThis.fetch=originalFetch;for(const [key,value] of Object.entries(previous))if(value===undefined)delete process.env[key];else process.env[key]=value;}
});
