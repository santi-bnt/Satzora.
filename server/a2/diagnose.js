const tokens=value=>[...String(value??'').normalize('NFC').matchAll(/[\p{L}]+(?:['’\-][\p{L}]+)*/gu)].map(match=>({text:match[0],lower:match[0].toLocaleLowerCase('de')}));
const wordSets={articles:new Set(['der','die','das','den','dem','des','ein','eine','einen','einem','einer','eines','kein','keine','keinen','keinem','keiner','keines']),
 conjunctions:new Set(['dass','das','weil','denn','wenn','wann','ob','aber','und','oder']),verbForms:new Set(['bin','bist','ist','sind','seid','war','waren','habe','hast','hat','haben','hatte','hatten','gehe','gehst','geht','gehen','ging','gingen','komme','kommst','kommt','kommen','mache','machst','macht','machen','kann','kannst','können','muss','musst','müssen','will','willst','wollen','soll','sollst','sollen'])};
const editDistance=(a,b)=>{let row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]===b[j-1]?0:1));row=next;}return row[b.length];};
const bilingual=(es,en)=>({es,en});
function describeToken(expected,actual,index){
 const e=expected.text,a=actual.text,el=expected.lower,al=actual.lower;
 if(el===al){if(e!==a&&e[0]===e[0].toLocaleUpperCase('de')&&a[0]===a[0].toLocaleLowerCase('de'))return {type:'capitalization',severity:'minor',actual:a,expected:e,explanation:bilingual(`Escribe «${e}» con la mayúscula alemana correcta.`,`Use the correct German capitalization in “${e}”.`)};return null;}
 if(el==='dass'&&al==='das'||el==='das'&&al==='dass')return {type:'conjunction',severity:'grammar',actual:a,expected:e,explanation:bilingual('«Dass» introduce una subordinada y lleva el verbo conjugado al final; «das» es un artículo o pronombre.','“Dass” introduces a subordinate clause and sends the finite verb to the end; “das” is an article or pronoun.')};
 if(wordSets.conjunctions.has(el)&&wordSets.conjunctions.has(al))return {type:'conjunction',severity:'grammar',actual:a,expected:e,explanation:bilingual(`La conjunción «${a}» cambia el sentido o la estructura. Aquí corresponde «${e}».`,`The conjunction “${a}” changes the meaning or structure. “${e}” is required here.`)};
 if(wordSets.articles.has(el)&&wordSets.articles.has(al))return {type:'article-case',severity:'grammar',actual:a,expected:e,explanation:bilingual(`El caso y el género requieren «${e}», no «${a}».`,`Case and gender require “${e}”, not “${a}”.`)};
 if(wordSets.verbForms.has(el)&&wordSets.verbForms.has(al))return {type:'conjugation',severity:'grammar',actual:a,expected:e,explanation:bilingual(`Conjuga el verbo según el sujeto: aquí corresponde «${e}».`,`Conjugate the verb for its subject: “${e}” is required here.`)};
 const distance=editDistance(el,al);if(distance<=1||(distance===2&&Math.max(el.length,al.length)>=7))return {type:'spelling',severity:'minor',actual:a,expected:e,explanation:bilingual(`Corrige la ortografía: se escribe «${e}».`,`Correct the spelling: it is written “${e}”.`)};
 return {type:'word-choice',severity:'grammar',actual:a,expected:e,explanation:bilingual(`En esta consigna debe aparecer «${e}».`,`This task requires “${e}”.`)};
}
const sameMultiset=(a,b)=>a.length===b.length&&[...a].sort().every((word,i)=>word===[...b].sort()[i]);
export function diagnoseAnswer(expectedText,answer){
 const expected=tokens(expectedText),actual=tokens(answer),errors=[];
 if(expected.length===actual.length&&expected.map(x=>x.lower).join('\0')!==actual.map(x=>x.lower).join('\0')&&sameMultiset(expected.map(x=>x.lower),actual.map(x=>x.lower))){
  const wrongAt=expected.findIndex((word,i)=>word.lower!==actual[i].lower);errors.push({type:'word-order',severity:'grammar',actual:actual[wrongAt]?.text||'',expected:expected[wrongAt]?.text||'',explanation:bilingual('Las palabras están presentes, pero su orden no forma la estructura solicitada.','All the words are present, but their order does not match the required structure.')});
 }else if(expected.length===actual.length){
  expected.forEach((word,i)=>{if(word.text!==actual[i].text){const error=describeToken(word,actual[i],i);if(error)errors.push(error);}});
 }else{
  const remaining=new Map();for(const word of actual)remaining.set(word.lower,(remaining.get(word.lower)||0)+1);
  const missing=[];for(const word of expected){const count=remaining.get(word.lower)||0;if(count)remaining.set(word.lower,count-1);else missing.push(word);}
  const extra=[];for(const word of actual){const count=remaining.get(word.lower)||0;if(count){extra.push(word);remaining.set(word.lower,count-1);}}
  if(missing.length===extra.length&&missing.length&&missing.every((word,i)=>editDistance(word.lower,extra[i].lower)<=1))missing.forEach((word,i)=>errors.push(describeToken(word,extra[i],i)));
  else {for(const word of missing)errors.push({type:'missing-word',severity:'grammar',actual:'',expected:word.text,explanation:bilingual(`Falta la palabra «${word.text}».`,`The word “${word.text}” is missing.`)});for(const word of extra)errors.push({type:'extra-word',severity:'grammar',actual:word.text,expected:'',explanation:bilingual(`«${word.text}» no aparece en la solución esperada.`,`“${word.text}” is not in the expected answer.`)});}
 }
 const commas=(String(expectedText).match(/,/g)||[]).length,answerCommas=(String(answer).match(/,/g)||[]).length;if(commas>answerCommas)errors.push({type:'punctuation',severity:'minor',actual:'',expected:',',explanation:bilingual('Añade la coma que separa la oración principal de la subordinada.','Add the comma separating the main clause from the subordinate clause.')});
 const end=String(expectedText).trim().match(/[.!?…]$/)?.[0],answerEnd=String(answer).trim().match(/[.!?…]$/)?.[0];if(end&&!answerEnd)errors.push({type:'punctuation',severity:'minor',actual:'',expected:end,explanation:bilingual('Añade el signo de puntuación final.','Add the final punctuation mark.')});
 const structure=errors.some(error=>['word-order','missing-word','extra-word'].includes(error.type))?'incorrect':'correct';
 return {errors,structure};
}
