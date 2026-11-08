export const SKILLS=['Lesen','Hören','Schreiben','Sprechen'];
const bands={A:5,B:3.5,C:2,D:.5,E:0};
export function writingTaskPoints(assessment,wordCount,minimum){
 if(!assessment||!(assessment.taskBand in bands)||!(assessment.languageBand in bands))return null;
 if(wordCount<minimum/2||assessment.taskBand==='E')return 0;
 return bands[assessment.taskBand]+bands[assessment.languageBand];
}
export function examScores(exercises,evaluations,assessments={}){
 const skills=Object.fromEntries(SKILLS.map(skill=>{
  const items=exercises.filter(e=>e.skill===skill);let points=null,source='pending';
  if(['Lesen','Hören'].includes(skill)&&items.length===20&&items.every(e=>typeof evaluations[e.id]?.correct==='boolean')){points=items.filter(e=>evaluations[e.id].correct).length*1.25;source='verified-answer-key';}
  if(['Schreiben','Sprechen'].includes(skill)&&items.length&&assessments[skill]&&Number.isFinite(assessments[skill].points)&&assessments[skill].points>=0&&assessments[skill].points<=25&&['self','ai-estimate'].includes(assessments[skill].source)){points=assessments[skill].points;source=assessments[skill].source;}
  return [skill,{points,max:25,source,present:items.length>0}];
 }));
 const pending=SKILLS.filter(s=>skills[s].points===null),complete=pending.length===0;
 const written=['Lesen','Hören','Schreiben'].every(s=>skills[s].points!==null)?['Lesen','Hören','Schreiben'].reduce((n,s)=>n+skills[s].points,0):null;
 const total=complete?SKILLS.reduce((n,s)=>n+skills[s].points,0):null;
 return {skills,pending,written,total,max:100,status:complete?'non-official-estimate':'incomplete',meetsReferenceThresholds:complete?total>=60&&written>=45&&skills.Sprechen.points>=15:null,reference:{total:60,written:45,speaking:15},official:false};
}
