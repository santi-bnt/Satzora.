import test from 'node:test';
import assert from 'node:assert/strict';
import {authActions,createAuthClient} from './cloud/auth.ts';

test('cloud client is disabled without configuration and rejects insecure remote URLs',()=>{
 assert.equal(createAuthClient(undefined,undefined),null);
 assert.equal(createAuthClient('not a url','key'),null);
 assert.equal(createAuthClient('http://example.com','key'),null);
 assert.ok(createAuthClient('https://project.example.com','publishable-key'));
});
test('auth actions delegate to Supabase with explicit confirmation and recovery redirects',async()=>{
 const calls:unknown[]=[];
 const auth={signUp:(x:unknown)=>calls.push(['signup',x]),signInWithPassword:(x:unknown)=>calls.push(['signin',x]),resetPasswordForEmail:(...x:unknown[])=>calls.push(['reset',...x]),updateUser:(x:unknown)=>calls.push(['update',x]),signOut:()=>calls.push(['signout']),getSession:()=>calls.push(['session'])};
 const actions=authActions({auth} as never,'https://satzora.example/auth');
 actions.signUp('user@example.test','test-password');actions.signIn('user@example.test','test-password');actions.resetPassword('user@example.test');actions.updatePassword('new-password');actions.signOut();actions.getSession();
 assert.deepEqual(calls,[['signup',{email:'user@example.test',password:'test-password',options:{emailRedirectTo:'https://satzora.example/auth'}}],['signin',{email:'user@example.test',password:'test-password'}],['reset','user@example.test',{redirectTo:'https://satzora.example/auth'}],['update',{password:'new-password'}],['signout'],['session']]);
});
