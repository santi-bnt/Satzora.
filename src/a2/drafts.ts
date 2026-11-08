import type {Run} from './types';
import {getRunRevision} from './context';

type Draft={answers:Record<string,string>;updated:number;revision?:number};
const draftKey=(id:string)=>`a2-draft-${id}`;
const conflictKey=(id:string)=>`a2-conflicts-${id}`;
function same(a:Record<string,string>,b:Record<string,string>){return Object.keys(a).length===Object.keys(b).length&&Object.entries(a).every(([id,value])=>b[id]===value);}
export function readDraft(run:Run):{answers:Record<string,string>;conflict:Record<string,string>|null}{
 try{const draft=JSON.parse(localStorage.getItem(draftKey(run.id))||'null') as Draft|null;if(run.finished||!draft?.answers||draft.updated<=run.started)return {answers:run.state.answers,conflict:null};
  if(run.revision!==undefined&&draft.revision!==run.revision&&!same(draft.answers,run.state.answers)){
   const previous=JSON.parse(localStorage.getItem(conflictKey(run.id))||'[]') as Draft[];if(!previous.some(x=>x.updated===draft.updated)){previous.push(draft);localStorage.setItem(conflictKey(run.id),JSON.stringify(previous));}return {answers:run.state.answers,conflict:draft.answers};
  }
  const allowed=run.mode==='exam'&&run.sections?run.sections.filter(s=>run.serverNow>=s.starts&&run.serverNow<s.ends).flatMap(s=>s.parts.flatMap(p=>p.questions)):run.state.ids;
  return {answers:{...run.state.answers,...Object.fromEntries(Object.entries(draft.answers).filter(([id,value])=>allowed.includes(id)&&typeof value==='string'))},conflict:null};
 }catch{return {answers:run.state.answers,conflict:null};}
}
export function writeDraft(id:string,answers:Record<string,string>){try{localStorage.setItem(draftKey(id),JSON.stringify({answers,updated:Date.now(),revision:getRunRevision(id)}));}catch{}}
export function markDraftSaved(id:string){try{const draft=JSON.parse(localStorage.getItem(draftKey(id))||'null') as Draft|null;if(draft){draft.revision=getRunRevision(id);localStorage.setItem(draftKey(id),JSON.stringify(draft));}}catch{}}
export function clearDraft(id:string){try{localStorage.removeItem(draftKey(id));}catch{}}
