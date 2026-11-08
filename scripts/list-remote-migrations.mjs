import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
process.loadEnvFile('../.env.local');
const ref=new URL(process.env.VITE_SUPABASE_URL).hostname.split('.')[0];
const connection=new URL('postgresql://aws-0-us-east-1.pooler.supabase.com:5432/postgres');connection.username=`postgres.${ref}`;connection.searchParams.set('sslmode','verify-full');connection.searchParams.set('sslrootcert',resolve('..','.local-tools','supabase-ca.crt'));
const cli=resolve('..','.local-tools','supabase-cli','node_modules','supabase','dist','supabase.js');
const result=spawnSync(process.execPath,[cli,'migration','list','--db-url',connection.toString()],{env:{...process.env,PGPASSWORD:process.env.SUPABASE_DB_PASSWORD},encoding:'utf8'});
for(const output of [result.stdout,result.stderr])if(output)process.stdout.write(output.replaceAll(process.env.SUPABASE_DB_PASSWORD,'[redactado]'));
process.exit(result.status??1);
