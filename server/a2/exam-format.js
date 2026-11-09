export const pictureMap={
 '🚲':['bicycle','Fahrrad fahren'],'🏊':['swimming','schwimmen'],'🎬':['cinema','ins Kino gehen'],'🍳':['cooking','zusammen kochen'],'🎵':['concert','ein Konzert besuchen'],'🥾':['hiking','wandern'],'📚':['library','Bibliothek'],'🛒':['shopping','einkaufen'],'🎨':['painting','Ausstellung und Malen'],'🎒':['backpack','Rucksack'],'🚗':['car','Auto'],'🏠':['home','zu Hause'],'💐':['flowers','Blumen'],'🍫':['chocolate','Schokolade'],'📖':['book','ein Buch'],'🚕':['taxi','Taxi'],'🚋':['tram','Straßenbahn'],'🚌':['bus','Bus'],'☕':['cafe','Café'],'🔑':['keys','Schlüssel'],'👓':['glasses','Brille'],'📱':['phone','Handy'],'🪴':['plant','Pflanze'],'🚆':['train','Zug'],'💧':['water','Wasserflaschen']
};
export function picture(symbol){const [id,alt]=pictureMap[symbol]||[];if(!id)throw new Error(`Unknown picture: ${symbol}`);return {id,src:`/exam-images/${id}.svg`,alt};}
const readingInstructions=['Lesen Sie den Artikel. Wählen Sie bei den Aufgaben 1 bis 5 die richtige Antwort a, b oder c.','Lesen Sie die Informationstafel und die fünf Situationen. Wählen Sie a, b oder c.','Lesen Sie die E-Mail. Wählen Sie bei den Aufgaben 11 bis 15 die richtige Antwort a, b oder c.','Ordnen Sie die Situationen den Anzeigen zu. a ist das Beispiel und nicht mehr wählbar. Jede Anzeige nur einmal. Für eine Situation gibt es keine passende Anzeige: X.'];
const writingPoints=[
 [['Entschuldigen Sie sich.','Nennen Sie den Grund.','Schlagen Sie eine neue Uhrzeit und einen Treffpunkt vor.'],['Bedanken Sie sich und sagen Sie zu.','Informieren Sie, dass Sie eine Begleitung mitbringen.','Fragen Sie, was Sie zu essen mitbringen können.']],
 [['Entschuldigen Sie sich.','Erklären Sie, warum Sie morgen nicht kommen können.','Schlagen Sie einen anderen Tag und einen Treffpunkt vor.'],['Bedanken Sie sich und sagen Sie zu.','Erklären Sie, dass Sie später kommen.','Fragen Sie nach dem genauen Treffpunkt.']]
];
const writingInstructions=[
 [['Schreiben Sie eine SMS an Ihren Freund.','Schreiben Sie eine E-Mail an Ihren Kollegen, Herrn Wagner.'],['Schreiben Sie eine SMS an Ihre Freundin.','Schreiben Sie eine E-Mail an Ihre Kursleiterin, Frau Neumann.'],['Schreiben Sie eine SMS an Ihren Freund.','Schreiben Sie eine E-Mail an Frau König.']]
];
export function formatModels(models){return models.map((model,index)=>{
 const second=index===1;
 for(const [i,part] of model.sections[0].parts.entries()){
  part.id=`${model.id}-Lesen-${i+1}`;part.instruction=part.instruction||readingInstructions[i];
  if(!part.document){const lines=part.text.split('\n');
   if(i===0){const sentences=lines.slice(1).join(' ').split(/(?<=\.)\s+/);const width=Math.ceil(sentences.length/3);part.document={kind:'article',title:lines[0],paragraphs:Array.from({length:3},(_,j)=>sentences.slice(j*width,(j+1)*width).join(' ')).filter(Boolean)};}
   if(i===1)part.document={kind:'directory',title:lines[0],rows:lines.slice(1).map(line=>{const split=line.indexOf(':');return {label:split<0?'Hinweis':line.slice(0,split),detail:split<0?line:line.slice(split+1).trim()};})};
   if(i===2)part.document={kind:'email',from:index===2?'Lotte <lotte@example.test>':second?'Tarek <tarek@example.test>':'Mira <mira@example.test>',to:index===2?'Bea <bea@example.test>':second?'Emil <emil@example.test>':'Nora <nora@example.test>',subject:index===2?'Unser Wochenende am See':second?'Fotokurs am Sonntag – bitte Kamera bestätigen':'Unser Ausflug: neuer Treffpunkt',paragraphs:lines};
   if(i===3)part.document={kind:'ads',title:'Anzeigen',ads:lines.map(line=>({id:line[0],title:line.slice(4).split(':')[0],body:line.slice(4)}))};
  }
  if(i===3){part.example={label:model.id==='modell-03'?'Eine Person sucht einen offenen Treff für Hobbyfotografen.':index===1?'Eine Person sucht eine kostenlose Laufgruppe.':'Eine Person sucht lockere Sprachpraxis.',answer:'a'};part.instruction='Ordnen Sie die Situationen den Anzeigen b bis f zu. Anzeige a ist das Beispiel und nicht mehr wählbar. Jede Anzeige nur einmal. Für eine Situation gibt es keine passende Anzeige: X.';}
  for(const q of part.questions){q.material={skill:'Lesen',partId:part.id,title:part.title,instruction:part.instruction,document:part.document};q.evidence=q.evidence||q.explanation;q.contentVersion||=2;}
 }
 for(const [i,part] of model.sections[1].parts.entries()){
  part.id=`${model.id}-Hören-${i+1}`;part.images=part.pictures?.map(picture);
  if(i===1)part.example=part.example||{label:'Montag',answer:index===2?'b':second?'c':'a'};
  for(const [j,q] of part.questions.entries()){
   q.images=q.pictureOptions?.map(picture);
   q.material={skill:'Hören',partId:part.id,title:part.title,instruction:part.instruction,images:part.images,example:part.example,plays:part.plays,clips:(part.clips.length===1?part.clips:[part.clips[j]]).map(c=>({id:c.id,audio:`/audio/${c.id}.mp3`,questionIds:part.clips.length===1?part.questions.map(q=>q.id):[q.id]}))};
  }
  for(const [j,clip] of part.clips.entries())clip.questionIds=part.clips.length===1?part.questions.map(q=>q.id):[part.questions[j].id];
 }
 for(const [i,part] of model.sections[2].parts.entries()){
  part.id=`${model.id}-Schreiben-${i+1}`;const q=part.questions[0];q.writingType=i===0?'sms':'email';q.points=q.points||writingPoints[second?1:0][i];q.register=i===0?'informal':'semi-formal';q.situation=q.situation||q.prompt.split(' Schreiben Sie')[0];q.formatInstruction=writingInstructions[0][Math.min(index,2)][i];q.wordCountInstruction=`Schreiben Sie ${q.range[0]}–${q.range[1]} Wörter. Schreiben Sie zu allen drei Punkten.`;
  q.material={skill:'Schreiben',partId:part.id,title:part.title,situation:q.situation,points:q.points,range:q.range};
 }
 const oral=model.sections[3].parts;
 const keywords=second?['Ausbildung?','Lieblingsessen?','Verkehrsmittel?','Nachbarn?']:['Arbeitsplatz?','Geschwister?','Freizeit?','Reisen?'];
 const questions=second?['Was haben Sie gelernt?','Was essen Sie besonders gern?','Wie kommen Sie zur Arbeit?','Was machen Sie mit Ihren Nachbarn?']:['Was machen Sie beruflich?','Haben Sie Geschwister?','Was machen Sie nach der Arbeit?','Wohin fahren Sie gern?'];
 oral[0].questions[0].oral=oral[0].questions[0].oral||{kind:'personal',keywords,partnerQuestions:questions};
 oral[1].questions[0].oral=oral[1].questions[0].oral||{kind:'topic',central:second?'Wie sieht ein guter Arbeitstag für Sie aus?':'Wie verbringen Sie einen freien Tag?',keywords:second?['Beginn?','Aufgaben?','Kollegen?','Pausen?']:['Aktivitäten?','Mit wem?','Wo?','Essen?']};
 oral[2].questions[0].oral=oral[2].questions[0].oral||{kind:'planning',situation:second?'Sie möchten gemeinsam ein Geschenk für eine Kollegin kaufen. Finden Sie einen Termin und entscheiden Sie, wo Sie einkaufen und wie viel Sie ausgeben.':'Sie möchten einen gemeinsamen Ausflug organisieren. Vereinbaren Sie Termin, Ziel und Aufgaben.',student:{title:'Ihre Karte · Person A',facts:second?['Budget: höchstens 25 Euro','Freitag: ab 17 Uhr frei','Samstag: bis 14 Uhr Arbeit','Idee: Buch oder Pflanze']:['Freitag: ab 18 Uhr frei','Samstag: Arbeit 9–12 Uhr','Sonntag: bis 15 Uhr frei','Sie können Essen mitbringen']},partner:{title:'Karte B',facts:second?['Freitag: Arbeit bis 19 Uhr','Samstag: ab 15 Uhr frei','Budget: höchstens 20 Euro','Die Kollegin mag Pflanzen und liest gern']:['Freitagabend: Arbeit','Samstag: Arbeit bis 15 Uhr','Sonntag: frei','Sie können Getränke mitbringen']}};
 for(const [i,part] of oral.entries()){part.id=`${model.id}-Sprechen-${i+1}`;const q=part.questions[0];q.material={skill:'Sprechen',partId:part.id,title:part.title};}
 return model;
});}
