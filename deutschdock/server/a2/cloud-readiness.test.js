import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

test('public deployment is deliberately blocked until per-user storage is implemented',()=>{
 const run=spawnSync(process.execPath,['scripts/verify-cloud-ready.js'],{encoding:'utf8'});
 assert.equal(run.status,1);assert.match(run.stderr,/not implemented or verified/);
 const config=JSON.parse(readFileSync('vercel.json','utf8'));
 assert.match(config.buildCommand,/verify-cloud-ready/);
});
test('migration declares private user ownership and private recording storage',()=>{
 const sql=readFileSync('supabase/migrations/202611080001_initial_private_data.sql','utf8');
 for(const table of ['dl_profiles','dl_sessions','dl_attempts','dl_saved_words','dl_flashcards','dl_flashcard_reviews','dl_flashcard_settings','dl_recordings'])assert.match(sql,new RegExp(`create table public\\.${table}\\s*\\(`));
 assert.match(sql,/enable row level security/);assert.match(sql,/auth\.uid\(\)/);assert.match(sql,/foreign key \(user_id,session_id\)/);assert.match(sql,/deutsch-lernen-recordings','deutsch-lernen-recordings',false/);
});
