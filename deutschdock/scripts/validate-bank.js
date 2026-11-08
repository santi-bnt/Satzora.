import {mkdirSync,writeFileSync} from 'node:fs';
import {practiceActivities,bankInventory,validateActivity} from '../server/a2/practice-bank.js';
import {validateCurriculum} from '../server/a2/validate.js';
import {validateExams} from '../server/a2/exam-validation.js';

const inventory=bankInventory(),curriculum=validateCurriculum(),exams=validateExams();
const errors=[],activityIds=new Set(),questionOwners=new Map();
for(const activity of practiceActivities){
 if(activityIds.has(activity.id)) errors.push(`${activity.id}: duplicate activity id`);
 activityIds.add(activity.id);
 for(const question of activity.part.questions){
  const owner=questionOwners.get(question.id);
  if(owner&&owner!==activity.id) errors.push(`${question.id}: duplicate question id`);
  questionOwners.set(question.id,activity.id);
 }
 const check=validateActivity(activity);
 if(!check.complete) errors.push(`${activity.id}: ${check.errors.join(', ')}`);
}
const report={...inventory,available:{...inventory.available,lessons:curriculum.actual.lessons,lessonExercises:curriculum.actual.exercises},remaining:{...inventory.remaining,lessons:Math.max(0,inventory.targets.lessons-curriculum.actual.lessons),lessonExercises:Math.max(0,inventory.targets.lessonExercises-curriculum.actual.exercises)},referenceExamples:curriculum.actual.referenceExamples,examItems:exams.counts,errors,automaticChecksCannotProveSemanticAccuracy:true,note:`${inventory.note} Structural checks do not establish linguistic quality, unique meanings, or correspondence of audio to questions; editorial and device review remain necessary.`};
mkdirSync('docs',{recursive:true});
writeFileSync('docs/bank-validation.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(errors.length||!curriculum.complete||!exams.valid)process.exitCode=1;
