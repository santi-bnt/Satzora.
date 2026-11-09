// Stable, versioned answer-position layout for the 15 a/b/c items in each model.
// This is intentionally data-level (not randomized per request/session), so refreshes
// and resumed attempts always show the same option text in the same position.
export const readingAnswerPositions={
 'modell-01':'ABACABBCBBCAACA',
 'modell-02':'AACBBCCBCABBACB',
 'modell-03':'AACBACCBCABCACB'
};

export function readingPositionStats(model){
 const questions=model.sections.find(section=>section.id==='Lesen')?.parts.slice(0,3).flatMap(part=>part.questions)||[];
 const sequence=questions.map(question=>'abc'[question.options.indexOf(question.answers?.[0])]||'?').join('');
 const counts={a:0,b:0,c:0};let longestRun=0,currentRun=0,previous='';
 for(const position of sequence){if(position in counts)counts[position]++;currentRun=position===previous?currentRun+1:1;longestRun=Math.max(longestRun,currentRun);previous=position;}
 return {sequence,counts,longestRun,total:questions.length};
}

export function applyReadingAnswerPositions(models){
 for(const model of models){
  const positions=readingAnswerPositions[model.id];
  if(!positions)throw new Error(`${model.id}: missing stable reading answer-position layout`);
  const parts=model.sections.find(section=>section.id==='Lesen')?.parts||[];
  const questions=parts.slice(0,3).flatMap(part=>part.questions);
  if(questions.length!==15||positions.length!==15)throw new Error(`${model.id}: expected 15 a/b/c reading questions and positions`);
  questions.forEach((question,index)=>{
   const options=question.options||[],answer=question.answers?.[0],current=options.indexOf(answer),target='ABC'.indexOf(positions[index]);
   if(options.length!==3||current<0||target<0)throw new Error(`${question.id}: invalid answer-position data`);
   if(current===target)return;
   const reordered=options.filter(option=>option!==answer);
   reordered.splice(target,0,answer);
   if(question.review){
    const reviewByOption=new Map(question.review.options.map(option=>[option.option,option]));
    if(reordered.some(option=>!reviewByOption.has(option)))throw new Error(`${question.id}: review options cannot follow answer-position shuffle`);
    question.review={...question.review,options:reordered.map(option=>reviewByOption.get(option))};
   }
   question.options=reordered;
   question.contentVersion=(question.contentVersion||2)+1;
  });
 }
 return models;
}
