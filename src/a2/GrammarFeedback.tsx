import {Check,RotateCcw} from 'lucide-react';
import type {Evaluation} from './types';
import {useA2} from './context';

const labels={
 es:{'word-order':'Orden de palabras','subordinate-verb-order':'Verbo en subordinada','main-verb-position':'Verbo en segunda posición','adjective-placement':'Posición del adjetivo','adjective-declension':'Terminación del adjetivo','missing-word':'Palabra faltante','extra-word':'Palabra adicional',spelling:'Ortografía',capitalization:'Mayúscula del sustantivo',conjugation:'Conjugación','article-case':'Artículo y caso',conjunction:'Conjunción',punctuation:'Puntuación','word-choice':'Elección de palabra'},
 en:{'word-order':'Word order','subordinate-verb-order':'Subordinate-clause verb','main-verb-position':'Verb in second position','adjective-placement':'Adjective position','adjective-declension':'Adjective ending','missing-word':'Missing word','extra-word':'Extra word',spelling:'Spelling',capitalization:'Noun capitalization',conjugation:'Conjugation','article-case':'Article and case',conjunction:'Conjunction',punctuation:'Punctuation','word-choice':'Word choice'}
} as const;

export function GrammarFeedback({value,locale,finished,onRetry,solutionVisible,onToggleSolution}:{value:Evaluation;locale:'es'|'en';finished:boolean;onRetry:()=>void;solutionVisible:boolean;onToggleSolution:()=>void}){
 const {t}=useA2(),es=locale==='es';
 return <section className={`feedback diagnostic-feedback ${value.correct===true?'positive':value.correct===false?'negative':'neutral'}`} aria-live="polite">
  <strong>{value.correct===true?t('correct'):value.correct===false?t('incorrect'):t('orientative')}</strong>
  {value.evaluatedAnswer!==undefined&&<div className="evaluated-original"><b>{es?'Tu respuesta':'Your answer'}</b><span lang="de">{value.evaluatedAnswer||'(vacío)'}</span></div>}
  {value.structureExplanation&&<p className={`structure-result ${value.structure==='correct'?'structure-ok':'structure-warn'}`}>{value.structureExplanation[locale]}</p>}
  {!!value.errors?.length&&<div className="grammar-errors"><h4>{es?'Errores identificados':'Detected issues'}</h4>{value.errors.map((item,index)=><article className={`diagnostic-error ${item.severity}`} key={`${item.type}-${index}`}>
   <strong>{labels[locale][item.type as keyof typeof labels.es]||item.type}</strong>
   {(item.actual||item.expected)&&<div className="grammar-comparison"><div><small>{es?'Tu respuesta':'Your answer'}</small><mark>{item.actual||'∅'}</mark></div><span aria-hidden="true" className="comparison-arrow">→</span><div><small>{es?'Corrección':'Correction'}</small><mark className="expected-token">{item.expected||'∅'}</mark></div></div>}
   <p>{item.explanation[locale]}</p>
  </article>)}</div>}
  {value.errors?.length===0&&value.correct===true&&<p>{es?'No se detectaron errores.':'No errors detected.'}</p>}
  {value.translation&&<p className="answer-translation"><b>{es?'Traducción':'Translation'}:</b> {value.translation[locale]}</p>}
  {value.explanation&&<details className="grammar-rule"><summary>{es?'Regla gramatical':'Grammar rule'}</summary><p>{value.explanation[locale]}</p></details>}
  {value.correct===false&&<div className="diagnostic-actions">{!finished&&<button type="button" className="button outline" onClick={onRetry}><RotateCcw size={15}/>{es?'Intentar otra vez':'Try again'}</button>}<button type="button" className="button outline" onClick={onToggleSolution}>{solutionVisible?(es?'Ocultar solución':'Hide solution'):(es?'Ver solución':'Show solution')}</button></div>}
  {solutionVisible&&value.model&&<div className="diagnostic-solution"><b>{es?'Solución':'Solution'}</b><span lang="de">{value.model}</span></div>}
  {value.errors?.length&&<p className="help">{es?'Al terminar la sesión, los errores evaluados se conservan en Meine Fehler.':'Evaluated mistakes are saved to Meine Fehler when you finish the session.'}</p>}
  {value.words!==undefined&&<p>{t('wordCount')}: {value.words} · {value.range?.join('–')} {t('words')}</p>}
  {value.correct===null&&<p>{t('localLimit')}</p>}
  {value.mixedRegister&&<p>{t('register')}: du / Sie</p>}
 </section>;
}
