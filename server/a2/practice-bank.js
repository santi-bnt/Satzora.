import {existsSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {examModels} from './exams.js';
import {writingActivities} from './bank-writing.js';
import {oralActivities} from './bank-oral.js';
import {readingActivities} from './bank-reading.js';
export const contentTargets={Lesen:100,Hören:100,Schreiben:150,Sprechen:200,lessons:80,lessonExercises:1200,examModels:10};
const seed=examModels.flatMap(model=>model.sections.flatMap(section=>section.parts.map((part,index)=>({id:`bank-${part.id}`,level:'A2',skill:section.id,teil:index+1,topic:model.title,title:`${model.title} · ${part.title}`,part,sourceModel:model.id}))));
export const practiceActivities=[...seed,...readingActivities,...writingActivities,...oralActivities];
export const bankExercises=practiceActivities.flatMap(a=>a.part.questions);
const asset=src=>fileURLToPath(new URL(`../../public${src}`,import.meta.url));
export function validateActivity(a){const errors=[];if(!a.id||a.level!=='A2'||!['Lesen','Hören','Schreiben','Sprechen'].includes(a.skill)||!a.part?.questions?.length)errors.push('invalid_structure');
 if(a.skill==='Lesen'&&(!a.part.document||a.part.questions.length!==5))errors.push('missing_reading_material');
 if(['Lesen','Hören'].includes(a.skill)&&new Set((a.part.questions||[]).map(q=>q.prompt?.trim().toLocaleLowerCase('de'))).size!==(a.part.questions||[]).length)errors.push('duplicate_questions');
 if(a.skill==='Lesen'&&a.teil===4&&a.part.document?.ads?.length!==6)errors.push('invalid_advertisements');
 if(a.skill==='Hören'){if(a.part.questions.length!==5||a.part.plays!==[2,1,1,2][a.teil-1]||a.part.clips?.length!==[5,1,5,1][a.teil-1])errors.push('invalid_listening_format');for(const clip of a.part.clips||[]){if(!clip.text||!clip.questionIds?.length||clip.questionIds.some(id=>!a.part.questions.some(q=>q.id===id)))errors.push('invalid_audio_script');if(!existsSync(asset(`/audio/${clip.id}.mp3`))||statSync(asset(`/audio/${clip.id}.mp3`)).size<1000)errors.push('missing_audio');}}
 for(const e of a.part.questions||[]){if(!e.prompt||!e.id||!e.model)errors.push('incomplete_question');if(e.type==='choice'&&(!e.answers?.length||!e.options?.includes(e.answers[0])||new Set(e.options).size!==e.options.length))errors.push('invalid_answer');if(e.type==='write'&&(!e.situation||e.points?.length!==3||!e.recipient&&!a.sourceModel||!e.range))errors.push('incomplete_writing_task');if(e.type==='write'&&e.range)for(const model of e.models||[e.model]){const count=model.trim().split(/\s+/).length;if(count<e.range[0]||count>e.range[1])errors.push(`model_word_count:${e.id}:${count}`);}if(e.type==='speak'&&!e.oral)errors.push('missing_oral_card');for(const image of [...(e.images||[]),...(a.part.images||[])])if(!existsSync(asset(image.src)))errors.push('missing_image');}
 return {id:a.id,complete:errors.length===0,errors};
}
export function bankInventory(){const validation=practiceActivities.map(validateActivity);const valid=practiceActivities.filter(a=>validation.find(v=>v.id===a.id).complete);const activities=Object.fromEntries(['Lesen','Hören','Schreiben','Sprechen'].map(skill=>[skill,valid.filter(a=>a.skill===skill).length]));const speakingCards=valid.filter(a=>a.skill==='Sprechen').reduce((n,a)=>n+(a.part.questions[0].oral.kind==='personal'?a.part.questions[0].oral.keywords.length:1),0);const available={...activities,Sprechen:speakingCards,examModels:examModels.length};return {targets:contentTargets,available,speakingActivities:activities.Sprechen,remaining:Object.fromEntries(Object.entries(available).map(([key,n])=>[key,Math.max(0,(contentTargets[key]||0)-n)])),questionCount:valid.reduce((n,a)=>n+a.part.questions.length,0),invalid:validation.filter(v=>!v.complete),note:'Sprechen counts individual keyword cards, central-topic cards and planning scenarios; speakingActivities counts complete tasks. Grammar drills are not counted as reading/listening materials.'};}
