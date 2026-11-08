import test from 'node:test';
import assert from 'node:assert/strict';
import {saveSession} from './cloud/session-sync.ts';

test('session save sends a revision and reports a stale-write conflict without retrying',async()=>{
 const calls:unknown[]=[];let response=true;
 const client={rpc:async(name:string,args:unknown)=>{calls.push([name,args]);return {data:response,error:null};}} as never;
 const session={id:'example',revision:2,state:{answers:{q:'Antwort'}}};
 assert.deepEqual(await saveSession(client,session),{status:'saved',revision:3});
 response=false;assert.deepEqual(await saveSession(client,session),{status:'conflict'});
 assert.equal(calls.length,2);assert.deepEqual(calls[0],['dl_save_session_state',{p_session_id:'example',p_expected_revision:2,p_state:session.state,p_finished_at:null,p_result:null}]);
 await assert.rejects(()=>saveSession(client,{...session,revision:-1}),/invalid_revision/);
 await assert.rejects(()=>saveSession(client,{...session,finishedAt:'2026-01-01'}),/invalid_completion/);
});
test('transport errors do not count as successful saves',async()=>{
 const client={rpc:async()=>({data:null,error:new Error('offline')})} as never;
 await assert.rejects(()=>saveSession(client,{id:'example',revision:0,state:{}}),/offline/);
});
