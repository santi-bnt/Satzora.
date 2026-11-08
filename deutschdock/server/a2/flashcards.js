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
export const flashcards=rows.map(([id,article,lemma,plural,perfect,es,en,topic,first,second])=>({id:`fc-${id}`,article,lemma,plural,perfect,es,en,topic,examples:[first,second],alternatives:[]}));
export function validateFlashcards(cards=flashcards){const errors=[],ids=new Set();for(const c of cards){if(ids.has(c.id))errors.push(`${c.id}: duplicate id`);ids.add(c.id);if(!c.id||!c.lemma||!c.es||!c.en||!c.topic||c.examples?.length<2||new Set(c.examples).size!==c.examples.length||c.examples.some(x=>!x.trim()))errors.push(`${c.id}: incomplete`);if(c.article&&!c.plural)errors.push(`${c.id}: missing plural`);}return errors;}
// A transparent SM-2-derived schedule. Again = 10 minutes; later stages use days.
export function schedule(previous,rating,now=Date.now()){
 if(!['again','hard','good','easy'].includes(rating))throw new Error('invalid_rating');
 const old=previous||{repetitions:0,interval:0,ease:2.5,lapses:0};let repetitions=old.repetitions,interval=old.interval,ease=old.ease,lapses=old.lapses;
 if(rating==='again'){repetitions=0;interval=0;ease=Math.max(1.3,ease-.2);lapses++;}
 else {repetitions++;ease=Math.max(1.3,ease+(rating==='hard'?-.15:rating==='easy'?.15:0));interval=repetitions===1?(rating==='hard'?1:rating==='easy'?4:1):repetitions===2?(rating==='hard'?3:rating==='easy'?8:6):Math.max(interval+1,Math.round(interval*(rating==='hard'?1.2:rating==='easy'?ease*1.3:ease)));}
 return {repetitions,interval,ease:Math.round(ease*100)/100,lapses,due:now+(rating==='again'?10*60*1000:interval*86400000),mastered:repetitions>=3&&interval>=21};
}
export function checkGerman(card,input){const normalize=x=>x.normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de');const expected=[card.lemma,...(card.alternatives||[])];if(card.article)expected.push(...expected.map(x=>`${card.article} ${x}`));return expected.some(x=>normalize(x)===normalize(input));}
