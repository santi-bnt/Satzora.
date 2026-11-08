import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import type {Run} from './types';
const dom=new JSDOM('',{url:'http://localhost/'});
Object.defineProperty(globalThis,'localStorage',{value:dom.window.localStorage,configurable:true});
const {readDraft}=await import('./drafts');
test('a stale draft cannot silently replace a newer cloud answer',()=>{
 const run={id:'run-test',started:100,finished:null,revision:3,mode:'practice',state:{ids:['q'],answers:{q:'newer cloud'}}} as unknown as Run;
 localStorage.setItem('a2-draft-run-test',JSON.stringify({updated:200,revision:2,answers:{q:'older local'}}));
 const recovered=readDraft(run);assert.equal(recovered.answers.q,'newer cloud');assert.equal(recovered.conflict?.q,'older local');assert.equal(JSON.parse(localStorage.getItem('a2-conflicts-run-test')||'[]')[0].answers.q,'older local');
 localStorage.setItem('a2-draft-run-test',JSON.stringify({updated:201,revision:3,answers:{q:'unsaved local'}}));assert.equal(readDraft(run).answers.q,'unsaved local');
 dom.window.close();
});
