import {lookupWithFallback,resetDictionaryFallbackForTests} from '../server/a2/dictionary-fallback.js';

const userAgent={'User-Agent':'satzivo/1.0 (dictionary source verification; https://satzivo.vercel.app)','Accept':'application/json'};
async function get(url){const response=await fetch(url,{headers:userAgent,signal:AbortSignal.timeout(5000)});let body=null;try{body=await response.json();}catch{}console.log(`${response.status} ${url}`);return {response,body};}

// Check the exact Spanish edition lookup which previously returned no entry,
// and then inspect the German Wiktionary translation table and word forms.
const spanish=await get('https://api.wiktapi.dev/v1/es/word/Reparatur?lang=de');
const translations=await get('https://api.wiktapi.dev/v1/de/word/Reparatur/translations?lang=de');
const german=await get('https://api.wiktapi.dev/v1/de/word/Reparatur?lang=de');
if(spanish.response.status!==404&& !spanish.response.ok)throw Error('Spanish Wiktionary lookup failed unexpectedly');
const flat=(translations.body?.translations||[]).flatMap(group=>group.translations||[]);
if(!flat.some(row=>row.lang_code==='es'&&/reparaci[oó]n/i.test(row.word||'')))throw Error('No Spanish Reparatur translation found in German Wiktionary');
const forms=(german.body?.entries||[]).flatMap(entry=>entry.forms||[]);
if(!forms.some(form=>form.article==='die')||!forms.some(form=>form.form==='Reparaturen'))throw Error('German Wiktionary did not return the required Reparatur forms');

resetDictionaryFallbackForTests();
const result=await lookupWithFallback('Mietvertrag',{locale:'es'});
if(!result.entry?.es||result.entry.definitionLanguage!=='es'||result.source!=='wiktionary-de')throw Error(`Mietvertrag Spanish fallback failed (${result.status}/${result.source})`);
console.log(JSON.stringify({word:result.entry.lemma,source:result.source,spanish:result.entry.es,article:result.entry.article,plural:result.entry.plural}));
