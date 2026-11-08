import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons,gradeLesson,publicLesson} from './content.js';
test('perfect, mixed, and incorrect answers are graded accurately',()=>{const lesson=lessons[0];assert.equal(gradeLesson(lesson,[1,0,2]).score,3);assert.equal(gradeLesson(lesson,[1,1,2]).score,2);assert.equal(gradeLesson(lesson,[0,1,0]).score,0);});
test('incomplete, out-of-range and malformed submissions are rejected',()=>{for(const answers of [[],null,[1,0],[1,0,9],[1,0,'2'],[1.5,0,2]])assert.throws(()=>gradeLesson(lessons[0],answers));});
test('public lesson payload does not reveal answers or explanations',()=>{for(const lesson of lessons){const result=publicLesson(lesson);assert.equal(result.questions.length,lesson.questions.length);assert.ok(result.questions.every(q=>!('answer'in q)&&!('explanation'in q)));}});
