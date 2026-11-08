import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {JSDOM} from 'jsdom';
import {createServer} from 'vite';
import {createApp} from '../server/index.js';
import {dictionary} from '../server/a2/dictionary.js';
process.loadEnvFile('../.env.local');process.env.VITE_ENABLE_CLOUD_FLASHCARDS='true';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost/'});
for(const k of ['window','document','navigator','localStorage','location'])Object.defineProperty(globalThis,k,{value:dom.window[k],configurable:true});
const db=new DatabaseSync(':memory:');const http=createApp(db).listen(0,'127.0.0.1');await new Promise(r=>http.once('listening',r));
const base=`http://127.0.0.1:${http.address().port}`,original=globalThis.fetch;
globalThis.fetch=(input,options)=>original(typeof input==='string'&&input.startsWith('/')?base+input:input,options);
const vite=await createServer({configFile:'vite.config.ts',server:{middlewareMode:true},appType:'custom'});
try{
 const {getAuthClient}=await vite.ssrLoadModule('/src/cloud/auth.ts');
 const {request}=await vite.ssrLoadModule('/src/a2/context.tsx');
 const auth=getAuthClient();assert(auth);
 let result=await auth.auth.signInWithPassword({email:process.env.SATZORA_TEST_A_EMAIL,password:process.env.SATZORA_TEST_A_PASSWORD});assert.ifError(result.error);
 const word=dictionary[0].id;
 const bootstrap=await request('/a2/bootstrap');assert(bootstrap.savedWords.includes(word));
 const cards=await request('/a2/flashcards');assert(cards.cards.some(c=>c.id===word&&c.personal&&c.state?.due));
 console.log('La función de peticiones del frontend recuperó desde Supabase la palabra y el repaso reales de A.');
 await auth.auth.signOut();
}catch(e){console.error('Prueba del frontend fallida:',e.message);process.exitCode=1;}finally{await vite.close();http.closeAllConnections();await new Promise(r=>http.close(r));db.close();dom.window.close();process.exit(process.exitCode||0);}
