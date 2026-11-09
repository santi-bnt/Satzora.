import { module01 } from './modules/01.js';
import { module02 } from './modules/02.js';
import { module03 } from './modules/03.js';
import { module04 } from './modules/04.js';
import { module05 } from './modules/05.js';
import { module06 } from './modules/06.js';
import { module07 } from './modules/07.js';
import { module08 } from './modules/08.js';
import { module09 } from './modules/09.js';
import { module10 } from './modules/10.js';
import { readingMaterials } from './reading.js';
import { examModels } from './exams.js';
import { extraExamples } from './extra-examples.js';
import {diagnoseAnswer} from './diagnose.js';

export const moduleDefinitions = [module01,module02,module03,module04,module05,module06,module07,module08,module09,module10];
const patterns = [['gap','order','choice'],['gap','transform','correct'],['order','transform','write'],['gap','correct','choice'],['order','transform','write']];
export const normalize = value => String(value ?? '').normalize('NFC').toLocaleLowerCase('de').replace(/[„“".!?,;:]/g,'').replace(/\s+/g,' ').trim();

export function buildLesson(def, module, index) {
  const [slug,title,objective,rule,rows,config={}] = def;
  const id = `${module.id}-${slug}`;
  const examples = rows.map(([sentence,focus]) => ({de:sentence,es:`«${focus}»: ${rule.es}`,en:`“${focus}”: ${rule.en}`}));
  for(const sentence of extraExamples[module.id]?.[index]||[])examples.push({de:sentence,es:`Aplicación en contexto: ${rule.es}`,en:`Contextual application: ${rule.en}`});
  const exercises = rows.flatMap(([sentence,focus,wrong,other], row) => patterns[row].map((originalType,part) => {
    const type=config.oral&&originalType==='write'&&row===2?'speak':originalType;
    const stem = sentence.replace(focus,'___');
    const instruction = {
      gap:{es:'Completa el hueco. Escribe solo la expresión que falta.',en:'Complete the gap. Write only the missing expression.'},
      choice:{es:'Elige la forma que completa la frase con la estructura indicada.',en:'Choose the form that completes the sentence with the indicated structure.'},
      order:{es:`Ordena las palabras. Empieza con «${sentence.split(' ')[0]}». Conserva todas las palabras.`,en:`Arrange the words. Start with “${sentence.split(' ')[0]}”. Keep every word.`},
      transform:{es:`Reformula la frase: sustituye «${wrong}» por la forma correcta. Escribe la frase completa sin otros cambios.`,en:`Transform the sentence: replace “${wrong}” with the correct form. Write the whole sentence without other changes.`},
      correct:{es:'Corrige el único error marcado entre corchetes. Conserva el resto de la frase.',en:'Correct the single error in brackets. Keep the rest of the sentence.'},
      write:{es:row===2?'Redacta un correo semiformal de 30–40 palabras. Describe la situación, explica por qué es importante para ti y pide una información o solución concreta. Usa la estructura de la lección y un tratamiento coherente.':'Escribe una SMS de 20–30 palabras a un amigo: informa de la situación, explica el motivo de un cambio y propón un siguiente paso con hora y lugar. Usa la estructura de esta lección; no copies el ejemplo.',en:row===2?'Write a semi-formal email of 30–40 words. Describe the situation, explain why it matters to you and ask for specific information or a solution. Use this lesson’s structure and a consistent register.':'Write a text message of 20–30 words to a friend: describe the situation, explain a reason to change plans and suggest a next step with a time and place. Use this lesson’s structure; do not copy the example.'},
      speak:{es:'Graba una respuesta propia de 30–60 segundos. Usa el contexto como punto de partida, añade detalles y formula una pregunta al interlocutor.',en:'Record your own 30–60 second response. Use the context as a starting point, add details and ask your partner a question.'},
    }[type];
    const prompt = type==='order' ? sentence.split(' ').map((_,i,all)=>all[(i+Math.ceil(all.length/2))%all.length]).join(' / ') : type==='correct' ? sentence.replace(focus,`[${wrong}]`) : type==='transform' ? sentence.replace(focus,wrong) : ['write','speak'].includes(type) ? `Kontext: ${sentence}` : stem;
    const options=type==='choice'?[focus,wrong,other].map((_,i,all)=>all[(i+row)%3]):undefined;
    let writingModel=row===2?`Guten Tag! ${sentence} Das ist für unsere Planung wichtig. Könnten Sie mir bitte einen passenden Vorschlag schicken? Vielen Dank für Ihre Hilfe. Mit freundlichen Grüßen`:`Hallo! ${sentence} Deshalb möchte ich unseren Plan ändern. Treffen wir uns morgen um sechs am Bahnhof?`;
    if(row===2&&writingModel.split(/\s+/).length<30)writingModel=writingModel.replace('Vielen Dank','Nochmals vielen Dank');
    return {id:`${id}-${row+1}-${part+1}`,lessonId:id,moduleId:module.id,type,instruction,prompt,options,answers:['write','speak'].includes(type)?[]:[['gap','choice'].includes(type)?focus:sentence],model:type==='write'?writingModel:sentence,explanation:rule,topic:slug,tags:[module.id,slug,type,type==='speak'?'Sprechen':type==='write'?'Schreiben':config.skill||'Grammatik'],skill:type==='speak'?'Sprechen':type==='write'?'Schreiben':config.skill||'Grammatik',difficulty:row<2?1:row<4?2:3,focus,...(type==='write'?{range:row===2?[30,40]:[20,30]}:{}),...(config.audio?{audio:`/audio/${id}-${row+1}.mp3`}:{})};
  }));
  return {id,moduleId:module.id,index:index+1,title,objective,rule,examples,frequentError:{wrong:rows[0][0].replace(rows[0][1],rows[0][2]),correct:rows[0][0],explanation:rule},reading:readingMaterials[id],vocabulary:rows.slice(0,3).map(([sentence,focus])=>({word:focus,example:sentence,note:rule})),difficulty:index<3?1:index<6?2:3,minutes:20,exercises};
}
export const modules=moduleDefinitions.map(m=>({...m,lessons:m.lessons.map((l,i)=>buildLesson(l,m,i))}));
export const curriculum=modules.flatMap(m=>m.lessons);
// Replace mislabeled comprehension drills with complete, document-backed tasks.
// Keep retired IDs available to persisted sessions; never reinterpret an old answer.
export const archivedExercises=[];
const comprehensionLinks={'m09-anzeigen':['Lesen',3],'m09-emails-lesen':['Lesen',2],'m09-artikel-lesen':['Lesen',0],'m09-durchsagen':['Hören',0],'m09-gespraeche':['Hören',2]};
for(const lesson of curriculum){
 for(const e of lesson.exercises)if(!['write','speak'].includes(e.type))e.skill='Grammatik';
 const link=comprehensionLinks[lesson.id];if(!link)continue;
 const source=examModels[2].sections.find(s=>s.id===link[0]).parts[link[1]].questions;
 const idMap=new Map(source.map((e,i)=>[e.id,`${lesson.id}-exam-v2-${i+1}`]));
 const replacements=source.map(e=>{const clone=structuredClone(e);clone.id=idMap.get(e.id);clone.lessonId=lesson.id;clone.moduleId=lesson.moduleId;clone.instruction={es:'Lee o escucha el documento completo y elige la respuesta respaldada por la información. No es un hueco de gramática.',en:'Read or listen to the complete document and select the answer supported by the information. This is not a grammar gap.'};if(clone.material.clips)clone.material.clips.forEach(c=>c.questionIds=c.questionIds.map(id=>idMap.get(id)).filter(Boolean));return clone;});
 archivedExercises.push(...lesson.exercises.slice(0,5));lesson.exercises.splice(0,5,...replacements);
}
export const exerciseBank=curriculum.flatMap(l=>l.exercises);
export function publicExercise({answers,model,models,explanation,evidence,review,focus,...exercise}) { if(exercise.oral){const {partner,partnerQuestions,...oral}=exercise.oral;return {...exercise,oral};}return exercise; }
export function publicLesson(lesson){return {...lesson,exercises:lesson.exercises.map(publicExercise)};}
export function evaluate(exercise,answer) {
  if(typeof answer!=='string'||answer.length>6000)throw new Error('invalid_answer');
  if(['write','speak'].includes(exercise.type))return {correct:null,status:'orientative',model:exercise.model,explanation:exercise.explanation,words:answer.trim()?answer.trim().split(/\s+/).length:0};
  const options=(exercise.answers||[]).map(model=>({model,...diagnoseAnswer(model,answer)})).sort((a,b)=>a.errors.length-b.errors.length),best=options[0]||{model:exercise.model,errors:[],structure:'correct'};
  const correct=best.errors.length===0;
  const translation=exercise.translation|| (normalize(best.model)==='wir hoffen dass die wohnung noch frei ist'?{es:'Esperamos que la vivienda siga libre.',en:'We hope the apartment is still available.'}:undefined);
  const structureMessage=best.structure==='correct'?{es:'El orden y la estructura general son correctos.',en:'The word order and overall structure are correct.'}:{es:'Revisa el orden o la estructura de la oración.',en:'Review the sentence order or structure.'};
  return {correct,status:correct?'correct':'incorrect',model:best.model,explanation:exercise.explanation,evaluatedAnswer:answer,errors:best.errors,structure:best.structure,structureExplanation:structureMessage,...(translation?{translation}:{})};
}
