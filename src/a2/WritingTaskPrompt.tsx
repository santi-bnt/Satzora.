import {German} from './context';
import type {Exercise} from './types';

export function isStructuredGoetheWriting(exercise:Pick<Exercise,'type'|'situation'|'points'>){
 return exercise.type==='write'&&!!exercise.situation&&exercise.points?.length===3;
}

export function WritingTaskPrompt({exercise}:{exercise:Exercise}){
 if(!isStructuredGoetheWriting(exercise))return null;
 const isSms=exercise.writingType==='sms'||exercise.topic==='sms'||exercise.topic==='writing-sms';
 const format=exercise.formatInstruction||`Schreiben Sie eine ${isSms?'SMS':'E-Mail'}${exercise.recipient?` an ${exercise.recipient}`:''}.`;
 const lengthInstruction=exercise.wordCountInstruction|| (exercise.range?`Schreiben Sie ${exercise.range[0]}–${exercise.range[1]} Wörter.`:'');
 const length=lengthInstruction.replace(/\s*Schreiben Sie zu allen drei Punkten\.?/i,'').trim();
 return <section className="writing-task-prompt" aria-label={isSms?'Schreibaufgabe SMS':'Schreibaufgabe E-Mail'} lang="de">
  <p className="writing-situation"><German text={exercise.situation!}/></p>
  <p className="writing-format-instruction"><German text={format}/></p>
  <div className="writing-task-points"><h4>Schreiben Sie zu allen drei Punkten:</h4><ul>{exercise.points!.map((point,index)=><li key={`${exercise.id}-point-${index}`}><German text={point}/></li>)}</ul></div>
  {length&&<p className="writing-length-instruction">{length}</p>}
 </section>;
}
