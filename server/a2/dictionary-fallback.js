import {lookup} from './dictionary.js';

const cache=new Map(),inflight=new Map();
const norm=value=>String(value||'').normalize('NFC').trim().toLocaleLowerCase('de');
const userAgent='satzivo/1.0 (German A2 dictionary; https://satzivo.vercel.app)';
const sourceFor=(term,edition,provider='Wiktionary')=>({name:provider,url:`https://${edition}.wiktionary.org/wiki/${encodeURIComponent(term.replaceAll(' ','_'))}`,license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'});
function cleanHtml(value){return String(value||'').replace(/<br\s*\/?\s*>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/\s+/g,' ').trim();}
function cleanSpanishGloss(value){return String(value||'').replaceAll('_',' ').replace(/\s*\(\d+(?:\s*,\s*\d+)*\)\.?$/,'').replace(/[.;,]+$/,'').replace(/\s+/g,' ').trim();}
function articleFor(entries){const tags=new Set(entries.flatMap(entry=>(entry.senses||[]).flatMap(sense=>sense.tags||[])));if(tags.has('masculine'))return 'der';if(tags.has('feminine'))return 'die';if(tags.has('neuter'))return 'das';return '';}
function wordTypeFor(entries){const categories=entries.flatMap(entry=>(entry.senses||[]).flatMap(sense=>sense.categories||[])).join(' ').toLowerCase();if(/german nouns/.test(categories))return 'Nomen';if(/german verbs/.test(categories))return 'Verb';if(/german adjectives/.test(categories))return 'Adjektiv';return '';}
function fromSpanishWiktionary(term,data){
 if(data?.edition!=='es'||norm(data.word)!==norm(term)||!Array.isArray(data.entries))return null;
 const entries=data.entries.filter(entry=>Array.isArray(entry.senses));
 const glosses=[...new Set(entries.flatMap(entry=>entry.senses.flatMap(sense=>sense.glosses||[])).map(cleanSpanishGloss).filter(gloss=>gloss&&gloss.length<220))].slice(0,8);
 if(!glosses.length)return null;
 const pluralForms=[...new Set(entries.flatMap(entry=>entry.forms||[]).filter(form=>(form.tags||[]).includes('plural')).map(form=>form.form).filter(form=>form&&norm(form)!==norm(term)))];
 const article=articleFor(entries);
 return {id:`wiktionary-es-de-${norm(term).replace(/[^\p{L}\p{N}]+/gu,'-')}`,lemma:term,es:glosses.join('; '),en:'',definitions:glosses,definitionLanguage:'es',example:'',article,plural:pluralForms[0]||'',wordType:wordTypeFor(entries),forms:[term,...pluralForms],source:sourceFor(term,'es','Wiktionary Español (WiktAPI)')};
}
function fromEnglishWiktionary(term,data){
 const records=data?.de;if(!Array.isArray(records))return null;
 const record=records.find(row=>row.language==='German'&&Array.isArray(row.definitions)&&row.definitions.length);
 if(!record)return null;
 const definitions=[...new Set(record.definitions.map(row=>cleanHtml(row.definition)).filter(text=>text&&text.length<220))].slice(0,3);
 if(!definitions.length)return null;
 const noun=/noun/i.test(record.partOfSpeech||'');
 return {id:`wiktionary-en-de-${norm(term).replace(/[^\p{L}\p{N}]+/gu,'-')}`,lemma:term,es:'',en:definitions[0],definitions,definitionLanguage:'en',example:'',article:'',plural:'',wordType:noun?'Nomen':record.partOfSpeech||'',forms:[term],source:sourceFor(term,'en')};
}
async function getJson(url,{fetchImpl,timeoutMs}){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const response=await fetchImpl(url,{signal:controller.signal,headers:{Accept:'application/json','User-Agent':userAgent}});
  if(response.status===404)return {missing:true};
  if(!response.ok)throw new Error(`dictionary_source_${response.status}`);
  return {data:await response.json()};
 }finally{clearTimeout(timer);}
}
export async function lookupWithFallback(word,{locale='en',fetchImpl=globalThis.fetch,timeoutMs=3000,now=Date.now}={}){
 const local=lookup(word);if(local)return {entry:local,source:'local',status:'found'};
 if(typeof word!=='string'||word.length>80)return {entry:null,source:'none',status:'not_found'};
 const term=word.normalize('NFC').trim().replace(/^[^\p{L}]+|[^\p{L}]+$/gu,'');if(!term)return {entry:null,source:'none',status:'not_found'};
 const lang=locale==='es'?'es':'en',key=`${lang}:${norm(term)}`,cached=cache.get(key);
 if(cached&&cached.expires>now())return cached.result;
 if(inflight.has(key))return inflight.get(key);
 const task=(async()=>{
  let entry=null,source='none',failed=false;
  if(lang==='es'){
   try{const response=await getJson(`https://api.wiktapi.dev/v1/es/word/${encodeURIComponent(term)}?lang=de`,{fetchImpl,timeoutMs});if(response.data)entry=fromSpanishWiktionary(term,response.data);if(entry)source='wiktionary-es';}
   catch{failed=true;}
  }
  if(!entry){
   try{const response=await getJson(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(term)}`,{fetchImpl,timeoutMs});if(response.data)entry=fromEnglishWiktionary(term,response.data);if(entry)source='wiktionary-en';}
   catch{failed=true;}
  }
  const status=entry?'found':failed?'unavailable':'not_found',result={entry,source,status};
  cache.set(key,{result,expires:now()+(entry?6*60*60_000:failed?15_000:60_000)});
  return result;
 })();inflight.set(key,task);
 try{return await task;}finally{inflight.delete(key);}
}
export function resetDictionaryFallbackForTests(){cache.clear();inflight.clear();}
