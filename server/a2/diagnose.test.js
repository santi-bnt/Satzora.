import test from 'node:test';
import assert from 'node:assert/strict';
import {diagnoseAnswer} from './diagnose.js';
import {evaluate,curriculum} from './curriculum.js';

const sentence='Die Fahrkarten liegen auf dem kleinen Tisch neben der Tür.';
test('diagnoses the reported adjective-order error with the full corrected phrase and dative rule',()=>{
 const answer='Die Fahrkarten liegen auf dem Tisch kleinen neben der Tür.';
 const result=evaluate(curriculum.flatMap(lesson=>lesson.exercises).find(exercise=>exercise.model===sentence),answer);
 assert.equal(result.correct,false);assert.equal(result.errors[0].type,'adjective-placement');assert.equal(result.errors[0].actual,'auf dem Tisch kleinen');assert.equal(result.errors[0].expected,'auf dem kleinen Tisch');
 assert.match(result.errors[0].explanation.es,/adjetivo atributivo/);assert.match(result.errors[0].explanation.es,/va antes/);assert.match(result.errors[0].explanation.es,/ubicación/);assert.match(result.errors[0].explanation.es,/dativo/);assert.match(result.errors[0].explanation.es,/masculino/);assert.match(result.errors[0].explanation.es,/-en/);
 assert.equal(evaluate(curriculum.flatMap(lesson=>lesson.exercises).find(exercise=>exercise.model===sentence),sentence).correct,true);
});

test('explains adjective declension and location case without mislabeling them as spelling',()=>{
 const adjective=diagnoseAnswer(sentence,'Die Fahrkarten liegen auf dem kleine Tisch neben der Tür.').errors[0];assert.equal(adjective.type,'adjective-declension');assert.match(adjective.explanation.es,/dem/);assert.match(adjective.explanation.es,/terminación/);
 const article=diagnoseAnswer(sentence,'Die Fahrkarten liegen auf den kleinen Tisch neben der Tür.').errors[0];assert.equal(article.type,'article-case');assert.match(article.explanation.es,/ubicación/);assert.match(article.explanation.es,/dativo/);
});

test('identifies subordinate-clause verb order after dass and weil',()=>{
 const dass=diagnoseAnswer('Wir hoffen, dass die Wohnung noch frei ist.','Wir hoffen, dass die Wohnung ist noch frei.').errors[0];assert.equal(dass.type,'subordinate-verb-order');assert.match(dass.explanation.es,/Después de «dass»/);assert.match(dass.explanation.es,/al final/);
 const weil=diagnoseAnswer('Ich bleibe zu Hause, weil ich krank bin.','Ich bleibe zu Hause, weil ich bin krank.').errors[0];assert.equal(weil.type,'subordinate-verb-order');assert.match(weil.explanation.es,/Después de «weil»/);
});

test('explains main verb position, article, conjugation, capitalization, spelling and punctuation distinctly',()=>{
 assert.equal(diagnoseAnswer('Heute gehe ich zur Arbeit.','Heute ich gehe zur Arbeit.').errors[0].type,'main-verb-position');
 assert.equal(diagnoseAnswer('Ich gehe heute nach Hause.','Ich gehen heute nach Hause.').errors[0].type,'conjugation');
 assert.equal(diagnoseAnswer('Die Fahrkarten liegen auf dem kleinen Tisch.','Die Fahrkarten liegen auf den kleinen Tisch.').errors[0].type,'article-case');
 const capitalization=diagnoseAnswer(sentence,'die Fahrkarten liegen auf dem kleinen Tisch neben der Tür.').errors[0];assert.equal(capitalization.type,'capitalization');assert.equal(capitalization.actual,'die');
 const punctuation=diagnoseAnswer(sentence,'Die Fahrkarten liegen auf dem kleinen Tisch neben der Tür').errors[0];assert.equal(punctuation.type,'punctuation');
 assert.deepEqual(diagnoseAnswer(sentence,sentence).errors,[]);
});

test('accepts an explicitly listed alternative model answer',()=>{
 const exercise={type:'order',answers:['Heute gehe ich zu Fuß nach Hause.','Ich gehe heute zu Fuß nach Hause.']};
 assert.equal(evaluate(exercise,'Ich gehe heute zu Fuß nach Hause.').correct,true);
});
