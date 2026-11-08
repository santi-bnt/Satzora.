import {writeFileSync} from 'node:fs';
import {curriculum,archivedExercises} from '../server/a2/curriculum.js';
import {examAudio} from '../server/a2/exams.js';
const lessonAudio=curriculum.flatMap(l=>l.examples.flatMap((e,i)=>l.exercises.some(x=>x.audio===`/audio/${l.id}-${i+1}.mp3`)?[{id:`${l.id}-${i+1}`,text:e.de}]:[]));
const archived=archivedExercises.filter(e=>e.audio).map(e=>({id:e.audio.split('/').at(-1).replace('.mp3',''),text:e.model}));
const unique=[...new Map([...archived,...lessonAudio,...examAudio].map(c=>[c.id,c])).values()];
writeFileSync('scripts/audio-manifest.json',JSON.stringify(unique,null,2));
console.log(`${unique.length} original audio scripts`);
