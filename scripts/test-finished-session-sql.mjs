import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {Client} from 'pg';
const root=resolve('..','.local-tools'),bin=resolve(root,'postgresql-17','pgsql','bin'),dir=mkdtempSync(resolve(root,'pg-test-'));
const init=spawnSync(resolve(bin,'initdb.exe'),['-D',dir,'-U','postgres','-A','trust','--no-locale'],{encoding:'utf8',windowsHide:true});
if(init.status!==0){console.error('No se pudo inicializar PostgreSQL de prueba.',init.stderr);process.exit(1);}
const server=spawn(resolve(bin,'postgres.exe'),['-D',dir,'-h','127.0.0.1','-p','55439'],{stdio:'ignore',windowsHide:true});
let db;
try{
 let ok=false;for(let i=0;i<30;i++){db=new Client({host:'127.0.0.1',port:55439,user:'postgres',database:'postgres',connectionTimeoutMillis:1000});try{await db.connect();ok=true;break;}catch{await new Promise(r=>setTimeout(r,250));}}
 if(!ok)throw Error('PostgreSQL de prueba no inició');
 await db.query("create role anon; create role authenticated; create schema auth; create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; create table public.dl_sessions(user_id uuid not null,id uuid not null,revision bigint not null default 0,state jsonb not null,finished_at timestamptz,updated_at timestamptz default now(),primary key(user_id,id));");
 await db.query(readFileSync('supabase/migrations/202611080004_finished_session_state.sql','utf8'));
 const a='10000000-0000-4000-8000-000000000001',b='10000000-0000-4000-8000-000000000002',id='10000000-0000-4000-8000-000000000003';
 const state={ids:['x'],answers:{x:'answer'},assessments:{}};
 await db.query('insert into public.dl_sessions(user_id,id,state,finished_at) values($1,$2,$3,now())',[a,id,state]);
 await db.query('select set_config($1,$2,false)',['request.jwt.claim.sub',b]);let r=await db.query('select public.dl_update_finished_session_state($1,0,$2) as ok',[id,{...state,assessments:{Sprechen:{points:15}}}]);assert.equal(r.rows[0].ok,false);
 await db.query('select set_config($1,$2,false)',['request.jwt.claim.sub',a]);r=await db.query('select public.dl_update_finished_session_state($1,0,$2) as ok',[id,{...state,answers:{x:'tampered'}}]);assert.equal(r.rows[0].ok,false);
 r=await db.query('select public.dl_update_finished_session_state($1,0,$2) as ok',[id,{...state,assessments:{Sprechen:{points:15}}}]);assert.equal(r.rows[0].ok,true);
 r=await db.query('select public.dl_update_finished_session_state($1,0,$2) as ok',[id,state]);assert.equal(r.rows[0].ok,false);
 console.log('SQL local: aislamiento, integridad de respuestas y conflicto de versión verificados.');
}catch(e){console.error('Prueba SQL fallida:',e.message);process.exitCode=1;}finally{await db?.end().catch(()=>{});server.kill();}
