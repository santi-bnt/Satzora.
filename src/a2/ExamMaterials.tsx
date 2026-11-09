import {memo,useEffect,useRef,useState} from 'react';
import {Headphones,Play,RotateCcw} from 'lucide-react';
import {German,request,useA2} from './context';
import type {Clip,ExamDocument,ExamImage,OralCard,Run} from './types';

export const ReadingDocument=memo(function ReadingDocument({document,storageKey,example}:{document:ExamDocument;storageKey:string;example?:{label:string;answer:string}}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const element=ref.current;try{if(element)element.scrollTop=Number(localStorage.getItem(storageKey)||0);}catch{}return()=>{if(element)try{localStorage.setItem(storageKey,String(element.scrollTop));}catch{}};},[storageKey]);
 return <div className="exam-document" ref={ref} role="region" aria-label="Lesetext" tabIndex={0} onScroll={e=>{try{localStorage.setItem(storageKey,String(e.currentTarget.scrollTop));}catch{}}}>
 {document.title&&<h2><German text={document.title}/></h2>}
 {document.kind==='email'&&<dl className="email-envelope"><div><dt>Von</dt><dd>{document.from}</dd></div><div><dt>An</dt><dd>{document.to}</dd></div><div><dt>Betreff</dt><dd><German text={document.subject||''}/></dd></div></dl>}
 {document.kind==='ads'&&example&&<p className="example-reference" lang="de"><strong>Beispiel {example.answer}:</strong> <German text={example.label}/> {example.answer}</p>}
 {document.paragraphs?.map((paragraph,i)=><p key={i}><German text={paragraph}/></p>)}
 {document.rows&&<dl className="directory-table">{document.rows.map((row,i)=><div key={i}><dt><German text={row.label}/></dt><dd><German text={row.detail}/></dd></div>)}</dl>}
 {document.ads&&<div className="adverts">{document.ads.map(ad=><article key={ad.id}><span className="advert-letter">{ad.id}</span><div><h3><German text={ad.title}/></h3><p><German text={ad.body}/></p></div></article>)}</div>}
 </div>;
});
export function ImageBank({images,example}:{images:ExamImage[];example?:{label:string;answer:string}}){const {t}=useA2(),[error,setError]=useState(false);return <><div className="exam-image-bank">{images.map((image,i)=><figure key={image.id} className={example?.answer===String.fromCharCode(97+i)?'example-picture':''}><figcaption>{String.fromCharCode(97+i)}</figcaption><img src={image.src} alt={image.alt} onError={()=>setError(true)} width={120} height={100}/></figure>)}</div>{example&&<p lang="de" className="example-reference">Beispiel: {example.label} → {example.answer}</p>}{error&&<p className="form-error" role="alert">{t('imageLoadError')}</p>}</>}
export function OralCards({card}:{card:OralCard}){const {t}=useA2();return <section className={`oral-cards oral-${card.kind}`} lang="de">{card.kind==='personal'&&<><p className="help">{t('personalTurns')}</p><div className="personal-card-grid">{card.keywords?.map((word,i)=><div className="speaking-keyword" key={word}><small>Fragen zur Person · {i+1}</small><strong>{word}</strong></div>)}</div></>}{card.kind==='topic'&&<div className="topic-speaking-card"><span className="eyebrow">VON SICH ERZÄHLEN</span><h2>{card.central}</h2><div>{card.keywords?.map(word=><span key={word}>{word}</span>)}</div></div>}{card.kind==='planning'&&<div className="planning-card"><span className="eyebrow">GEMEINSAM ETWAS PLANEN</span><h2>{card.situation}</h2><h3>{card.student?.title}</h3><ul>{card.student?.facts.map(fact=><li key={fact}><German text={fact}/></li>)}</ul></div>}</section>}
export function ListeningPlayer({clip,run,limit,onPlayed,beforeTranscript,attempted}:{clip:Clip;run:Run;limit:number;onPlayed:(id:string,used:number)=>void;beforeTranscript?:()=>Promise<void>;attempted:boolean}){
 const {t}=useA2(),audio=useRef<HTMLAudioElement>(null),reservation=useRef<string|null>(null),confirmed=useRef(false),[loading,setLoading]=useState(false),[playing,setPlaying]=useState(false),[error,setError]=useState(''),[transcript,setTranscript]=useState(clip.transcript||''),[used,setUsed]=useState(run.state.plays[clip.id]||0);
 const restricted=run.mode==='exam'&&!run.finished;
 useEffect(()=>{const element=audio.current;return()=>{element?.pause();};},[clip.id]);
 const confirm=async()=>{if(!restricted||!reservation.current||confirmed.current)return;confirmed.current=true;try{const result=await request<{used:number}>(`/a2/runs/${run.id}/play`,{clipId:clip.id,action:'confirm',token:reservation.current});setUsed(result.used);onPlayed(clip.id,result.used);}catch{confirmed.current=false;reservation.current=null;audio.current?.pause();setPlaying(false);setError(t('audioError'));}};
 const start=async()=>{const element=audio.current!;setError('');
  const attemptPlay=()=>{element.currentTime=0;const promise=element.play();return Promise.resolve(promise).catch(e=>{setPlaying(false);setError(t(e?.name==='NotAllowedError'?'audioRetryGesture':'audioError'));});};
  if(reservation.current&&!confirmed.current){void attemptPlay();return;}
  setLoading(true);try{const result=await request<{token:string}>(`/a2/runs/${run.id}/play`,{clipId:clip.id,action:'reserve'});reservation.current=result.token;confirmed.current=false;await attemptPlay();}catch{setError(t('audioError'));}finally{setLoading(false);}
 };
 return <section className="listening-player"><div><Headphones size={19}/><strong>{t('play')}</strong><span>{restricted?`${used}/${limit}`:'∞'} · {t('plays')}</span></div><audio ref={audio} src={clip.audio} preload="metadata" controls={!restricted} playsInline onPlaying={()=>{setPlaying(true);void confirm();}} onPause={()=>setPlaying(false)} onEnded={()=>{setPlaying(false);reservation.current=null;}} onError={()=>{setLoading(false);setPlaying(false);setError(t('audioError'));}}/>
 {restricted&&<button className="button primary" onClick={()=>void start()} disabled={loading||playing||used>=limit}><Play size={16}/>{loading?t('audioBusy'):t('play')}</button>}
 {error&&<p className="form-error" role="alert">{error}</p>}{error&&!playing&&<button className="text-button" onClick={()=>{audio.current?.load();setError('');}}><RotateCcw size={15}/>{t('retry')}</button>}
 <p className="help">{t('audioSynthetic')}</p>
 {(!restricted||run.finished)&&(attempted||run.finished)?<><button className="text-button" onClick={async()=>{try{await beforeTranscript?.();const result=await request<{text:string}>(`/a2/runs/${run.id}/transcript/${clip.id}`);setTranscript(result.text);}catch{setError(t('transcriptAfterAttempt'));}}}>{t('transcript')}</button>{transcript&&<div className="audio-transcript"><German text={transcript}/></div>}</>:!restricted&&<p className="help">{t('transcriptAfterAttempt')}</p>}
 </section>;
}
