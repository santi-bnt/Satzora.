import test from 'node:test';
import assert from 'node:assert/strict';
import {createAuthenticator} from './cloud/authenticate.js';

const response=()=>({statusCode:0,status(code){this.statusCode=code;return this;},json(body){this.body=body;return this;}});
test('auth middleware verifies tokens remotely and never accepts a fabricated identity',async()=>{
 let verified=0;const auth=createAuthenticator({url:'https://supabase.example',key:'public',makeClient:()=>({auth:{getUser:async token=>{verified++;return token==='valid'?{data:{user:{id:'user-1'}},error:null}:{data:{user:null},error:{}};}}})});
 let next=false;const req={headers:{authorization:'Bearer valid'}},res=response();await auth(req,res,()=>{next=true;});assert.equal(next,true);assert.equal(req.auth.userId,'user-1');assert.equal(verified,1);
 for(const header of ['', 'Bearer forged', 'Basic valid']){const r=response();let called=false;await auth({headers:{authorization:header}},r,()=>{called=true;});assert.equal(r.statusCode,401);assert.equal(called,false);}
});
test('auth failures and invalid configuration fail closed',async()=>{
 assert.throws(()=>createAuthenticator({url:'http://example.com',key:'public'}),/supabase_not_configured/);
 const auth=createAuthenticator({url:'https://supabase.example',key:'public',makeClient:()=>({auth:{getUser:async()=>{throw Error('offline');}}})}),res=response();
 await auth({headers:{authorization:'Bearer value'}},res,()=>assert.fail('must not authorize'));assert.equal(res.statusCode,503);
});
