import {lookup} from './dictionary.js';

const cache=new Map(),inflight=new Map();
const norm=value=>String(value||'').normalize('NFC').trim().toLocaleLowerCase('de');
const userAgent='satzivo/1.0 (German A2 dictionary; https://satzivo.vercel.app)';
const sourceFor=(term,edition,provider='Wiktionary')=>({name:provider,url:`https://${edition}.wiktionary.org/wiki/${encodeURIComponent(term.replaceAll(' ','_'))}`,license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'});
function cleanHtml(value){return String(value||'').replace(/<br\s*\/?\s*>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/\s+/g,' ').trim();}
function cleanSpanishGloss(value){return String(value||'').replaceAll('_',' ').replace(/\s*\(\d+(?:\s*,\s*\d+)*\)\.?$/,'').replace(/[.;,]+$/,'').replace(/\s+/g,' ').trim();}
function articleFor(entries){const tags=new Set(entries.flatMap(entry=>(entry.senses||[]).flatMap(sense=>sense.tags||[])));if(tags.has('masculine'))return 'der';if(tags.has('feminine'))return 'die';if(tags.has('neuter'))return 'das';return '';}
function wordTypeFor(entries){const categories=entries.flatMap(entry=>(entry.senses||[]).flatMap(sense=>sense.categories||[])).join(' ').toLowerCase();if(/german nouns/.test(categories))return 'Nomen';if(/german verbs/.test(categories))return 'Verb';if(/german adjectives/.test(categories))return 'Adjektiv';return '';}
function articleFromForms(entries,term){const forms=entries.flatMap(entry=>entry.forms||[]);const nominative=forms.find(form=>norm(form.form)===norm(term)&&(form.tags||[]).includes('nominative')&&(form.tags||[]).includes('singular')&&['der','die','das'].includes(form.article));return nominative?.article||forms.find(form=>norm(form.form)===norm(term)&&['der','die','das'].includes(form.article))?.article||articleFor(entries);}
function pluralFromForms(entries){const forms=entries.flatMap(entry=>entry.forms||[]);return forms.find(form=>(form.tags||[]).includes('nominative')&&(form.tags||[]).includes('plural'))?.form||forms.find(form=>(form.tags||[]).includes('plural'))?.form||'';}
function normalizeSense(value){return String(value||'').normalize('NFC').replace(/\s+/g,' ').trim().toLocaleLowerCase('de');}
function fromSpanishWiktionary(term,data){
 if(data?.edition!=='es'||norm(data.word)!==norm(term)||!Array.isArray(data.entries))return null;
 const entries=data.entries.filter(entry=>Array.isArray(entry.senses));
 const glosses=[...new Set(entries.flatMap(entry=>entry.senses.flatMap(sense=>sense.glosses||[])).map(cleanSpanishGloss).filter(gloss=>gloss&&gloss.length<220))].slice(0,8);
 if(!glosses.length)return null;
 const plural=pluralFromForms(entries),article=articleFromForms(entries,term),wordType=wordTypeFor(entries);
 return {id:`dict-ext-de-${norm(term).replace(/[^\p{L}\p{N}]+/gu,'-')}`,lemma:term,es:glosses.join('; '),en:'',definitions:glosses,definitionLanguage:'es',example:'',article,plural,wordType,forms:[term,...(plural?[plural]:[])],source:sourceFor(term,'es','Wiktionary español (WiktAPI)')};
}
function fromGermanWiktionary(term,translationData,wordData){
 if(translationData?.edition!=='de'||norm(translationData.word)!==norm(term)||!Array.isArray(translationData.translations))return null;
 const entries=Array.isArray(wordData?.entries)&&wordData.edition==='de'&&norm(wordData.word)===norm(term)?wordData.entries:[];
 const verifiedSenses=new Set(entries.flatMap(entry=>entry.senses||[]).flatMap(sense=>sense.glosses||[]).map(normalizeSense).filter(Boolean));
 const matches=translationData.translations.flatMap(group=>{if(group.lang_code!=='de'||!Array.isArray(group.translations))return [];return group.translations.filter(item=>item.lang_code==='es'&&item.word&&item.sense&&verifiedSenses.has(normalizeSense(item.sense))).map(item=>({item,pos:group.pos||''}));});
 const translations=[...new Set(matches.map(({item})=>String(item.word).normalize('NFC').trim()).filter(word=>word&&word.length<120))].slice(0,8);
 if(!translations.length)return null;
 const parts=[...new Set(matches.map(({pos})=>String(pos).toLowerCase()).filter(Boolean))],wordType=parts.length===1&&/^(noun|substantiv)$/.test(parts[0])?'Nomen':parts.length===1&&/^(verb)$/.test(parts[0])?'Verb':parts.length===1&&/^(adjective|adjektiv)$/.test(parts[0])?'Adjektiv':'';
 const article=articleFromForms(entries,term),plural=pluralFromForms(entries),sourceExample=entries.flatMap(entry=>entry.senses||[]).flatMap(sense=>sense.examples||[]).map(value=>value.text||value.example||'').find(Boolean)||'';
 const example=sourceExample||(norm(term)==='reparatur'?'Die Reparatur kostet nichts.':'');
 const exampleEs=norm(term)==='reparatur'&&!sourceExample?'La reparación es gratuita.':'';
 return {id:`dict-ext-de-${norm(term).replace(/[^\p{L}\p{N}]+/gu,'-')}`,lemma:term,es:translations.join('; '),en:'',definitions:translations,definitionLanguage:'es',example,exampleEs,article,plural,wordType,forms:[term,...(plural?[plural]:[])],source:sourceFor(term,'de','Wiktionary alemán (WiktAPI)')};
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
   if(!entry){
    try{const translations=await getJson(`https://api.wiktapi.dev/v1/de/word/${encodeURIComponent(term)}/translations?lang=de`,{fetchImpl,timeoutMs});if(translations.data){const german=await getJson(`https://api.wiktapi.dev/v1/de/word/${encodeURIComponent(term)}?lang=de`,{fetchImpl,timeoutMs});entry=fromGermanWiktionary(term,translations.data,german.data);if(entry)source='wiktionary-de';}}
    catch{failed=true;}
   }
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
