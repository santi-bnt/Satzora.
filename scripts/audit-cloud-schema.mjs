import {Client} from 'pg';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
process.loadEnvFile(resolve('..','.env.local'));
const ref=new URL(process.env.VITE_SUPABASE_URL).hostname.split('.')[0];
const db=new Client({host:'aws-0-us-east-1.pooler.supabase.com',port:5432,user:`postgres.${ref}`,password:process.env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:true,ca:readFileSync(resolve('..','.local-tools','supabase-ca.crt'))}});
try{
 await db.connect();
 const {rows}=await db.query(`select c.relname, c.relrowsecurity, array_agg(a.attname order by a.attnum) columns, (select json_agg(json_build_object('name',p.polname,'using',pg_get_expr(p.polqual,p.polrelid),'check',pg_get_expr(p.polwithcheck,p.polrelid))) from pg_policy p where p.polrelid=c.oid) policies from pg_class c join pg_namespace n on n.oid=c.relnamespace join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped where n.nspname='public' and c.relname like 'dl\\_%' escape '\\' and c.relkind='r' group by c.oid order by c.relname`);
 for(const row of rows)console.log(JSON.stringify(row));
 const f=await db.query("select to_regclass('supabase_migrations.schema_migrations') is not null history, to_regprocedure('public.dl_save_session_state(uuid,bigint,jsonb,timestamp with time zone,jsonb)') is not null session_fn, to_regprocedure('public.dl_record_flashcard_review(uuid,text,text,timestamp with time zone,integer,integer,real,integer,timestamp with time zone,boolean)') is not null review_fn");console.log(JSON.stringify(f.rows[0]));
 const storage=await db.query("select id,public,file_size_limit,allowed_mime_types from storage.buckets where id='deutsch-lernen-recordings'");console.log('bucket',JSON.stringify(storage.rows));
 const policies=await db.query("select polname,pg_get_expr(polqual,polrelid) using_expr,pg_get_expr(polwithcheck,polrelid) check_expr from pg_policy where polrelid='storage.objects'::regclass and polname like 'dl_recordings_%' order by polname");console.log('storage_policies',JSON.stringify(policies.rows));
 const privileges=await db.query("select has_table_privilege('authenticated','public.dl_sessions','SELECT') session_select,has_table_privilege('authenticated','public.dl_sessions','INSERT') session_insert,has_table_privilege('authenticated','public.dl_sessions','UPDATE') session_update,has_table_privilege('authenticated','public.dl_sessions','DELETE') session_delete,has_function_privilege('authenticated','public.dl_save_session_state(uuid,bigint,jsonb,timestamptz,jsonb)','EXECUTE') session_rpc,has_function_privilege('anon','public.dl_save_session_state(uuid,bigint,jsonb,timestamptz,jsonb)','EXECUTE') anonymous_rpc");console.log('privileges',JSON.stringify(privileges.rows[0]));
}catch(e){console.error('Auditoría fallida:',e.code||e.name);process.exitCode=1;}finally{await db.end();}
