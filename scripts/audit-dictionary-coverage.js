import {mkdir,writeFile} from 'node:fs/promises';
import {curriculum,modules} from '../server/a2/curriculum.js';
import {examModels} from '../server/a2/exams.js';
import {practiceActivities} from '../server/a2/practice-bank.js';
import {dictionary,lookup} from '../server/a2/dictionary.js';

const fields=new Set(['title','reading','prompt','instruction','situation','recipient','formatInstruction','wordCountInstruction','points','options','model','models','text','transcript','paragraphs','label','detail','ads','body','subject','from','to','central','keywords','facts','example','de','examples','vocabulary','document','questions','parts','sections','rows','oral','student','partner','exercises','paragraphs']);
const germanWords=text=>String(text).match(/[\p{L}äöüÄÖÜß]+(?:[-’'][\p{L}äöüÄÖÜß]+)*/gu)||[];
function addStrings(value,bucket,key=''){
 if(typeof value==='string'){if(fields.has(key))for(const form of germanWords(value)){const word=form.normalize('NFC').toLocaleLowerCase('de');if(word.length<2||/^\p{N}+$/u.test(word))continue;const item=bucket.get(word)||{word,occurrences:0,samples:[]};item.occurrences++;if(item.samples.length<2&&!item.samples.includes(value))item.samples.push(value);bucket.set(word,item);}return;}
 if(Array.isArray(value)){for(const item of value)addStrings(item,bucket,key);return;}
 if(value&&typeof value==='object')for(const [name,item] of Object.entries(value))if(fields.has(name))addStrings(item,bucket,name);
}
const groups=new Map();
function collect(group,value){const words=groups.get(group)||new Map();addStrings(value,words);groups.set(group,words);}
for(const module of modules)for(const lesson of module.lessons)collect(`Currículo · ${module.id}`,lesson);
for(const model of examModels)for(const section of model.sections)collect(section.id,section);
const seen=new Set(examModels.flatMap(model=>model.sections.flatMap(section=>section.parts.flatMap(part=>part.questions.map(q=>q.id)))));
for(const activity of practiceActivities){const unseen={...activity,part:{...activity.part,questions:activity.part.questions.filter(q=>!seen.has(q.id))}};if(unseen.part.questions.length)collect(activity.skill,unseen);}
function reportFor(words){const rows=[...words.values()].sort((a,b)=>b.occurrences-a.occurrences||a.word.localeCompare(b.word,'de')),covered=rows.filter(item=>lookup(item.word)),missing=rows.filter(item=>!lookup(item.word)).map(({word,occurrences})=>({word,occurrences}));return {uniqueWords:rows.length,occurrences:rows.reduce((n,item)=>n+item.occurrences,0),coveredUnique:covered.length,coveredOccurrences:covered.reduce((n,item)=>n+item.occurrences,0),coverageUniquePercent:rows.length?Number((covered.length*100/rows.length).toFixed(2)):100,coverageOccurrencePercent:rows.length?Number((covered.reduce((n,item)=>n+item.occurrences,0)*100/rows.reduce((n,item)=>n+item.occurrences,0)).toFixed(2)):100,missing};}
const byModule=Object.fromEntries([...groups].map(([name,words])=>[name,reportFor(words)]));
const all=new Map();for(const words of groups.values())for(const item of words.values()){const prior=all.get(item.word)||{word:item.word,occurrences:0,samples:[]};prior.occurrences+=item.occurrences;for(const sample of item.samples)if(prior.samples.length<2&&!prior.samples.includes(sample))prior.samples.push(sample);all.set(item.word,prior);}
const result={generatedAt:new Date().toISOString(),method:'Exact curated lemma/form lookup only. External Wiktionary fallback is not counted as verified coverage because each term has not been queried.',dictionaryEntries:dictionary.length,uniqueWords:all.size,occurrences:[...all.values()].reduce((n,item)=>n+item.occurrences,0),coveredUnique:[...all.values()].filter(item=>lookup(item.word)).length,coverage:reportFor(all),byModule};
if(process.argv.includes('--write')){await mkdir('reports',{recursive:true});await writeFile('reports/dictionary-coverage.json',JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify({generatedAt:result.generatedAt,dictionaryEntries:result.dictionaryEntries,uniqueWords:result.uniqueWords,occurrences:result.occurrences,coveredUnique:result.coveredUnique,coverage:{uniqueWords:result.coverage.uniqueWords,coveredUnique:result.coverage.coveredUnique,coverageUniquePercent:result.coverage.coverageUniquePercent,coveredOccurrences:result.coverage.coveredOccurrences,coverageOccurrencePercent:result.coverage.coverageOccurrencePercent,topMissing:result.coverage.missing.slice(0,30).map(({word,occurrences})=>({word,occurrences}))},byModule:Object.fromEntries(Object.entries(byModule).map(([name,item])=>[name,{uniqueWords:item.uniqueWords,coveredUnique:item.coveredUnique,coverageUniquePercent:item.coverageUniquePercent}]))},null,2));
