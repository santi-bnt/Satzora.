const allowedHosts=new Set(['de.wiktionary.org','es.wiktionary.org','en.wiktionary.org']);
const text=(value,max)=>typeof value==='string'&&value.length<=max;

// External entries are personal data supplied back by the client after the
// server lookup. Keep only bounded, display-safe fields and an attributable
// Wiktionary source. RLS/user ownership is enforced by the storage route.
export function sanitizeExternalDictionaryEntry(value){
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const {id,lemma,es,en,article,plural,perfect,wordType,example,exampleEs,exampleEn,forms,definitions,definitionLanguage,source}=value;
 if(!text(id,200)||!/^dict-ext-de-[\p{L}\p{N}-]+$/u.test(id)||!text(lemma,100)||!lemma.trim()||!text(es,600)||!es.trim()||!text(en||'',600)||!text(article||'',8)||!text(plural||'',100)||!text(perfect||'',100)||!text(wordType||'',40)||!text(example||'',600)||!text(exampleEs||'',600)||!text(exampleEn||'',600)||!Array.isArray(forms)||forms.length>30||forms.some(form=>!text(form,120))||!Array.isArray(definitions)||definitions.length>8||definitions.some(def=>!text(def,220)))return null;
 if(!source||source.license!=='CC BY-SA 4.0'||source.licenseUrl!=='https://creativecommons.org/licenses/by-sa/4.0/'||!text(source.name,120)||!text(source.url,500))return null;
 let sourceUrl;try{sourceUrl=new URL(source.url);}catch{return null;}if(!allowedHosts.has(sourceUrl.hostname)||sourceUrl.protocol!=='https:'||!sourceUrl.pathname.startsWith('/wiki/'))return null;
 return {id,lemma:lemma.trim(),es:es.trim(),en:(en||'').trim(),article:article||'',plural:plural||'',perfect:perfect||'',wordType:wordType||'',example:example||'',exampleEs:exampleEs||'',exampleEn:exampleEn||'',forms:[...new Set(forms)],definitions:[...new Set(definitions)],definitionLanguage:definitionLanguage==='en'?'en':'es',source:{name:source.name,url:sourceUrl.toString(),license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'}};
}
export const isPersistableExternalEntry=value=>!!sanitizeExternalDictionaryEntry(value);

