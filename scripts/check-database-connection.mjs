import {Client} from 'pg';
import {resolve} from 'node:path';
import {readFileSync} from 'node:fs';
process.loadEnvFile(resolve('..','.env.local'));
const ref=new URL(process.env.VITE_SUPABASE_URL).hostname.split('.')[0];
const client=new Client({host:'aws-0-us-east-1.pooler.supabase.com',port:5432,user:`postgres.${ref}`,password:process.env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:true,ca:readFileSync(resolve('..','.local-tools','supabase-ca.crt'))},connectionTimeoutMillis:8000});
try{await client.connect();const r=await client.query('select 1 as ok');console.log(r.rows[0]?.ok===1?'Conexión PostgreSQL verificada.':'Respuesta inesperada.');}catch(e){console.log(`Conexión PostgreSQL fallida: ${e.code||e.name}.`);process.exitCode=1;}finally{await client.end().catch(()=>{});}
