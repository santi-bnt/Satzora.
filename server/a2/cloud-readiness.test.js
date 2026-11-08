import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

test('Vercel deployment gate requires the public Supabase configuration',()=>{
 const missing=spawnSync(process.execPath,['scripts/verify-cloud-ready.js'],{encoding:'utf8',env:{...process.env,VERCEL:'1',VERCEL_ENV:'production',VITE_SUPABASE_URL:'',VITE_SUPABASE_PUBLISHABLE_KEY:''}});
 assert.equal(missing.status,1);assert.match(missing.stderr,/missing required Vercel environment variables/);
 const configured=spawnSync(process.execPath,['scripts/verify-cloud-ready.js'],{encoding:'utf8',env:{...process.env,VERCEL:'1',VERCEL_ENV:'production',VITE_SUPABASE_URL:'https://satzora.test.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY:'publishable-test-key'}});
 assert.equal(configured.status,0);assert.match(configured.stdout,/Cloud configuration verified for Vercel production/);
 const config=JSON.parse(readFileSync('vercel.json','utf8'));
 assert.match(config.buildCommand,/verify-cloud-ready/);
 assert.deepEqual(config.rewrites,[{source:'/api/a2/:path*',destination:'/api/router?__satzora_route=a2/:path*'}]);
 assert.match(readFileSync('api/router.js','utf8'),/req\.url=`\/api\/\$\{route\}/);
});
test('Vercel Preview deployment also requires configured Supabase variables',()=>{
 const preview=spawnSync(process.execPath,['scripts/verify-cloud-ready.js'],{encoding:'utf8',env:{...process.env,VERCEL:'1',VERCEL_ENV:'preview'}});
 assert.equal(preview.status,1);assert.match(preview.stderr,/missing required Vercel environment variables/);
});
test('migration declares private user ownership and private recording storage',()=>{
 const sql=readFileSync('supabase/migrations/202611080001_initial_private_data.sql','utf8');
 for(const table of ['dl_profiles','dl_sessions','dl_attempts','dl_saved_words','dl_flashcards','dl_flashcard_reviews','dl_flashcard_settings','dl_recordings'])assert.match(sql,new RegExp(`create table public\\.${table}\\s*\\(`));
 assert.match(sql,/enable row level security/);assert.match(sql,/auth\.uid\(\)/);assert.match(sql,/foreign key \(user_id,session_id\)/);assert.match(sql,/deutsch-lernen-recordings','deutsch-lernen-recordings',false/);
});
