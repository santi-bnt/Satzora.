import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
process.loadEnvFile('../.env.local');
const url=process.env.VITE_SUPABASE_URL,key=process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
async function login(name){const c=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});const {data,error}=await c.auth.signInWithPassword({email:process.env[`SATZORA_TEST_${name}_EMAIL`],password:process.env[`SATZORA_TEST_${name}_PASSWORD`]});assert.ifError(error);return {c,user:data.user};}
try{
 const a=await login('A'),b=await login('B'),id=randomUUID(),now=Date.now();assert.notEqual(a.user.id,b.user.id);
 let r=await a.c.from('dl_sessions').insert({id,user_id:a.user.id,kind:'lesson',ref:'live-test',mode:'practice',focus:'Grammatik',started_at:new Date(now).toISOString(),deadline:new Date(now+1800000).toISOString(),state:{ids:['live-test'],answers:{},position:0}});assert.ifError(r.error);
 const params={p_session_id:id,p_expected_revision:0,p_state:{ids:['live-test'],answers:{'live-test':'Ich lerne Deutsch.'},position:0},p_finished_at:null,p_result:null};
 r=await a.c.rpc('dl_save_session_state',params);assert.ifError(r.error);assert.equal(r.data,true);
 r=await a.c.rpc('dl_save_session_state',params);assert.ifError(r.error);assert.equal(r.data,false);
 r=await b.c.rpc('dl_save_session_state',{...params,p_expected_revision:1});assert.ifError(r.error);assert.equal(r.data,false);
 r=await b.c.from('dl_sessions').select('*').eq('id',id).eq('user_id',a.user.id);assert.ifError(r.error);assert.equal(r.data.length,0);
 r=await b.c.from('dl_sessions').delete().eq('id',id).eq('user_id',a.user.id).select();assert(r.error||r.data.length===0);
 await a.c.auth.signOut();const a2=await login('A');r=await a2.c.from('dl_sessions').select('state,revision').eq('id',id).single();assert.ifError(r.error);assert.equal(r.data.revision,1);assert.equal(r.data.state.answers['live-test'],'Ich lerne Deutsch.');
 console.log('Supabase real: sesión y respuesta conservadas tras cerrar sesión; conflicto de revisión detectado.');
 console.log('RLS real: B no puede leer, guardar ni eliminar la sesión de A.');
 await a2.c.auth.signOut();await b.c.auth.signOut();
}catch(e){console.error('Prueba real fallida:',e.message);process.exitCode=1;}
