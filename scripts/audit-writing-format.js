import {curriculum} from '../server/a2/curriculum.js';
import {examModels} from '../server/a2/exams.js';
import {practiceActivities} from '../server/a2/practice-bank.js';

const curriculumWrites=curriculum.flatMap(lesson=>lesson.exercises||[]).filter(item=>item.type==='write');
const practiceWrites=practiceActivities.filter(activity=>activity.skill==='Schreiben').flatMap(activity=>activity.part.questions);
const examWrites=examModels.flatMap(model=>model.sections.find(section=>section.id==='Schreiben').parts.flatMap(part=>part.questions));
const all=[...practiceWrites,...examWrites],unique=new Map(all.map(item=>[item.id,item]));
const failures=[];
for(const item of unique.values()){
 if(!item.situation||item.points?.length!==3||new Set(item.points).size!==3)failures.push({id:item.id,error:'requires situation and exactly three unique points'});
 if(!item.formatInstruction||!item.wordCountInstruction)failures.push({id:item.id,error:'missing format or word-count instruction'});
 const expected=item.writingType==='sms'?[20,30]:item.writingType==='email'?[30,40]:null;if(!expected||JSON.stringify(item.range)!==JSON.stringify(expected))failures.push({id:item.id,error:'incorrect writing range or missing writingType'});
}
const result={curriculumGuidedWriting:curriculumWrites.length,practiceGoetheTasks:practiceWrites.length,examTasks:examWrites.length,uniqueGoetheTasks:unique.size,structuredTasks:[...unique.values()].filter(item=>item.situation&&item.points?.length===3).length,unstructuredCurriculumExercises:curriculumWrites.filter(item=>!item.situation||item.points?.length!==3).length,failures};
console.log(JSON.stringify(result,null,2));if(failures.length)process.exitCode=1;
