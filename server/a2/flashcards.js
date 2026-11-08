// Independently authored A2 vocabulary. Entries are published only with two examples.
const rows=[
 ['termin','der','Termin','Termine','','cita','appointment','Termine','Der Termin beim Arzt ist am Dienstag.','Können wir den Termin auf Freitag verschieben?'],
 ['verspaetung','die','Verspätung','Verspätungen','','retraso','delay','Reisen und Verkehr','Wegen der Verspätung verpasse ich meinen Anschluss.','Der Zug hat heute zehn Minuten Verspätung.'],
 ['fahrkarte','die','Fahrkarte','Fahrkarten','','billete de transporte','travel ticket','Reisen und Verkehr','Wo kann ich eine Fahrkarte nach Bonn kaufen?','Bitte zeigen Sie Ihre Fahrkarte im Zug.'],
 ['wohnung','die','Wohnung','Wohnungen','','vivienda','apartment','Wohnen','Unsere neue Wohnung liegt in der Nähe des Bahnhofs.','Wir suchen eine Wohnung mit zwei Zimmern.'],
 ['rechnung','die','Rechnung','Rechnungen','','factura o cuenta','bill or invoice','Einkaufen','Könnten wir bitte die Rechnung bekommen?','Auf der Rechnung steht ein falscher Preis.'],
 ['nachricht','die','Nachricht','Nachrichten','','mensaje','message','Kommunikation und E-Mails','Vielen Dank für Ihre Nachricht.','Ich schicke dir eine Nachricht, wenn ich ankomme.'],
 ['einladung','die','Einladung','Einladungen','','invitación','invitation','Familie und Freunde','Danke für die Einladung zu deiner Feier.','Ich habe die Einladung gestern per E-Mail bekommen.'],
 ['pruefung','die','Prüfung','Prüfungen','','examen','exam','Schule und Lernen','Meine Prüfung findet nächste Woche statt.','Nach der Prüfung möchte ich einen Ausflug machen.'],
 ['anrufen','','anrufen','','hat angerufen','llamar por teléfono','call by phone','Kommunikation und E-Mails','Ich rufe morgen in der Praxis an.','Hast du deine Kollegin schon angerufen?'],
 ['verschieben','','verschieben','','hat verschoben','aplazar o cambiar de fecha','postpone or reschedule','Termine','Können wir unser Gespräch auf Montag verschieben?','Wegen der Krankheit haben wir die Reise verschoben.'],
 ['umsteigen','','umsteigen','','ist umgestiegen','hacer transbordo','change trains or buses','Reisen und Verkehr','In Köln müssen wir in den Bus umsteigen.','Ich bin am Hauptbahnhof in die U-Bahn umgestiegen.'],
 ['teilnehmen','','teilnehmen','','hat teilgenommen','participar','take part','Freizeit','Möchtest du an dem Kochkurs teilnehmen?','Letztes Jahr habe ich an einem Sportkurs teilgenommen.'],
 ['ausfuellen','','ausfüllen','','hat ausgefüllt','rellenar','fill in','Arbeit und Beruf','Bitte füllen Sie dieses Formular zu Hause aus.','Ich habe den Antrag gestern ausgefüllt.'],
 ['abholen','','abholen','','hat abgeholt','recoger a alguien o algo','pick someone or something up','Alltag und Probleme','Ich hole meine Tochter um vier Uhr ab.','Hast du das Paket schon bei der Post abgeholt?'],
 ['erforderlich','','erforderlich','','','necesario u obligatorio','required','Arbeit und Beruf','Für die Bewerbung ist ein Lebenslauf erforderlich.','Eine Anmeldung ist für den Kurs erforderlich.'],
 ['puenktlich','','pünktlich','','','puntual','on time','Termine','Bitte kommen Sie pünktlich zum Termin.','Obwohl es geregnet hat, war der Bus pünktlich.'],
 ['deshalb','','deshalb','','','por eso','therefore','Alltag und Probleme','Der Bus fällt aus, deshalb gehe ich zu Fuß.','Ich bin krank, deshalb bleibe ich heute zu Hause.'],
 ['trotzdem','','trotzdem','','','aun así','nevertheless','Freizeit','Es regnet, trotzdem machen wir einen Spaziergang.','Das Restaurant war voll; wir haben trotzdem einen Tisch gefunden.'],
 ['bescheid-geben','','Bescheid geben','','hat Bescheid gegeben','avisar o informar','let someone know','Kommunikation und E-Mails','Bitte gib mir bis morgen Bescheid.','Ich habe meiner Chefin schon Bescheid gegeben.'],
 ['sich-freuen','','sich freuen','','hat sich gefreut','alegrarse o tener ganas','be pleased or look forward','Familie und Freunde','Ich freue mich auf deinen Besuch.','Sie hat sich über das Geschenk gefreut.']
];
const difficulty={termin:1,verspaetung:2,fahrkarte:1,wohnung:1,rechnung:1,nachricht:1,einladung:1,pruefung:1,anrufen:2,verschieben:2,umsteigen:2,teilnehmen:2,ausfuellen:2,abholen:2,erforderlich:2,puenktlich:1,deshalb:2,trotzdem:2,'bescheid-geben':3,'sich-freuen':3};
export const flashcards=rows.map(([id,article,lemma,plural,perfect,es,en,topic,first,second])=>({id:`fc-${id}`,article,lemma,plural,perfect,es,en,topic,difficulty:difficulty[id]||2,examples:[first,second],alternatives:[]}));
const clozeBank={
 'fc-termin':['Können wir den _____ auf Freitag verschieben?','Termin'],
 'fc-verspaetung':['Wegen der _____ komme ich zehn Minuten später.','Verspätung'],
 'fc-fahrkarte':['Bitte zeigen Sie Ihre _____ im Zug.','Fahrkarte'],
 'fc-wohnung':['Wir suchen eine _____ mit zwei Zimmern.','Wohnung'],
 'fc-rechnung':['Könnten wir bitte die _____ bekommen?','Rechnung'],
 'fc-nachricht':['Vielen Dank für Ihre _____.','Nachricht'],
 'fc-einladung':['Danke für die _____ zu deiner Feier.','Einladung'],
 'fc-pruefung':['Meine _____ findet nächste Woche statt.','Prüfung'],
 'fc-anrufen':['Hast du deine Kollegin schon _____?','angerufen'],
 'fc-verschieben':['Wegen der Krankheit haben wir die Reise _____.','verschoben'],
 'fc-umsteigen':['In Köln müssen wir in den Bus _____.','umsteigen'],
 'fc-teilnehmen':['Möchtest du an dem Kochkurs _____?','teilnehmen'],
 'fc-ausfuellen':['Ich habe den Antrag gestern _____.','ausgefüllt'],
 'fc-abholen':['Hast du das Paket bei der Post _____?','abgeholt'],
 'fc-erforderlich':['Für die Bewerbung ist ein Lebenslauf _____.','erforderlich'],
 'fc-puenktlich':['Bitte kommen Sie _____ zum Termin.','pünktlich'],
 'fc-deshalb':['Der Bus fällt aus, _____ gehe ich zu Fuß.','deshalb'],
 'fc-trotzdem':['Es regnet, _____ machen wir einen Spaziergang.','trotzdem'],
 'fc-bescheid-geben':['Bitte gib mir bis morgen _____.','Bescheid'],
 'fc-sich-freuen':['Ich freue mich _____ deinen Besuch.','auf']
};
export function validateFlashcards(cards=flashcards){const errors=[],ids=new Set();for(const c of cards){if(ids.has(c.id))errors.push(`${c.id}: duplicate id`);ids.add(c.id);if(!c.id||!c.lemma||!c.es||!c.en||!c.topic||c.examples?.length<2||new Set(c.examples).size!==c.examples.length||c.examples.some(x=>!x.trim()))errors.push(`${c.id}: incomplete`);if(c.article&&!c.plural)errors.push(`${c.id}: missing plural`);}return errors;}
// A transparent SM-2-derived schedule. Again = 10 minutes; later stages use days.
export function schedule(previous,rating,now=Date.now()){
 if(!['again','hard','good','easy'].includes(rating))throw new Error('invalid_rating');
 const old=previous||{repetitions:0,interval:0,ease:2.5,lapses:0};let repetitions=old.repetitions,interval=old.interval,ease=old.ease,lapses=old.lapses;
 if(rating==='again'){repetitions=0;interval=0;ease=Math.max(1.3,ease-.2);lapses++;}
 else {repetitions++;ease=Math.max(1.3,ease+(rating==='hard'?-.15:rating==='easy'?.15:0));interval=repetitions===1?(rating==='hard'?1:rating==='easy'?4:1):repetitions===2?(rating==='hard'?3:rating==='easy'?8:6):Math.max(interval+1,Math.round(interval*(rating==='hard'?1.2:rating==='easy'?ease*1.3:ease)));}
 interval=Math.min(interval,3650);
 return {repetitions,interval,ease:Math.round(ease*100)/100,lapses,due:now+(rating==='again'?10*60*1000:interval*86400000),mastered:repetitions>=3&&interval>=21};
}
export const flashcardModes=['classic','reverse','cloze','sentence'];
export function normalizeGermanAnswer(value,{ignoreCase=true}={}){const text=String(value??'').normalize('NFC').trim().replace(/\s+/g,' ');return ignoreCase?text.toLocaleLowerCase('de'):text;}
export function checkGerman(card,input,{requireArticle=false,variants=[]}={}){const normalize=x=>normalizeGermanAnswer(x);const expected=[card.lemma,...(card.alternatives||[]),...variants];if(card.article){if(requireArticle)return expected.some(x=>normalize(`${card.article} ${x}`)===normalize(input));expected.push(...expected.map(x=>`${card.article} ${x}`));}return expected.some(x=>normalize(x)===normalize(input));}
const escapeRegExp=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
export function makeCloze(card){const authored=clozeBank[card.id];if(authored)return {sentence:authored[0],answer:authored[1],hint:card.topic};for(const sentence of card.examples||[]){const candidates=[card.lemma,...(card.alternatives||[]),...(card.forms?Object.values(card.forms).flatMap(x=>Array.isArray(x)?x:[x]):[])].filter(Boolean).sort((a,b)=>b.length-a.length);for(const target of candidates){const match=new RegExp(`(^|[^\\p{L}])(${escapeRegExp(target)})(?=$|[^\\p{L}])`,'iu').exec(sentence);if(match){const start=match.index+match[1].length;return {sentence:sentence.slice(0,start)+'_____'+sentence.slice(start+match[2].length),answer:match[2],hint:card.topic};}}}return null;}
export function checkCloze(cloze,input){return !!cloze&&normalizeGermanAnswer(input)===normalizeGermanAnswer(cloze.answer);}
export function checkPhraseAgainstModels(input,models=[]){const answer=normalizeGermanAnswer(input);return models.some(model=>normalizeGermanAnswer(model)===answer);}
export function isVocabularyMastered(scheduleState,modeStats={}){return !!scheduleState?.mastered&&['reverse','cloze','sentence'].every(mode=>{const stat=modeStats[mode];return !!stat&&stat.attempts>=2&&stat.correct/stat.attempts>=.75;});}
