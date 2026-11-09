import {useEffect,useState} from 'react';
import {Volume2} from 'lucide-react';
import {Modal} from './Modal';
import {pronounce,request,useA2} from './context';
import type {Bootstrap,Word} from './types';

function localizedPartOfSpeech(value:string|undefined,locale:'es'|'en'){
 const type=(value||'').trim().toLocaleLowerCase();
 const es:Record<string,string>={nomen:'Sustantivo',noun:'Sustantivo',substantiv:'Sustantivo',verb:'Verbo',verbo:'Verbo',adjektiv:'Adjetivo',adjective:'Adjetivo',adverb:'Adverbio',adverbial:'Adverbio',[`pr\u00e4position`]:'Preposici\u00f3n',preposition:'Preposici\u00f3n',pronomen:'Pronombre',pronoun:'Pronombre',konnektor:'Conector',connector:'Conector'};
 const en:Record<string,string>={nomen:'Noun',noun:'Noun',substantiv:'Noun',verb:'Verb',verbo:'Verb',adjektiv:'Adjective',adjective:'Adjective',adverb:'Adverb',adverbial:'Adverb',[`pr\u00e4position`]:'Preposition',preposition:'Preposition',pronomen:'Pronoun',pronoun:'Pronoun',konnektor:'Connector',connector:'Connector'};
 return (locale==='es'?es:en)[type]||value||'';
}
const isExternal=(entry:Word)=>!!entry.source;

export function Dictionary({word,sentence,fullContext=sentence,data,onClose,onSaved}:{word:string;sentence:string;fullContext?:string;data:Bootstrap;onClose:()=>void;onSaved:()=>void}){
 const {t,locale}=useA2(),[entry,setEntry]=useState<Word|null>(null),[status,setStatus]=useState<'found'|'not_found'|'unavailable'>('not_found'),[loading,setLoading]=useState(true),[saved,setSaved]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let active=true;setLoading(true);setError('');setSaved(false);request<{entry:Word|null;status?:'found'|'not_found'|'unavailable'}>(`/a2/dictionary?word=${encodeURIComponent(word)}&locale=${locale}`,undefined,'GET').then(result=>{if(active){setEntry(result.entry);setStatus(result.status||'not_found');setSaved(!!result.entry&&data.savedWords.includes(result.entry.id));}}).catch(()=>{if(active){setStatus('unavailable');setError(t('loadError'));}}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[word,locale]);
 const retry=()=>{setLoading(true);setError('');request<{entry:Word|null;status?:'found'|'not_found'|'unavailable'}>(`/a2/dictionary?word=${encodeURIComponent(word)}&locale=${locale}`,undefined,'GET').then(result=>{setEntry(result.entry);setStatus(result.status||'not_found');}).catch(()=>setStatus('unavailable')).finally(()=>setLoading(false));};
 const save=async()=>{if(!entry)return;setSaving(true);setError('');try{await request('/a2/vocabulary',{id:entry.id,sentence:sentence||fullContext,entry:isExternal(entry)?entry:undefined});setSaved(true);onSaved();}catch(cause){const code=(cause as Error).message;setError(code==='dictionary_cards_migration_required'?(locale==='es'?'El guardado en la nube requiere una migración pendiente; el progreso existente no se modifica.':'Cloud saving needs a pending database migration; existing progress is unchanged.'):t('saveError'));}finally{setSaving(false);}};
 const display=entry?.[locale]||'';
 const canSave=!!entry?.es;
 return <Modal title={t('dictionary')} onClose={onClose}>
  {loading?<p role="status">…</p>:entry?<>
   <div className="dictionary-headword" lang="de">{entry.article&&<span className="word-article">{entry.article}</span>}<h2>{entry.lemma}</h2></div>
   {word.toLocaleLowerCase('de')!==entry.lemma.toLocaleLowerCase('de')&&<p className="dictionary-forms">{locale==='es'?'Forma seleccionada':'Selected form'}: <span lang="de">{word}</span></p>}
   {display?<p className="dictionary-translation">{display}</p>:<p className="notice">{locale==='es'?'Traducción al español no disponible.':'English definition not available.'}</p>}
   {locale==='es'&&!entry.es&&entry.en&&<p className="dictionary-translation-alt"><strong>Definición en inglés:</strong> {entry.en}</p>}
   {locale==='es'&&entry.es&&entry.en&&<p className="dictionary-translation-alt"><strong>Ingl?s:</strong> {entry.en}</p>}
   {locale==='en'&&entry.es&&entry.en&&<p className="dictionary-translation-alt"><strong>Spanish:</strong> {entry.es}</p>}
   {entry.plural&&<p className="dictionary-forms"><strong>{locale==='es'?'Plural':'Plural'}:</strong> die {entry.plural}</p>}
   {entry.perfect&&<p className="dictionary-forms"><strong>Perfekt:</strong> {entry.perfect}</p>}
   {entry.wordType&&<p className="dictionary-forms">{localizedPartOfSpeech(entry.wordType,locale)}</p>}
   {entry.example&&<div className="dictionary-example"><p lang="de">{entry.example}</p>{(locale==='es'?entry.exampleEs:entry.exampleEn)&&<p className="dictionary-example-translation">{locale==='es'?entry.exampleEs:entry.exampleEn}</p>}</div>}
   {sentence&&<div className="dictionary-context"><strong>{locale==='es'?'En contexto':'In context'}:</strong> <span lang="de">{sentence}</span>{fullContext&&fullContext!==sentence&&<details><summary>{locale==='es'?'Ver contexto completo':'Show full context'}</summary><p lang="de">{fullContext}</p></details>}</div>}
   {entry.definitions&&entry.definitions.length>1&&<details className="dictionary-definitions"><summary>{locale==='es'?'Otros significados':'Other meanings'}</summary><ul>{entry.definitions.slice(1).map((meaning,index)=><li key={index}>{meaning}</li>)}</ul></details>}
   <div className="dictionary-actions"><button className="button outline" onClick={()=>pronounce(`${entry.article} ${entry.lemma}`,()=>setError(t('speechUnavailable')))}><Volume2 size={17}/>{t('listen')}</button>{canSave&&<button disabled={saving||saved} className="button primary" onClick={()=>void save()}>{saving?(locale==='es'?'Guardando…':'Saving…'):saved?t('wordSaved'):t('saveWord')}</button>}</div>
   {error&&<p className="form-error" role="alert">{error}</p>}
   {entry.source&&<p className="help dictionary-source-note">{locale==='es'?(entry.definitionLanguage==='en'?'La traducción española no estaba en esta fuente; la definición inglesa está etiquetada.':'Entrada lexicográfica abierta.'):'Open dictionary entry.'}</p>}
   {entry.source&&<p className="dictionary-source"><a href={entry.source.url} target="_blank" rel="noreferrer">{entry.source.name}</a>{' · '}<a href={entry.source.licenseUrl} target="_blank" rel="noreferrer">{entry.source.license}</a></p>}
  </>:<><h3 lang="de">{word}</h3><p className="notice">{status==='unavailable'?(locale==='es'?'La fuente externa no responde. Comprueba tu conexión e inténtalo de nuevo.':'The external dictionary is unavailable. Check your connection and retry.'):(locale==='es'?'No encontramos una entrada fiable para esta palabra.':'No reliable entry was found for this word.')}</p><button className="button outline" onClick={retry}>{t('retry')}</button>{error&&<p className="form-error" role="alert">{error}</p>}</>}
 </Modal>;
}
