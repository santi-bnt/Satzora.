import {createContext,useContext} from 'react';
import type {AppContextType} from './types';
import {getAuthClient} from '../cloud/auth';
export const AppContext=createContext<AppContextType>(null!);
export const useA2=()=>useContext(AppContext);
export function sentenceAt(text:string,offset:number){const safe=Math.max(0,Math.min(text.length,offset));let start=safe,end=safe;while(start>0&&!/[.!?…\n\r]/.test(text[start-1]))start--;while(start<text.length&&/\s/.test(text[start]))start++;while(end<text.length&&!/[.!?…\n\r]/.test(text[end]))end++;if(end<text.length&&/[.!?…]/.test(text[end]))end++;const sentence=text.slice(start,end).trim();return sentence||text.trim();}
const cloudRuns=new Map<string,number>();
export const getRunRevision=(id:string)=>cloudRuns.get(id);
const runQueues=new Map<string,Promise<unknown>>();
let cloudOwner:string|undefined;
function serialize<T>(id:string,operation:()=>Promise<T>):Promise<T>{const pending=runQueues.get(id)||Promise.resolve();const current=pending.catch(()=>{}).then(operation);runQueues.set(id,current);void current.finally(()=>{if(runQueues.get(id)===current)runQueues.delete(id);}).catch(()=>{});return current;}
export function request<T>(path:string,body?:unknown,method='POST'):Promise<T>{const id=body!==undefined?path.match(/^\/a2\/runs\/([0-9a-f-]+)(?:\/|$)/i)?.[1]:undefined;return id?serialize(id,()=>doRequest<T>(path,body,method)):doRequest<T>(path,body,method);}
async function doRequest<T>(path:string,body?:unknown,method='POST'):Promise<T>{
 const env=(import.meta as ImportMeta & {env?:Record<string,string|undefined>}).env;
 const lessons=env?.VITE_EXPERIMENTAL_CLOUD_LESSONS!=='false';
 const relevant=path==='/a2/bootstrap'||path==='/a2/vocabulary'||path.startsWith('/a2/flashcards')||(lessons&&(path==='/bootstrap'||path==='/profile'||path.startsWith('/reviews/')||path==='/a2/preferences'||path==='/a2/bank'||path.startsWith('/a2/runs')||path.startsWith('/a2/recordings/')));
 const session=relevant?await getAuthClient()?.auth.getSession():undefined;
 if(session?.error)throw new Error('authentication_unavailable');
 const token=session?.data.session?.access_token,owner=session?.data.session?.user.id;
 if(relevant&&owner!==cloudOwner){cloudRuns.clear();cloudOwner=owner;}
 const id=path.match(/^\/a2\/runs\/([0-9a-f-]+)(?:\/|$)/i)?.[1];
 const newRun=lessons&&!!token&&path==='/a2/runs'&&!!body&&typeof body==='object';
 const study=lessons&&!!token&&(path==='/a2/bootstrap'||path==='/bootstrap'||path==='/profile'||path==='/a2/preferences'||path==='/a2/bank'||path.startsWith('/a2/runs')||path.startsWith('/a2/recordings/'));
 const flash=!!token&&env?.VITE_ENABLE_CLOUD_FLASHCARDS!=='false'&&(path==='/a2/vocabulary'||path.startsWith('/a2/flashcards')||(lessons&&path.startsWith('/reviews/')));
 const cloud=study||flash,route=study?(path==='/bootstrap'?'/a2/cloud-study/base':path==='/profile'?'/a2/cloud-study/profile':path.replace('/a2/','/a2/cloud-study/')):flash?(path.startsWith('/reviews/')?`/a2/cloud${path}`:path.replace('/a2/','/a2/cloud/')):path;
 let payload=body;let pendingKey:string|undefined;
 if(newRun){pendingKey=`satzora-run-${owner}-${JSON.stringify(body)}`;let requestId:string|null=null;try{requestId=sessionStorage.getItem(pendingKey);}catch{}if(!requestId){requestId=crypto.randomUUID();try{sessionStorage.setItem(pendingKey,requestId);}catch{}}payload={...(body as object),requestId};}
 if(flash&&path.startsWith('/reviews/')&&body&&typeof body==='object'){pendingKey=`satzora-review-${owner}-${path}-${JSON.stringify(body)}`;let eventId:string|null=null;try{eventId=sessionStorage.getItem(pendingKey);}catch{}if(!eventId){eventId=crypto.randomUUID();try{sessionStorage.setItem(pendingKey,eventId);}catch{}}payload={...(body as object),eventId};}
 if(study&&id&&body&&typeof body==='object')payload={...(body as object),revision:cloudRuns.get(id)};
 const headers:Record<string,string>={};if(payload!==undefined)headers['Content-Type']='application/json';if(cloud)headers.Authorization=`Bearer ${token}`;
 const response=await fetch(`/api${route}`,payload!==undefined?{method,headers,body:JSON.stringify(payload)}:cloud?{headers}:undefined);
 const data=await response.json();if(!response.ok)throw new Error(data.error||'service_failed');if(cloud){const current=await getAuthClient()?.auth.getSession();if(current?.error||current?.data.session?.user.id!==owner)throw new Error('session_changed');}if(pendingKey)try{sessionStorage.removeItem(pendingKey);}catch{}
 if(study&&data.id&&Number.isSafeInteger(data.revision))cloudRuns.set(data.id,data.revision);
 if(study&&id&&Number.isSafeInteger(data.revision))cloudRuns.set(id,data.revision);
 if(study&&path==='/a2/bootstrap')for(const run of data.runs)cloudRuns.set(run.id,Number(run.revision));
 if(path==='/a2/bootstrap'&&token&&env?.VITE_ENABLE_CLOUD_FLASHCARDS!=='false'){
  const saved=await fetch('/api/a2/cloud/vocabulary',{headers:{Authorization:`Bearer ${token}`}});if(!saved.ok)throw new Error('service_failed');data.savedWords=[...new Set([...(data.savedWords||[]),...(await saved.json()).savedWords])];
 }
 return data;
}
export function uploadRecording(runId:string,exerciseId:string,blob:Blob,ticket:string):Promise<{id:string;url:string}>{return serialize(runId,()=>doUploadRecording(runId,exerciseId,blob,ticket));}
async function doUploadRecording(runId:string,exerciseId:string,blob:Blob,ticket:string):Promise<{id:string;url:string}>{
 const env=(import.meta as ImportMeta & {env?:Record<string,string|undefined>}).env,session=env?.VITE_EXPERIMENTAL_CLOUD_LESSONS!=='false'?await getAuthClient()?.auth.getSession():undefined,token=session?.data.session?.access_token,study=!!token;
 const headers:Record<string,string>={'Content-Type':blob.type,'X-Recording-Ticket':ticket};if(token){headers.Authorization=`Bearer ${token}`;headers['X-Session-Revision']=String(cloudRuns.get(runId)??'');}
 const response=await fetch(`/api/a2/${study?'cloud-study/':''}runs/${runId}/recordings/${exerciseId}`,{method:'POST',headers,body:blob}),data=await response.json();if(!response.ok)throw new Error(data.error||'service_failed');if(study&&Number.isSafeInteger(data.revision))cloudRuns.set(runId,data.revision);return data;
}
export function German({text,className=''}:{text:string;className?:string}){const {word,dictionaryEnabled}=useA2();let offset=0;return <span className={`german-text ${className}`} lang="de">{text.split(/(\p{L}[\p{L}ßäöüÄÖÜ-]*)/u).map((part,i)=>{const current=offset;offset+=part.length;return /\p{L}/u.test(part)&&dictionaryEnabled?<button type="button" className="german-word" key={i} onClick={()=>word(part,text,current)}>{part}</button>:<span key={i}>{part}</span>;})}</span>;}
export function pronounce(text:string,onError:()=>void){if(!('speechSynthesis'in window)){onError();return;}const voices=window.speechSynthesis.getVoices();const voice=voices.find(v=>v.lang.startsWith('de'));if(!voice){onError();return;}window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.voice=voice;utterance.lang='de-DE';utterance.rate=.85;utterance.onerror=onError;window.speechSynthesis.speak(utterance);}
