import {Client} from 'pg';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
process.loadEnvFile(resolve('..','.env.local'));
const backup=resolve('..','.local-tools','supabase-backups','satzora-1794127425810.dump');
if(!existsSync(backup)||statSync(backup).size<1000)throw Error('verified_backup_required');
const ref=new URL(process.env.VITE_SUPABASE_URL).hostname.split('.')[0];
const db=new Client({host:'aws-0-us-east-1.pooler.supabase.com',port:5432,user:`postgres.${ref}`,password:process.env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:true,ca:readFileSync(resolve('..','.local-tools','supabase-ca.crt'))}});
try{
 await db.connect();await db.query('begin');
 const {rows}=await db.query("select to_regprocedure('public.dl_record_flashcard_review(uuid,text,text,timestamp with time zone,integer,integer,real,integer,timestamp with time zone,boolean)') is not null as exists");
 if(rows[0].exists)throw Error('function_already_exists');
 await db.query(readFileSync('supabase/migrations/202611080003_flashcard_review_atomic.sql','utf8'));
 await db.query('commit');console.log('Migración 003 aplicada una vez; historial CLI no modificado.');
}catch(e){await db.query('rollback').catch(()=>{});console.error('Migración no aplicada:',e.code||e.message);process.exitCode=1;}finally{await db.end();}
