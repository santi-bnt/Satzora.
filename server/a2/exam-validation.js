import {existsSync,statSync,mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {examModels} from './exams.js';
import {readingPositionStats} from './reading-positions.js';

const asset=src=>fileURLToPath(new URL(`../../public${src}`,import.meta.url));

export function validateModel(model){
 const errors=[];
 const positionStats=readingPositionStats(model);
 if(positionStats.total!==15||Object.values(positionStats.counts).some(count=>count<4||count>6)||positionStats.longestRun>3)errors.push(`Lesen: biased or excessively predictable a/b/c answer positions (${positionStats.sequence}; ${JSON.stringify(positionStats.counts)}; max run ${positionStats.longestRun})`);
 for(const skill of ['Lesen','Hören','Schreiben','Sprechen']){
  const section=model.sections.find(s=>s.id===skill);
  if(!section){errors.push(`${skill}: missing`);continue;}
  const expected=skill==='Schreiben'?2:skill==='Sprechen'?3:4;
  if(section.parts.length!==expected)errors.push(`${skill}: part count`);
  for(const [i,p] of section.parts.entries()){
   const expectedQuestions=['Lesen','Hören'].includes(skill)?5:1;
   if(p.questions.length!==expectedQuestions)errors.push(`${p.id}: question count`);
   if(skill==='Lesen'&&(!p.document||!p.text||p.text.length<150))errors.push(`${p.id}: missing reading document`);
   if(skill==='Lesen'&&i===0&&(!p.document?.paragraphs?.length||p.questions.some(q=>q.options?.length!==3)))errors.push(`${p.id}: article must have a complete document and five a/b/c questions`);
   if(skill==='Lesen'&&i===1&&(p.document?.kind!=='directory'||p.document.rows?.length<4||p.questions.some(q=>q.options?.length!==3)))errors.push(`${p.id}: information board must be a directory/table with five three-option situations`);
   if(skill==='Lesen'&&i===2&&(p.document?.kind!=='email'||!p.document.from||!p.document.to||!p.document.subject||p.questions.some(q=>q.options?.length!==3)))errors.push(`${p.id}: email must include headers, body and five three-option questions`);
   if(skill==='Lesen'&&i===3){
    const expected=['b','c','d','e','f','X'];
    if(p.document?.kind!=='ads'||p.document.ads?.length!==6||!p.document.ads.some(ad=>ad.id==='a')||p.example?.answer!=='a'||p.questions.some(q=>JSON.stringify(q.options)!==JSON.stringify(expected))||p.questions.filter(q=>q.answers[0]==='X').length!==1||new Set(p.questions.map(q=>q.answers[0])).size!==5)errors.push(`${p.id}: matching structure/example must be excluded and each available ad used at most once`);
   }
   if(skill==='Hören'){
    if(p.plays!==[2,1,1,2][i]||p.clips.length!==[5,1,5,1][i])errors.push(`${p.id}: audio structure`);
    for(const c of p.clips){const src=`/audio/${c.id}.mp3`;if(!c.text||!c.questionIds?.length||!existsSync(asset(src))||statSync(asset(src)).size<1000)errors.push(`${p.id}: audio missing/empty ${c.id}`);}
    if(i===1&&p.images?.length!==9)errors.push(`${p.id}: matching images`);
   }
   for(const q of p.questions){
    if(!q.prompt||!q.id)errors.push(`${p.id}: missing question`);
    if(skill==='Lesen'&&(!q.evidence||!q.contentVersion||!q.editorialReviewed))errors.push(`${q.id}: missing evidence/version/editorial review`);
    if(skill==='Lesen'&&(!q.answers||q.answers.length!==1||!q.review||q.review.options.length!==q.options?.length||q.review.options.some((item,index)=>item.option!==q.options?.[index]||!item.explanation?.es||!item.explanation?.en||item.explanation.es.length<28||item.explanation.en.length<28)||q.review.options.filter(item=>item.correct).length!==1||q.review.options.find(item=>item.correct)?.option!==q.answers[0]))errors.push(`${q.id}: invalid or incomplete option rationales`);
    if(q.type==='choice'&&(!q.options?.includes(q.answers[0])||new Set(q.options).size!==q.options.length))errors.push(`${q.id}: invalid choices`);
    if(['Lesen','Hören'].includes(skill)&&i!==3&&!(skill==='Hören'&&i===1)&&q.options?.length!==3)errors.push(`${q.id}: expected a/b/c`);
    if(skill==='Hören'&&i===3&&q.options?.join('/')!=='Ja/Nein')errors.push(`${q.id}: expected Ja/Nein`);
    if(skill==='Schreiben'){
     const range=i===0?[20,30]:[30,40],kind=i===0?'SMS':'E-Mail';
     if(q.type!=='write'||!q.situation||q.points?.length!==3||q.points.some(point=>typeof point!=='string'||!point.trim())||new Set(q.points).size!==3)errors.push(`${q.id}: writing task must have a situation and exactly three distinct points`);
     if(q.range?.[0]!==range[0]||q.range?.[1]!==range[1])errors.push(`${q.id}: invalid ${kind} word range`);
     if(!new RegExp(`^Schreiben Sie eine ${kind} an .+\\.$`).test(q.formatInstruction||''))errors.push(`${q.id}: missing German ${kind} recipient instruction`);
     if(!q.wordCountInstruction?.startsWith(`Schreiben Sie ${range[0]}–${range[1]} Wörter.`))errors.push(`${q.id}: missing explicit German word-count instruction`);
     if(!q.wordCountInstruction?.includes('allen drei Punkten'))errors.push(`${q.id}: missing three-point instruction`);
     if(q.register!==(i===0?'informal':'semi-formal'))errors.push(`${q.id}: invalid writing register`);
    }
    if(skill==='Sprechen'&&(q.type!=='speak'||!q.oral))errors.push(`${q.id}: oral cards missing`);
    for(const image of [...(q.images||[]),...(p.images||[])])if(!existsSync(asset(image.src)))errors.push(`${q.id}: image missing ${image.src}`);
   }
  }
 }
 return {id:model.id,available:errors.length===0,errors};
}

export function validateExams(){const models=examModels.map(validateModel),reading=examModels.flatMap(m=>m.sections.find(s=>s.id==='Lesen').parts.flatMap(p=>p.questions)),withRationales=reading.filter(q=>q.editorialReviewed&&q.review?.options?.length===q.options?.length&&q.review.options.filter(o=>o.correct).length===1&&q.review.options.every(o=>(o.explanation?.es?.length||0)>=28&&(o.explanation?.en?.length||0)>=28)).length,answerPositions=Object.fromEntries(examModels.map(model=>[model.id,readingPositionStats(model)])),sequences=Object.values(answerPositions).map(stats=>stats.sequence),answerPatternErrors=[];if(new Set(sequences).size!==sequences.length)answerPatternErrors.push('Lesen: simulacra reuse identical correct-answer position sequences');if(!sequences.some(sequence=>[...sequence].some((position,index)=>index>0&&position===sequence[index-1])))answerPatternErrors.push('Lesen: every model forbids consecutive equal answer positions');const valid=models.every(m=>m.available)&&answerPatternErrors.length===0;return {models,counts:{models:examModels.length,reading:reading.length,listening:examModels.length*20,writing:examModels.length*2,speaking:examModels.length*3,audioFiles:new Set(examModels.flatMap(m=>m.sections.flatMap(s=>s.parts.flatMap(p=>(p.clips||[]).map(c=>c.id))))).size,readingWithEvidence:reading.filter(q=>q.evidence).length,readingWithOptionRationales:withRationales,readingNeedsEditorialReview:reading.length-withRationales},answerPositions,answerPatternErrors,valid,qualityComplete:valid&&withRationales===reading.length};}

if(process.argv[1]===fileURLToPath(import.meta.url)){const report=validateExams();mkdirSync('docs',{recursive:true});writeFileSync('docs/exam-validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(!report.valid)process.exitCode=1;}
