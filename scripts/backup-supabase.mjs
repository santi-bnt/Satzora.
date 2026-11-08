import {spawnSync} from 'node:child_process';
import {existsSync,mkdirSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
process.loadEnvFile(resolve('..','.env.local'));
const ref=new URL(process.env.VITE_SUPABASE_URL).hostname.split('.')[0];
const root=resolve('..','.local-tools');
const bin=resolve(root,'postgresql-17','pgsql','bin');
const target=resolve(root,'supabase-backups');mkdirSync(target,{recursive:true});
const file=resolve(target,`satzora-${Date.now()}.dump`);
const env={...process.env,PGHOST:'aws-0-us-east-1.pooler.supabase.com',PGPORT:'5432',PGDATABASE:'postgres',PGUSER:`postgres.${ref}`,PGPASSWORD:process.env.SUPABASE_DB_PASSWORD,PGSSLMODE:'verify-full',PGSSLROOTCERT:resolve(root,'supabase-ca.crt')};
const dump=spawnSync(resolve(bin,'pg_dump.exe'),['--format=custom','--no-owner','--no-acl','--no-password',`--file=${file}`],{env,encoding:'utf8'});
if(dump.status!==0||!existsSync(file)||!statSync(file).size){console.error('El respaldo de la base de datos falló; no se aplicó ninguna migración.');if(dump.stderr)console.error(dump.stderr.replaceAll(process.env.SUPABASE_DB_PASSWORD,'[redactado]').slice(0,1500));process.exit(1);}
const verify=spawnSync(resolve(bin,'pg_restore.exe'),['--list',file],{encoding:'utf8'});
if(verify.status!==0||!verify.stdout.includes('TABLE')){console.error('No se pudo verificar el respaldo.');process.exit(1);}
console.log(`Respaldo PostgreSQL creado y catálogo verificado: ${file} (${statSync(file).size} bytes).`);
