import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {createClient} from '@supabase/supabase-js';
import {createApp} from '../server/index.js';
import {dictionary} from '../server/a2/dictionary.js';
process.loadEnvFile('../.env.local');
const {VITE_SUPABASE_URL:url,VITE_SUPABASE_PUBLISHABLE_KEY:key}=process.env;
const client=()=>createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
async function login(name){const c=client();const {data,error}=await c.auth.signInWithPassword({email:process.env[`SATZORA_TEST_${name}_EMAIL`],password:process.env[`SATZORA_TEST_${name}_PASSWORD`]});assert.ifError(error);return {c,user:data.user,token:data.session.access_token};}
const db=new DatabaseSync(':memory:');const server=createApp(db).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
const base=`http://127.0.0.1:${server.address().port}/api/a2/cloud`,word=dictionary[0].id;
async function api(token,path,method='GET',data){const res=await fetch(base+path,{method,headers:{authorization:`Bearer ${token}`,...(data?{'content-type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{})});const body=await res.json();if(!res.ok)throw Error(`API ${path}: ${res.status} ${body.error}`);return body;}
try{
 const a=await login('A'),b=await login('B');assert.notEqual(a.user.id,b.user.id);
 const sentence='Ein Beispiel aus einer Übung.';
 await api(a.token,'/vocabulary','POST',{id:word,sentence,user_id:b.user.id});
 let words=await api(a.token,'/vocabulary');assert(words.savedWords.includes(word));
 let cards=await api(a.token,'/flashcards');assert(cards.cards.some(c=>c.id===word&&c.personal));
 const previous=await a.c.from('dl_flashcards').select('repetitions').eq('card_id',word).maybeSingle();assert.ifError(previous.error);const expected=(previous.data?.repetitions||0)+1;
 const eventId=randomUUID();await api(a.token,`/flashcards/${word}/review`,'POST',{rating:'good',eventId});
 await api(a.token,`/flashcards/${word}/review`,'POST',{rating:'good',eventId});
 let own=await a.c.from('dl_flashcards').select('card_id,due_at,repetitions').eq('card_id',word).single();assert.ifError(own.error);assert(own.data.due_at);assert.equal(own.data.repetitions,expected);
 const reviews=await a.c.from('dl_flashcard_reviews').select('id').eq('id',eventId);assert.ifError(reviews.error);assert.equal(reviews.data.length,1);
 const read=await b.c.from('dl_flashcards').select('*').eq('user_id',a.user.id);assert.ifError(read.error);assert.equal(read.data.length,0);
 const update=await b.c.from('dl_flashcards').update({lapses:123}).eq('user_id',a.user.id).eq('card_id',word).select();assert.ifError(update.error);assert.equal(update.data.length,0);
 const del=await b.c.from('dl_flashcards').delete().eq('user_id',a.user.id).eq('card_id',word).select();assert.ifError(del.error);assert.equal(del.data.length,0);
 const forge=await b.c.from('dl_flashcards').insert({user_id:a.user.id,card_id:'rls-forbidden',due_at:new Date().toISOString()});assert(forge.error);
 await a.c.auth.signOut();const again=await login('A');words=await api(again.token,'/vocabulary');cards=await api(again.token,'/flashcards');assert(words.savedWords.includes(word));assert(cards.cards.some(c=>c.id===word&&c.state?.due));
 const ownAgain=await again.c.from('dl_flashcards').select('repetitions,lapses').eq('card_id',word).single();assert.ifError(ownAgain.error);assert.equal(ownAgain.data.repetitions,expected);assert.notEqual(ownAgain.data.lapses,123);
 console.log('Supabase real: guardado, repaso, fecha, reintento idempotente y nuevo inicio de sesión correctos.');
 console.log('RLS real: B no pudo leer, actualizar, eliminar ni insertar como A.');
 await again.c.auth.signOut();await b.c.auth.signOut();
}catch(e){console.error('Prueba real fallida:',e.message);process.exitCode=1;}finally{await new Promise(r=>server.close(r));db.close();}
