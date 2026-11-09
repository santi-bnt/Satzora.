import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import React from 'react';
import {GrammarFeedback} from './GrammarFeedback';
import {AppContext} from './context';
import {translate} from './i18n';

const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost'});
for(const key of ['window','document','navigator','HTMLElement','Event','MouseEvent','KeyboardEvent','MutationObserver','localStorage'])Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true,writable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const {render,screen,fireEvent,cleanup}=await import('@testing-library/react');

test('grammar feedback shows exact phrase comparison, real arrow and keeps full solution hidden until requested',()=>{
 const onRetry=()=>{};const context={locale:'es' as const,t:(key:Parameters<typeof translate>[0])=>translate(key,'es'),word:()=>{},dictionaryEnabled:true,capabilities:{feedback:false,feedbackProvider:null,transcription:false,conversation:false},refresh:async()=>{}};
 const value={correct:false,model:'Die Fahrkarten liegen auf dem kleinen Tisch neben der Tür.',evaluatedAnswer:'Die Fahrkarten liegen auf dem Tisch kleinen neben der Tür.',structure:'incorrect' as const,structureExplanation:{es:'Revisa el orden.',en:'Review the order.'},errors:[{type:'adjective-placement',severity:'grammar' as const,actual:'auf dem Tisch kleinen',expected:'auf dem kleinen Tisch',explanation:{es:'«kleinen» modifica «Tisch» y va antes. «Auf dem» indica ubicación en dativo masculino; el adjetivo termina en -en.',en:'“kleinen” modifies “Tisch” and goes before it. “Auf dem” marks masculine dative location; the adjective takes -en.'}}]};
 try{render(<AppContext.Provider value={context}><GrammarFeedback value={value} locale="es" finished={false} onRetry={onRetry} solutionVisible={false} onToggleSolution={()=>{}}/></AppContext.Provider>);assert.ok(screen.getByText('auf dem Tisch kleinen'));assert.ok(screen.getByText('auf dem kleinen Tisch'));assert.ok(screen.getByText('→'));assert.equal(screen.queryByText(value.model),null);assert.ok(screen.getByText(/va antes/));assert.ok(screen.getByRole('button',{name:'Ver solución'}));assert.ok(screen.getByRole('button',{name:'Intentar otra vez'}));assert.equal(document.body.textContent?.includes('\\u2192'),false);}finally{cleanup();}
});
