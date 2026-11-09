/** Editorial notes for every answer option in the three original Goethe A2 practice models.
 * Each rationale was checked against its document and the keyed answer. Keep IDs stable:
 * historical attempts refer to these IDs.
 */
const item=(evidence,es,en)=>({evidence,es,en});
const readingOverrides={
 'modell-02-Lesen-1':{prompt:'Was war Frau Seidels Beruf, bevor sie die Werkstatt eröffnete?',options:['Sie fuhr beruflich einen Bus.','Sie baute Möbel als Schreinerin.','Sie verkaufte Waren in diesem Supermarkt.'],answerIndex:0},
 'modell-02-Lesen-2':{prompt:'Wie nutzt Frau Seidel das frühere Supermarktgebäude?',options:['Sie hat es für zwei Jahre gemietet.','Die Stadt hat es ihr geschenkt.','Sie hat es als Werkstatt gekauft.'],answerIndex:0},
 'modell-02-Lesen-3':{prompt:'Was müssen die Teilnehmenden für den kostenlosen Mittwochskurs einplanen?',options:['Sie bringen ihr eigenes Material mit.','Sie bezahlen die Werkzeuge der Stadt.','Sie bekommen alle Materialien vor Ort.'],answerIndex:0},
 'modell-02-Lesen-4':{prompt:'Warum ist die Zahl der Teilnehmenden am Freitag begrenzt?',options:['Es gibt nicht genug Nähmaschinen für mehr als acht Personen.','Der Kurs ist ausschließlich für Jugendliche geplant.','Die Werkstatt bleibt am Freitag nur kurz geöffnet.'],answerIndex:0},
 'modell-02-Lesen-5':{prompt:'Wofür verwendet die Gruppe das Geld aus dem Verkauf?',options:['Um die Kosten für den Raum zu bezahlen.','Um allen Helfern einen Lohn zu geben.','Um einen Bus für die Werkstatt zu kaufen.'],answerIndex:0},
 'modell-01-Lesen-11':{prompt:'Warum beginnt der Ausflug nicht mit dem Museumsbesuch?',options:['Das Museum öffnet wegen einer Veranstaltung erst später.','Die Gruppe möchte zuerst die Fahrkarten kaufen.','Mira wartet am Vormittag auf Lena im Hotel.'],answerIndex:0},
 'modell-01-Lesen-12':{prompt:'Was muss eine Person aus der Gruppe für den Museumseintritt einplanen?',options:['Den normalen Preis von acht Euro ohne Gruppenermäßigung.','Einen ermäßigten Preis, weil sie zu sechst sind.','Nichts, denn die Eintrittskarten sind schon bezahlt.'],answerIndex:0},
 'modell-01-Lesen-13':{prompt:'Warum muss Nora Mira diesmal kein Geld für ihre Fahrkarte geben?',options:['Mira schuldet Nora noch Geld von einem früheren Essen.','Die Zugfahrt ist für alle kostenlos.','Nora hat die Fahrkarte bereits selbst bezahlt.'],answerIndex:0},
 'modell-02-Lesen-11':{prompt:'Was ändert sich am Kursort, wenn das Wetter trocken ist?',options:['Die Gruppe fotografiert zunächst draußen am Hafen.','Alle bleiben zuerst im Kursraum der Schule.','Die Gruppe beginnt mit dem Mittagessen im Café.'],answerIndex:0},
 'modell-02-Lesen-12':{prompt:'Welche Ausrüstung reicht für die erste Fotoübung nicht aus?',options:['Ein Handy allein.','Eine Kamera.','Eine Kamera, die man ausgeliehen hat.'],answerIndex:0},
 'modell-02-Lesen-13':{prompt:'Warum muss Emil die Leihkamera vor dem Wochenende holen?',options:['Das Büro der Schule ist am Samstag geschlossen.','Der Hafen verleiht am Sonntag keine Geräte.','Die Kamera wird erst nach dem Kurs benötigt.'],answerIndex:0},
 'modell-02-Lesen-14':{prompt:'Wie ist das Mittagessen finanziell organisiert?',options:['Es kostet extra und gehört nicht zur Kursgebühr.','Es ist im Kurspreis enthalten.','Alle Teilnehmenden bringen ihr Essen selbst mit.'],answerIndex:0},
 'modell-02-Lesen-15':{prompt:'Was sollen die Teilnehmenden bei Regen tun?',options:['Direkt zur Schule kommen, statt am Hafen zu starten.','Den Kurs absagen und auf einen anderen Sonntag warten.','Im Hafencafé auf eine Nachricht der Kursleiterin warten.'],answerIndex:0},
 'modell-03-Lesen-11':{prompt:'Welchen Vorteil hat das Hotel trotz des Weges zum See?',options:['Die Gäste können kostenlos Fahrräder ausleihen.','Das Abendessen ist im Zimmerpreis enthalten.','Das Hotel liegt direkt neben dem See.'],answerIndex:0},
 'modell-03-Lesen-12':{prompt:'Was können Lotte und Bea erledigen, bevor sie ihr Zimmer beziehen?',options:['Ihr Gepäck an der Rezeption abgeben.','Im Hotel einen Helm ausleihen.','Schon ab morgens das Zimmer benutzen.'],answerIndex:0},
 'modell-03-Lesen-13':{prompt:'Was ist der Plan, falls Bea Lotte nicht am Bahnhof abholen kann?',options:['Lotte fährt mit dem Bus zum Hotel.','Lotte wartet bis zum Nachmittag am Bahnhof.','Lotte nimmt ein Taxi direkt zum See.'],answerIndex:0},
 'modell-03-Lesen-14':{prompt:'Wie kann Bea am Sonntagnachmittag ihre eigenen Pläne machen?',options:['Lotte besucht das Museum auch allein, wenn Bea nicht mitkommt.','Lotte fährt schon am Morgen mit Bea nach Hause.','Bea muss Lotte den ganzen Nachmittag begleiten.'],answerIndex:0},
 'modell-03-Lesen-15':{prompt:'Welche Information möchte Lotte bis Mittwoch von Bea bekommen?',options:['Ob Bea ein vegetarisches Frühstück möchte.','Ob Bea am Bahnhof um 9:20 ankommt.','Ob Bea ein Fahrrad oder einen Helm mitbringt.'],answerIndex:0}
};
export const readingReviews={
 // Modell 01 · Teil 2: Stadthaus directory (service-to-floor matching)
 'modell-01-Lesen-6':item('EG: Bürgerbüro, Ausweise, Fundbüro, Information.',[
  'Correcta: el Fundbüro es el lugar donde se recogen objetos perdidos.',
  'Incorrecta: en el primer piso están los cursos de idiomas y el servicio de copias.',
  'Incorrecta: el directorio sitúa el Fundbüro en la planta baja, no en otro piso.'
 ],[
  'Correct: the lost-property office is where you collect lost items.',
  'Incorrect: the first floor has language courses and copying services.',
  'Incorrect: the directory places lost property on the ground floor, not another floor.'
 ]),
 'modell-01-Lesen-7':item('2. Stock: Arbeitsberatung, Bewerbungsfotos, Computerraum.',[
  'Incorrecta: el primer piso ofrece cursos y trámites de inscripción, no asesoría laboral.',
  'Correcta: la asesoría laboral puede ayudar con una solicitud de empleo.',
  'Incorrecta: la información indica el segundo piso; “otro piso” no corresponde.'
 ],[
  'Incorrect: the first floor offers courses and registration, not employment advice.',
  'Correct: employment advice can help with a job application.',
  'Incorrect: the information gives the second floor; “another floor” does not fit.'
 ]),
 'modell-01-Lesen-8':item('3. Stock: Stadtbibliothek, Lesesaal, Rückgabe von Medien.',[
  'Incorrecta: la planta baja alberga oficinas municipales y objetos perdidos.',
  'Incorrecta: el primer piso tiene cursos y copias; la devolución de libros está en otro nivel.',
  'Correcta: el tercer piso es la biblioteca y allí se devuelven los materiales prestados.'
 ],[
  'Incorrect: the ground floor has municipal offices and lost property.',
  'Incorrect: the first floor has courses and copying; book returns are elsewhere.',
  'Correct: the third floor is the library and handles returns.'
 ]),
 'modell-01-Lesen-9':item('1. Stock: Sprachkurse, Kursanmeldung, Kopierservice.',[
  'Correcta: la inscripción al curso se hace en el primer piso.',
  'Incorrecta: el tercer piso es la biblioteca, no la oficina de cursos.',
  'Incorrecta: el directorio nombra explícitamente la inscripción en el primer piso.'
 ],[
  'Correct: course registration is on the first floor.',
  'Incorrect: the third floor is the library, not the course office.',
  'Incorrect: the directory explicitly places registration on the first floor.'
 ]),
 'modell-01-Lesen-10':item('4. Stock: Café, Dachterrasse, Veranstaltungsraum.',[
  'Incorrecta: en el segundo piso hay asesoría laboral y una sala de computadoras.',
  'Correcta: el café está en el cuarto piso, así que allí se puede tomar algo antes del evento.',
  'Incorrecta: la planta baja tiene atención ciudadana, no un café.'
 ],[
  'Incorrect: the second floor has employment advice and a computer room.',
  'Correct: the café is on the fourth floor, where you can get a drink before the event.',
  'Incorrect: the ground floor has public services, not a café.'
 ]),
 // Modell 01 · Teil 3: email
 'modell-01-Lesen-11':item('Deshalb besuchen wir zuerst den Wochenmarkt und essen dort zu Mittag.',[
  'Correcta: el cambio de horario del museo hace que el grupo vaya primero al mercado y coma allí.',
  'Incorrecta: el museo abre por la tarde, por eso no es la primera actividad.',
  'Incorrecta: el correo menciona comer en el mercado, no en un restaurante de la estación.'
 ],[
  'Correct: the museum’s changed opening time means the group goes to the market and eats there first.',
  'Incorrect: the museum opens in the afternoon, so it is not the first activity.',
  'Incorrect: the email says they will eat at the market, not at a station restaurant.'
 ]),
 'modell-01-Lesen-12':item('Der Eintritt ins Museum kostet acht Euro; für unsere Gruppe gibt es leider keine Ermäßigung.',[
  'Incorrecta: el grupo no recibe descuento; por eso no paga menos por persona.',
  'Correcta: son ocho euros y no hay descuento para el grupo.',
  'Incorrecta: la entrada no es gratuita; el correo indica un precio.'
 ],[
  'Incorrect: the group gets no discount, so the price is not reduced.',
  'Correct: it costs eight euros and the group receives no discount.',
  'Incorrect: admission is not free; the email gives a price.'
 ]),
 'modell-01-Lesen-13':item('Du brauchst mir dafür diesmal kein Geld zu geben, denn ich schulde dir noch etwas vom letzten Restaurantbesuch.',[
  'Incorrecta: Mira ya compró los billetes y no pide un pago inmediato.',
  'Incorrecta: Nora tampoco tiene que llevar dinero el sábado; Mira dice que no debe pagarle esta vez.',
  'Correcta: Mira descuenta el costo porque todavía le debe dinero a Nora.'
 ],[
  'Incorrect: Mira has already bought the tickets and asks for no immediate payment.',
  'Incorrect: Nora need not bring money on Saturday either; Mira says she owes Nora.',
  'Correct: Mira offsets the cost because she still owes Nora money.'
 ]),
 'modell-01-Lesen-14':item('Wir treffen uns um neun Uhr nicht im Bahnhof, sondern an der Bushaltestelle davor.',[
  'Correcta: quedan en la parada de autobús que está delante de la estación.',
  'Incorrecta: el museo abre después y no es el lugar de encuentro.',
  'Incorrecta: Lena va directamente al mercado; el grupo queda primero junto a la estación.'
 ],[
  'Correct: they meet at the bus stop in front of the station.',
  'Incorrect: the museum opens later and is not the meeting point.',
  'Incorrect: Lena goes straight to the market; the group meets by the station first.'
 ]),
 'modell-01-Lesen-15':item('Am Abend möchte ich früh zurückfahren, weil ich am Sonntag arbeiten muss.',[
  'Incorrecta: el motivo indicado es el trabajo del domingo, no una visita por la noche.',
  'Correcta: Mira quiere volver temprano porque trabaja el domingo.',
  'Incorrecta: el correo no dice que no le guste el mercado; el mercado forma parte del plan.'
 ],[
  'Incorrect: the stated reason is Sunday work, not an evening visitor.',
  'Correct: Mira wants to return early because she works on Sunday.',
  'Incorrect: the email does not say she dislikes the market; it is part of the plan.'
 ]),
 // Modell 01 · Teil 4: advertisements; a is the solved example and is deliberately not an option
 'modell-01-Lesen-16':item('c · Tierzeit: Betreuung von Katzen während Ihres Urlaubs, auch am Wochenende.',[
  'Incorrecta: b repara bicicletas, no cuida animales.',
  'Correcta: c ofrece cuidar gatos durante las vacaciones.',
  'Incorrecta: d es un curso de guitarra para adultos.',
  'Incorrecta: e intercambia libros; no cuida mascotas.',
  'Incorrecta: f es un espacio de estudio tranquilo.',
  'Incorrecta: c coincide con la necesidad, así que X no se usa.'
 ],[
  'Incorrect: b repairs bicycles; it does not care for animals.',
  'Correct: c offers cat care during holidays.',
  'Incorrect: d is an evening guitar course for adults.',
  'Incorrect: e exchanges books; it does not care for pets.',
  'Incorrect: f is a quiet study space.',
  'Incorrect: c fits the need, so X is not used.'
 ]),
 'modell-01-Lesen-17':item('d · Stadtklang: Gitarrenkurs für Erwachsene am Abend, Instrumente können ausgeliehen werden.',[
  'Incorrecta: b presta ayuda para mudanzas técnicas? No, anuncia reparación de bicicletas.',
  'Incorrecta: c ofrece cuidado de gatos durante vacaciones.',
  'Correcta: d permite aprender guitarra por la tarde y prestar un instrumento.',
  'Incorrecta: e es intercambio de libros, no clases de música.',
  'Incorrecta: f ofrece un lugar tranquilo para estudiar, no un curso.',
  'Incorrecta: hay un curso apropiado en d; X se usa solo cuando no hay coincidencia.'
 ],[
  'Incorrect: b advertises bicycle repair, not music lessons.',
  'Incorrect: c offers cat care during holidays.',
  'Correct: d offers evening guitar lessons and lets learners borrow an instrument.',
  'Incorrect: e is a book exchange, not a music class.',
  'Incorrect: f is a quiet place to study, not a class.',
  'Incorrect: d matches the need, so X does not apply.'
 ]),
 'modell-01-Lesen-18':item('b · Reparatur nur Montag–Freitag; die gesuchte Reparatur am Sonntag wird nicht angeboten.',[
  'Incorrecta: b no trabaja los domingos; su horario termina el viernes.',
  'Incorrecta: c cuida gatos, no repara bicicletas.',
  'Incorrecta: d ofrece clases de guitarra, no reparación.',
  'Incorrecta: e intercambia libros.',
  'Incorrecta: f es una sala de estudio.',
  'Correcta: ninguna oferta repara bicicletas el domingo; X indica que no hay anuncio adecuado.'
 ],[
  'Incorrect: b is closed on Sunday; it works only Monday to Friday.',
  'Incorrect: c cares for cats, not bicycles.',
  'Incorrect: d offers guitar lessons, not repairs.',
  'Incorrect: e exchanges books.',
  'Incorrect: f is a study room.',
  'Correct: no offer repairs bicycles on Sunday; X means no advertisement fits.'
 ]),
 'modell-01-Lesen-19':item('f · Lernraum: Ruhige Arbeitsplätze mit WLAN, täglich 7–22 Uhr.',[
  'Incorrecta: b repara bicicletas a domicilio.',
  'Incorrecta: c ofrece cuidado de gatos.',
  'Incorrecta: d es un curso de guitarra.',
  'Incorrecta: e trata de intercambiar libros.',
  'Correcta: f ofrece un espacio silencioso hasta las diez de la noche.',
  'Incorrecta: sí hay una opción que cumple la necesidad, así que X no corresponde.'
 ],[
  'Incorrect: b provides bicycle repairs at home.',
  'Incorrect: c provides cat care.',
  'Incorrect: d is a guitar class.',
  'Incorrect: e is a book exchange.',
  'Correct: f offers a quiet place until 10 p.m.',
  'Incorrect: an advertisement fits, so X does not apply.'
 ]),
 'modell-01-Lesen-20':item('e · Buchtausch: gelesene Bücher mitbringen und andere kostenlos mitnehmen.',[
  'Incorrecta: b ofrece reparación de bicicletas.',
  'Incorrecta: c cuida gatos durante las vacaciones.',
  'Incorrecta: d enseña guitarra y presta instrumentos.',
  'Correcta: e permite llevarse otros libros sin pagar.',
  'Incorrecta: f sirve para estudiar, no para conseguir libros.',
  'Incorrecta: e responde a la necesidad, por lo que no se marca X.'
 ],[
  'Incorrect: b offers bicycle repairs.',
  'Incorrect: c cares for cats during holidays.',
  'Incorrect: d teaches guitar and lends instruments.',
  'Correct: e lets visitors take other books for free.',
  'Incorrect: f is for studying, not for getting books.',
  'Incorrect: e matches the need, so X is not correct.'
 ]),
 // Modell 02 · Teil 1: article
 'modell-02-Lesen-1':item('Seit September betreibt die ehemalige Busfahrerin Frau Seidel eine offene Werkstatt.',[
  'Correcta: antes de abrir la Werkstatt, Frau Seidel trabajaba conduciendo un autobús.',
  'Incorrecta: el carpintero solo aparece como instructor de un curso, no como el antiguo trabajo de ella.',
  'Incorrecta: el supermercado es el local anterior que ahora ocupa la Werkstatt; el texto no dice que ella vendiera allí.'
 ],[
  'Correct: before opening the workshop, Frau Seidel worked as a bus driver.',
  'Incorrect: the carpenter is only a course instructor, not her former job.',
  'Incorrect: the supermarket is the former building now used by the workshop; it was not her stated job.'
 ]),
 'modell-02-Lesen-2':item('Frau Seidel hat die Räume nicht gekauft, sondern für zunächst zwei Jahre gemietet.',[
  'Incorrecta: la frase niega que la ciudad haya comprado el local.',
  'Correcta: ella alquila las instalaciones inicialmente por dos años.',
  'Incorrecta: no son propiedad de Frau Seidel; el texto dice que las alquiló.'
 ],[
  'Incorrect: the text says the city did not buy the premises.',
  'Correct: she rents the premises initially for two years.',
  'Incorrect: she does not own them; the text says she rented them.'
 ]),
 'modell-02-Lesen-3':item('Der Kurs ist kostenlos, aber die Teilnehmer bringen ihr Material selbst mit.',[
  'Incorrecta: el curso no reparte el material; cada participante lleva el suyo.',
  'Incorrecta: la ciudad aporta herramientas al proyecto, pero no se indica que haya que pagarlas en este curso.',
  'Correcta: el material necesario lo trae cada participante.'
 ],[
  'Incorrect: the course does not distribute materials; each participant brings their own.',
  'Incorrect: the city supports the project with tools; the text does not say students pay for tools.',
  'Correct: each participant brings the required material.'
 ]),
 'modell-02-Lesen-4':item('Wegen der wenigen Nähmaschinen können höchstens acht Personen teilnehmen.',[
  'Correcta: hay un máximo de ocho plazas porque no hay muchas máquinas de coser.',
  'Incorrecta: la inscripción es necesaria antes del miércoles; no se ofrece el curso sin apuntarse.',
  'Incorrecta: el texto dice que la segunda Werkstatt será para jóvenes; no limita a ellos el curso del viernes.'
 ],[
  'Correct: there are at most eight places because there are few sewing machines.',
  'Incorrect: registration is required by Wednesday; the course is not advertised as drop-in.',
  'Incorrect: the second workshop is planned for young people; Friday’s course is not restricted to them.'
 ]),
 'modell-02-Lesen-5':item('Mit dem Geld bezahlt sie die Miete; niemand bekommt einen Lohn.',[
  'Incorrecta: el texto dice expresamente que nadie recibe salario.',
  'Correcta: las ventas sirven para pagar el alquiler del local.',
  'Incorrecta: no se menciona comprar ni pagar un autobús.'
 ],[
  'Incorrect: the text explicitly says nobody receives a wage.',
  'Correct: sales income is used to pay the rent.',
  'Incorrect: buying or paying for a bus is not mentioned.'
 ]),
 // Modell 02 · Teil 2: directory
 'modell-02-Lesen-6':item('1. Stock: Fotostudio, Kameraverleih, Kopiergeräte.',[
  'Correcta: el servicio para tomar prestada una cámara está en el primer piso.',
  'Incorrecta: el segundo piso tiene salas de música y préstamo de instrumentos.',
  'Incorrecta: la información identifica el primer piso, no otro nivel.'
 ],[
  'Correct: camera lending is on the first floor.',
  'Incorrect: the second floor has music rooms and instrument lending.',
  'Incorrect: the information identifies the first floor, not another level.'
 ]),
 'modell-02-Lesen-7':item('EG: Empfang, Theaterkasse, Fundbüro.',[
  'Incorrecta: el tercer piso tiene cursos de idiomas y asesoría.',
  'Correcta: la taquilla del teatro está en la planta baja.',
  'Incorrecta: la planta baja contiene la taquilla; no hace falta ir a otro piso.'
 ],[
  'Incorrect: the third floor has language courses and advice services.',
  'Correct: the theatre box office is on the ground floor.',
  'Incorrect: the box office is on the ground floor, not another floor.'
 ]),
 'modell-02-Lesen-8':item('4. Stock: Tanzstudio, Umkleiden, Dachgarten.',[
  'Incorrecta: el estudio de danza está en el cuarto piso.',
  'Incorrecta: el segundo piso se usa para música, instrumentos y coro.',
  'Correcta: “anderer Stock” representa el cuarto piso, que no aparece entre las opciones numeradas.'
 ],[
  'Incorrect: the dance studio is on the fourth floor.',
  'Incorrect: the second floor is for music, instruments and choir practice.',
  'Correct: “another floor” represents the fourth floor, which is not listed by number.'
 ]),
 'modell-02-Lesen-9':item('3. Stock: Sprachkurse, Kursbüro, Beratungsraum.',[
  'Correcta: el Kursbüro del tercer piso da información sobre cursos.',
  'Incorrecta: en la planta baja están recepción, taquilla y objetos perdidos.',
  'Incorrecta: el directorio especifica el tercer piso.'
 ],[
  'Correct: the course office on the third floor provides course information.',
  'Incorrect: the ground floor has reception, the box office and lost property.',
  'Incorrect: the directory specifies the third floor.'
 ]),
 'modell-02-Lesen-10':item('2. Stock: Musikräume, Instrumentenverleih, Chorproben.',[
  'Incorrecta: el cuarto piso ofrece danza, vestidores y jardín en la azotea.',
  'Correcta: para practicar se usan las salas de música del segundo piso.',
  'Incorrecta: el directorio ofrece directamente el segundo piso como ubicación.'
 ],[
  'Incorrect: the fourth floor has dance, changing rooms and a roof garden.',
  'Correct: the second-floor music rooms are where one can practise.',
  'Incorrect: the directory directly lists the second floor.'
 ]),
 // Modell 02 · Teil 3: email
 'modell-02-Lesen-11':item('Wir treffen uns nicht mehr im Kursraum, sondern direkt am alten Hafen. Die Kursleiterin möchte zuerst draußen mit uns fotografieren.',[
  'Correcta: si hace buen tiempo, el grupo empieza al aire libre junto al puerto.',
  'Incorrecta: la escuela se usa si llueve, no como punto inicial con buen tiempo.',
  'Incorrecta: el café se reserva para comer; no es el lugar donde empieza el curso.'
 ],[
  'Correct: in good weather the group starts outside by the harbour.',
  'Incorrect: the school is used if it rains, not as the fair-weather starting point.',
  'Incorrect: the café is reserved for lunch; it is not the starting place.'
 ]),
 'modell-02-Lesen-12':item('Bitte bring deine eigene Kamera mit; ein Handy reicht für diese Übung leider nicht.',[
  'Incorrecta: un teléfono no basta para la primera actividad.',
  'Correcta: la tarea requiere una cámara; se puede llevar una propia o pedirla prestada.',
  'Incorrecta: no se necesita una computadora portátil para la primera actividad; las imágenes se editan luego en la escuela.'
 ],[
  'Incorrect: a phone is not enough for the first activity.',
  'Correct: the task requires a camera, either one’s own or a borrowed one.',
  'Incorrect: a laptop is not needed for the first activity; editing happens later at school.'
 ]),
 'modell-02-Lesen-13':item('Du musst sie aber schon am Freitag abholen, weil das Büro samstags geschlossen ist.',[
  'Incorrecta: el texto no dice que se recoja en el puerto el domingo.',
  'Incorrecta: el sábado el despacho está cerrado, así que no se puede recoger entonces.',
  'Correcta: se recoge en la escuela el viernes antes del cierre del despacho.'
 ],[
  'Incorrect: the text does not say to collect it at the harbour on Sunday.',
  'Incorrect: the office is closed on Saturday, so collection cannot happen then.',
  'Correct: it must be collected at school on Friday before the office closes.'
 ]),
 'modell-02-Lesen-14':item('Das Essen ist nicht im Kurspreis enthalten.',[
  'Correcta: la comida se paga aparte porque no está incluida en el precio del curso.',
  'Incorrecta: el texto no la describe como gratuita.',
  'Incorrecta: la directora reserva una mesa; no dice que cada persona deba llevar su comida.'
 ],[
  'Correct: lunch costs extra because it is not included in the course fee.',
  'Incorrect: the text does not say that lunch is free.',
  'Incorrect: the instructor reserves a table; students are not told to bring food.'
 ]),
 'modell-02-Lesen-15':item('Falls es regnet, beginnen wir sofort in der Schule.',[
  'Incorrecta: el curso no se cancela; cambia el lugar de inicio si llueve.',
  'Correcta: con lluvia, empiezan directamente en la escuela.',
  'Incorrecta: el café es para el almuerzo y no es la alternativa prevista por lluvia.'
 ],[
  'Incorrect: the course is not cancelled; its starting place changes if it rains.',
  'Correct: in rain, they begin directly at the school.',
  'Incorrect: the café is for lunch, not the stated rainy-weather plan.'
 ]),
 // Modell 02 · Teil 4
 'modell-02-Lesen-16':item('c · Bewerbungscheck: Lebenslauf und Anschreiben prüfen, Dienstagabend online.',[
  'Incorrecta: b ayuda con mudanzas, no con documentos de candidatura.',
  'Correcta: c revisa el currículum por la tarde y en línea.',
  'Incorrecta: d ofrece conversación en alemán mientras se cocina.',
  'Incorrecta: e repara computadoras.',
  'Incorrecta: f anuncia una habitación en alquiler.',
  'Incorrecta: hay una oferta concreta en c, por lo que no corresponde X.'
 ],[
  'Incorrect: b helps with moving, not application documents.',
  'Correct: c reviews CVs and applications online in the evening.',
  'Incorrect: d offers German conversation while cooking.',
  'Incorrect: e repairs computers.',
  'Incorrect: f advertises a room for rent.',
  'Incorrect: c fits, so X does not apply.'
 ]),
 'modell-02-Lesen-17':item('b · Umzugshilfe: Zwei Helfer mit Transporter, nur samstags und sonntags.',[
  'Correcta: b ofrece personal y vehículo para una mudanza el sábado.',
  'Incorrecta: c revisa solicitudes de empleo.',
  'Incorrecta: d ofrece practicar alemán cocinando.',
  'Incorrecta: e arregla computadoras y guarda archivos.',
  'Incorrecta: f es una habitación, no un servicio de mudanza.',
  'Incorrecta: b está disponible y coincide con la necesidad.'
 ],[
  'Correct: b provides helpers and a van for a Saturday move.',
  'Incorrect: c reviews job applications.',
  'Incorrect: d offers German practice while cooking.',
  'Incorrect: e repairs computers and backs up files.',
  'Incorrect: f is a room, not a moving service.',
  'Incorrect: b is available and matches the need.'
 ]),
 'modell-02-Lesen-18':item('f · mindestens sechs Monate, keine Haustiere; die gesuchte Unterkunft ist nur zwei Wochen und mit Hund.',[
  'Incorrecta: b traslada muebles; no ofrece alojamiento.',
  'Incorrecta: c revisa documentos de empleo.',
  'Incorrecta: d es una actividad de conversación, no un cuarto.',
  'Incorrecta: e es servicio técnico de computadoras.',
  'Incorrecta: f exige seis meses y no acepta animales; ambas condiciones contradicen la necesidad.',
  'Correcta: ninguna oferta satisface el plazo corto y el perro; X es la correspondencia adecuada.'
 ],[
  'Incorrect: b moves furniture; it does not offer accommodation.',
  'Incorrect: c reviews job documents.',
  'Incorrect: d is a conversation activity, not a room.',
  'Incorrect: e is computer support.',
  'Incorrect: f requires six months and allows no pets; both conditions conflict.',
  'Correct: no offer meets the short stay and dog requirements; X fits.'
 ]),
 'modell-02-Lesen-19':item('d · Sprachpartner: Deutsch sprechen beim gemeinsamen Kochen, mittwochs.',[
  'Incorrecta: b ayuda a transportar muebles.',
  'Incorrecta: c revisa un currículum y una carta.',
  'Correcta: d combina conversación en alemán y cocina.',
  'Incorrecta: e ofrece servicio para computadoras.',
  'Incorrecta: f ofrece alojamiento, no una actividad para practicar alemán.',
  'Incorrecta: d cubre las dos actividades, así que no corresponde X.'
 ],[
  'Incorrect: b helps transport furniture.',
  'Incorrect: c reviews a CV and cover letter.',
  'Correct: d combines German conversation and cooking.',
  'Incorrect: e is computer support.',
  'Incorrect: f offers accommodation, not an activity to practise German.',
  'Incorrect: d covers both activities, so X does not fit.'
 ]),
 'modell-02-Lesen-20':item('e · Laptopservice: Daten sichern und Computer reparieren, werktags 9–18 Uhr.',[
  'Incorrecta: b es ayuda para mudanzas.',
  'Incorrecta: c ayuda con documentos de empleo.',
  'Incorrecta: d es intercambio lingüístico y cocina.',
  'Correcta: e puede reparar el ordenador y guardar los archivos.',
  'Incorrecta: f ofrece una habitación, no soporte técnico.',
  'Incorrecta: hay un servicio adecuado en e.'
 ],[
  'Incorrect: b is moving help.',
  'Incorrect: c helps with job documents.',
  'Incorrect: d is language exchange and cooking.',
  'Correct: e can repair the computer and back up its files.',
  'Incorrect: f offers a room, not technical support.',
  'Incorrect: e provides a suitable service.'
 ]),
 // Modell 03 · Teil 1
 'modell-03-Lesen-1':item('Kleidung nimmt sie nicht an, weil sie dafür keinen Platz hat.',[
  'Correcta: Salma no tiene espacio para guardar prendas.',
  'Incorrecta: no se dice que sus clientes rechacen la ropa.',
  'Incorrecta: el negocio acepta distintos objetos, no solo lámparas.'
 ],[
  'Correct: Salma lacks space to store clothes.',
  'Incorrect: the text does not say customers do not want clothes.',
  'Incorrect: the shop accepts different objects, not only lamps.'
 ]),
 'modell-03-Lesen-2':item('Die Idee kam ihr während eines Umzugs.',[
  'Incorrecta: la formación como vendedora ocurrió después, cuando ya había surgido la idea.',
  'Correcta: la experiencia de tener que desechar cosas durante una mudanza le dio la idea.',
  'Incorrecta: el hospital es el lugar de trabajo de su hermana, no el origen de la idea.'
 ],[
  'Incorrect: her sales training came later, after the idea arose.',
  'Correct: having to discard useful things during a move gave her the idea.',
  'Incorrect: the hospital is her sister’s workplace, not the source of the idea.'
 ]),
 'modell-03-Lesen-3':item('Salma entscheidet dann gemeinsam mit dem Kunden, ob die Dinge ungefähr gleich viel wert sind.',[
  'Incorrecta: no se exige ser miembro para intercambiar objetos.',
  'Incorrecta: no se devuelve dinero; se comparan los valores de los objetos.',
  'Correcta: Salma y el cliente hablan para decidir si los objetos tienen un valor parecido.'
 ],[
  'Incorrect: membership is not required for an exchange.',
  'Incorrect: money is not refunded; the objects’ values are compared.',
  'Correct: Salma and the customer decide together whether the items have similar value.'
 ]),
 'modell-03-Lesen-4':item('Am Mittwoch, wenn der Laden bis zwanzig Uhr geöffnet ist.',[
  'Correcta: el miércoles el horario se extiende hasta las ocho de la noche.',
  'Incorrecta: el texto no menciona descuentos ese día.',
  'Incorrecta: Salma tiene una tienda activa; no se indica que descanse los miércoles.'
 ],[
  'Correct: on Wednesday the shop stays open until 8 p.m.',
  'Incorrect: the text does not mention discounts that day.',
  'Incorrect: Salma runs the shop; it does not say she takes Wednesday off.'
 ]),
 'modell-03-Lesen-5':item('Im nächsten Jahr möchte sie im Hinterzimmer Kurse zum Reparieren anbieten.',[
  'Incorrecta: Salma descarta expresamente abrir una segunda tienda.',
  'Correcta: planea enseñar reparaciones en cursos dentro de la tienda.',
  'Incorrecta: no se menciona vender exclusivamente por internet.'
 ],[
  'Incorrect: Salma explicitly rules out opening a second shop.',
  'Correct: she plans to teach repair courses in the back room.',
  'Incorrect: selling exclusively online is not mentioned.'
 ]),
 // Modell 03 · Teil 2
 'modell-03-Lesen-6':item('EG: Anmeldung, Apotheke, Hilfsmittel, Rollstuhlverleih.',[
  'Correcta: la farmacia de la planta baja vende medicamentos.',
  'Incorrecta: el primer piso alberga el consultorio general y servicios de vacunación.',
  'Incorrecta: el aviso aclara que la Anmeldung no vende medicamentos; la farmacia está en EG.'
 ],[
  'Correct: the ground-floor pharmacy sells medicine.',
  'Incorrect: the first floor has the GP practice and vaccination advice.',
  'Incorrect: the notice says reception does not sell medicine; the pharmacy is on EG.'
 ]),
 'modell-03-Lesen-7':item('3. Stock: Physiotherapie, Rückenkurse, Umkleiden.',[
  'Incorrecta: el segundo piso es para atención dental.',
  'Correcta: los cursos para la espalda están en el tercer piso y usan movimiento/ejercicio.',
  'Incorrecta: el directorio ubica la fisioterapia y los cursos en el tercer piso.'
 ],[
  'Incorrect: the second floor is for dental care.',
  'Correct: back-care classes are on the third floor and involve exercise.',
  'Incorrect: the directory places physiotherapy and these classes on the third floor.'
 ]),
 'modell-03-Lesen-8':item('2. Stock: Zahnarztpraxis, Zahnreinigung.',[
  'Incorrecta: en EG hay farmacia y recepción, no dentista.',
  'Incorrecta: el primer piso es para medicina general y vacunación.',
  'Correcta: “anderer Stock” significa el segundo piso, donde está la consulta dental.'
 ],[
  'Incorrect: EG has the pharmacy and reception, not a dentist.',
  'Incorrect: the first floor is for general practice and vaccination advice.',
  'Correct: “another floor” means the second floor, where the dental practice is.'
 ]),
 'modell-03-Lesen-9':item('1. Stock: Hausarztpraxis, Blutabnahme, Impfberatung.',[
  'Correcta: la consulta del primer piso ofrece asesoría sobre vacunas.',
  'Incorrecta: el cuarto piso ofrece asesoría nutricional y cocina.',
  'Incorrecta: no es otro piso; el servicio aparece en el primero.'
 ],[
  'Correct: the first-floor practice provides vaccination advice.',
  'Incorrect: the fourth floor has nutrition advice and cooking.',
  'Incorrect: it is not another floor; the service is on the first.'
 ]),
 'modell-03-Lesen-10':item('4. Stock: Ernährungsberatung, Kochstudio.',[
  'Incorrecta: el tercer piso es para fisioterapia y cursos de espalda.',
  'Correcta: el estudio de cocina del cuarto piso permite aprender a cocinar de forma más saludable.',
  'Incorrecta: el directorio señala el cuarto piso, no un nivel sin especificar.'
 ],[
  'Incorrect: the third floor is for physiotherapy and back classes.',
  'Correct: the fourth-floor cooking studio is the relevant place to learn healthier cooking.',
  'Incorrect: the directory gives the fourth floor, not an unspecified level.'
 ]),
 // Modell 03 · Teil 3
 'modell-03-Lesen-11':item('Das Hotel liegt nicht direkt am See, sondern zehn Minuten zu Fuß davon entfernt. Dafür ist es viel günstiger und wir können dort kostenlos Fahrräder ausleihen.',[
  'Incorrecta: el hotel no está junto al lago; está a diez minutos caminando.',
  'Correcta: el préstamo de bicicletas sí es gratuito.',
  'Incorrecta: el desayuno está incluido, pero la cena se paga aparte.'
 ],[
  'Incorrect: the hotel is not beside the lake; it is a ten-minute walk away.',
  'Correct: bicycle rental is free.',
  'Incorrect: breakfast is included, but dinner costs extra.'
 ]),
 'modell-03-Lesen-12':item('Unser Gepäck dürfen wir vorher an der Rezeption lassen. Bitte nimm einen Helm mit, denn das Hotel verleiht nur Fahrräder.',[
  'Correcta: antes de las 14:00 pueden dejar el equipaje en recepción.',
  'Incorrecta: el acceso al cuarto empieza a las 14:00.',
  'Incorrecta: deben llevar su propio casco; el hotel solo presta bicicletas.'
 ],[
  'Correct: before 2 p.m. they can leave their luggage at reception.',
  'Incorrect: room access begins at 2 p.m.',
  'Incorrect: they must bring their own helmet; the hotel lends only bicycles.'
 ]),
 'modell-03-Lesen-13':item('Ich komme mit dem Zug um neun Uhr zwanzig an. Kannst du mich am Bahnhof abholen?',[
  'Incorrecta: Lotte llega en tren y pide que la recojan en la estación, no en el hotel.',
  'Incorrecta: el autobús es solo una alternativa si Bea tiene que trabajar.',
  'Correcta: el punto pedido es la estación de tren.'
 ],[
  'Incorrect: Lotte arrives by train and asks to be collected at the station, not the hotel.',
  'Incorrect: the bus is only an alternative if Bea has to work.',
  'Correct: the requested pickup point is the train station.'
 ]),
 'modell-03-Lesen-14':item('Ich möchte nachmittags noch das neue Stadtmuseum besuchen.',[
  'Incorrecta: su tren sale por la tarde-noche; no se marcha inmediatamente a casa.',
  'Correcta: Lotte planea visitar el museo municipal el domingo por la tarde.',
  'Incorrecta: no propone trabajar con Bea.'
 ],[
  'Incorrect: her train leaves in the evening; she is not going home immediately.',
  'Correct: Lotte plans to visit the city museum on Sunday afternoon.',
  'Incorrect: she does not propose working with Bea.'
 ]),
 'modell-03-Lesen-15':item('Bitte sag mir bis Mittwoch, ob du ein vegetarisches Frühstück möchtest.',[
  'Correcta: Lotte necesita saber si Bea prefiere el desayuno vegetariano.',
  'Incorrecta: la hora del tren de Lotte ya está informada y no es lo que pregunta.',
  'Incorrecta: Bea debe llevar casco; el hotel no lo presta, pero el mensaje no pide confirmación sobre eso.'
 ],[
  'Correct: Lotte needs to know whether Bea wants a vegetarian breakfast.',
  'Incorrect: Lotte has already given her train time; that is not the requested reply.',
  'Incorrect: Bea must bring a helmet; the hotel does not lend one, but no confirmation is requested.'
 ]),
 // Modell 03 · Teil 4
 'modell-03-Lesen-16':item('b · Leihgut: Bohrmaschinen und Gartengeräte tageweise ausleihen. Abholung Montag bis Samstag.',[
  'Correcta: b presta herramientas por día, adecuado para montar el estante.',
  'Incorrecta: c es cuidado de niños durante un curso nocturno.',
  'Incorrecta: d arregla o acorta ropa, no presta herramientas.',
  'Incorrecta: e alquila jardines por semanas, no herramientas por un día.',
  'Incorrecta: f entrega comida vegetariana para grupos.',
  'Incorrecta: b ofrece exactamente el alquiler temporal de herramienta.'
 ],[
  'Correct: b lends tools by the day, suitable for assembling a shelf.',
  'Incorrect: c provides childcare during an evening class.',
  'Incorrect: d alters clothes; it does not lend tools.',
  'Incorrect: e rents gardens by the week, not tools by the day.',
  'Incorrect: f delivers vegetarian food for groups.',
  'Incorrect: b offers the short-term tool rental needed.'
 ]),
 'modell-03-Lesen-17':item('c · Kinderbetreuung für Eltern im Abendkurs, Montag und Mittwoch 17–21 Uhr.',[
  'Incorrecta: b presta equipo de bricolaje.',
  'Correcta: c ofrece cuidado infantil el miércoles por la tarde y noche.',
  'Incorrecta: d se ocupa de ropa, no de niños.',
  'Incorrecta: e ofrece un terreno de jardín, no cuidado de niños.',
  'Incorrecta: f prepara comida para grupos, no cuida menores.',
  'Incorrecta: el horario de c coincide con el curso del miércoles.'
 ],[
  'Incorrect: b lends DIY equipment.',
  'Correct: c offers childcare on Wednesday evening.',
  'Incorrect: d handles clothing, not children.',
  'Incorrect: e rents a garden plot, not childcare.',
  'Incorrect: f prepares group meals; it does not provide childcare.',
  'Incorrect: c’s hours match the Wednesday class.'
 ]),
 'modell-03-Lesen-18':item('d · Nähatelier: Kleidung ändern und kürzen, auch samstags. Keine Schuhe.',[
  'Incorrecta: b presta herramientas; no cambia el largo de una prenda.',
  'Incorrecta: c ofrece cuidado infantil.',
  'Correcta: d puede acortar prendas; la restricción sobre zapatos no afecta a una prenda de vestir.',
  'Incorrecta: e alquila espacios de jardín.',
  'Incorrecta: f vende comidas para grupos.',
  'Incorrecta: existe una oferta para ropa en d.'
 ],[
  'Incorrect: b lends tools; it does not shorten a garment.',
  'Incorrect: c offers childcare.',
  'Correct: d shortens clothes; its shoe restriction does not apply to a garment.',
  'Incorrect: e rents garden plots.',
  'Incorrect: f provides group meals.',
  'Incorrect: d offers the required clothing alteration.'
 ]),
 'modell-03-Lesen-19':item('f · Vegetarische Gerichte für Gruppen ab zehn Personen, Lieferung am Wochenende.',[
  'Incorrecta: b presta herramientas de trabajo.',
  'Incorrecta: c ofrece cuidado infantil, no comida.',
  'Incorrecta: d modifica prendas.',
  'Incorrecta: e alquila jardines y no ofrece entrega de comida.',
  'Correcta: doce personas superan el mínimo de diez y el domingo es fin de semana.',
  'Incorrecta: f satisface el número de personas y el día indicado.'
 ],[
  'Incorrect: b lends equipment.',
  'Incorrect: c provides childcare, not meals.',
  'Incorrect: d alters clothes.',
  'Incorrect: e rents gardens and does not deliver meals.',
  'Correct: twelve people meet the minimum of ten, and Sunday is a weekend day.',
  'Incorrect: f fits both the group size and day.'
 ]),
 'modell-03-Lesen-20':item('d · Nähatelier: Kleidung ändern und kürzen, auch samstags. Keine Schuhe.',[
  'Incorrecta: b presta herramientas, no repara calzado.',
  'Incorrecta: c cuida niños durante cursos.',
  'Incorrecta: d modifica ropa, pero excluye expresamente los zapatos.',
  'Incorrecta: e alquila jardines y no anuncia reparación de calzado.',
  'Incorrecta: f sirve comida y no repara zapatos.',
  'Correcta: ningún anuncio repara zapatos el domingo; el único taller textil no trabaja con zapatos.'
 ],[
  'Incorrect: b lends tools; it does not repair shoes.',
  'Incorrect: c cares for children during classes.',
  'Incorrect: d alters clothes but explicitly excludes shoes.',
  'Incorrect: e rents garden plots and does not advertise shoe repair.',
  'Incorrect: f provides food and does not repair shoes.',
  'Correct: no listing repairs shoes on Sunday; the clothing shop excludes shoes.'
 ])
};

// Rewritten questions use their own option-by-option editorial notes; these replace
// the notes for the retired wording above rather than reusing mismatched explanations.
Object.assign(readingReviews,{
 'modell-02-Lesen-1':item('Die ehemalige Busfahrerin Frau Seidel betreibt jetzt eine offene Werkstatt.',[
  'Correcta: “ehemalige Busfahrerin” indica que antes conducía un autobús.',
  'Incorrecta: el carpintero enseña reparaciones; el texto no dice que Frau Seidel fuera carpintera.',
  'Incorrecta: el supermercado es el edificio anterior, no su empleo allí.'
 ],[
  'Correct: “former bus driver” means she used to drive a bus.',
  'Incorrect: the carpenter teaches repairs; the text does not call Frau Seidel a carpenter.',
  'Incorrect: the supermarket is the former building, not her former workplace.'
 ]),
 'modell-02-Lesen-2':item('Frau Seidel hat die Räume nicht gekauft, sondern für zunächst zwei Jahre gemietet.',[
  'Correcta: alquila el edificio y el primer periodo es de dos años.',
  'Incorrecta: el texto no dice que la ciudad se lo regalara; la ciudad aporta herramientas.',
  'Incorrecta: se indica expresamente que no compró el local.'
 ],[
  'Correct: she rents the building for an initial two-year period.',
  'Incorrect: the city did not give it to her; it supports the project with tools.',
  'Incorrect: the text explicitly says she did not buy the premises.'
 ]),
 'modell-02-Lesen-3':item('Der Kurs ist kostenlos, aber die Teilnehmer bringen ihr Material selbst mit.',[
  'Correcta: no se paga la clase, pero cada persona lleva el material que usará.',
  'Incorrecta: las herramientas de apoyo municipal no se cobran en el texto.',
  'Incorrecta: el material no se entrega allí; los participantes lo llevan.'
 ],[
  'Correct: the class is free, but each person brings the material they will use.',
  'Incorrect: the text does not charge students for the city-supported tools.',
  'Incorrect: materials are not handed out there; participants bring them.'
 ]),
 'modell-02-Lesen-4':item('Wegen der wenigen Nähmaschinen können höchstens acht Personen teilnehmen.',[
  'Correcta: la falta de máquinas de coser limita el grupo a ocho personas.',
  'Incorrecta: el texto reserva para jóvenes la segunda Werkstatt futura, no el curso actual.',
  'Incorrecta: el motivo indicado no es el horario, sino la cantidad de máquinas.'
 ],[
  'Correct: too few sewing machines limit the group to eight people.',
  'Incorrect: the future second workshop is for young people, not this current course.',
  'Incorrect: the stated reason is the number of machines, not the schedule.'
 ]),
 'modell-02-Lesen-5':item('Mit dem Geld bezahlt sie die Miete; niemand bekommt einen Lohn.',[
  'Correcta: el dinero de las ventas cubre el alquiler del local.',
  'Incorrecta: nadie recibe salario por su trabajo en el grupo.',
  'Incorrecta: el texto no menciona comprar un autobús.'
 ],[
  'Correct: sales money covers the rent for the premises.',
  'Incorrect: nobody receives wages for their work in the group.',
  'Incorrect: buying a bus is not mentioned.'
 ]),
 'modell-01-Lesen-11':item('Das Museum öffnet wegen einer Veranstaltung erst am Nachmittag. Deshalb besuchen wir zuerst den Wochenmarkt.',[
  'Correcta: el evento retrasa la apertura del museo; por eso empiezan con el mercado.',
  'Incorrecta: las entradas de tren ya están compradas y no explican el cambio del orden.',
  'Incorrecta: Lena va al mercado directamente; no se dice que espere en un hotel.'
 ],[
  'Correct: an event delays the museum opening, so they start at the market.',
  'Incorrect: train tickets are already bought and do not explain the changed order.',
  'Incorrect: Lena goes straight to the market; no hotel wait is mentioned.'
 ]),
 'modell-01-Lesen-12':item('Der Eintritt ins Museum kostet acht Euro; für unsere Gruppe gibt es leider keine Ermäßigung.',[
  'Correcta: cada persona debe contar con el precio normal, sin descuento grupal.',
  'Incorrecta: ser un grupo pequeño no produce una rebaja; el texto niega el descuento.',
  'Incorrecta: Mira compró los billetes de tren, no las entradas del museo.'
 ],[
  'Correct: each person should budget the regular price, with no group discount.',
  'Incorrect: the small group does not receive a reduction; the email says there is none.',
  'Incorrect: Mira bought train tickets, not the museum tickets.'
 ]),
 'modell-01-Lesen-13':item('Du brauchst mir dafür diesmal kein Geld zu geben, denn ich schulde dir noch etwas vom letzten Restaurantbesuch.',[
  'Correcta: Mira compensa el dinero que aún le debe a Nora de la visita al restaurante.',
  'Incorrecta: la excursión no es gratis; el correo dice que la entrada cuesta ocho euros.',
  'Incorrecta: Mira compró los billetes; Nora todavía no los ha pagado.'
 ],[
  'Correct: Mira offsets money she still owes Nora from the restaurant visit.',
  'Incorrect: the trip is not free; the email says admission costs eight euros.',
  'Incorrect: Mira bought the tickets; Nora has not paid for them.'
 ]),
 'modell-02-Lesen-11':item('Die Kursleiterin möchte zuerst draußen mit uns fotografieren. Falls es regnet, beginnen wir sofort in der Schule.',[
  'Correcta: con tiempo seco, la primera actividad es fotografiar al aire libre en el puerto.',
  'Incorrecta: el aula se usa si llueve; el punto de partida normal es afuera.',
  'Incorrecta: el café es para almorzar, no el lugar inicial del curso.'
 ],[
  'Correct: in dry weather, the first activity is outdoor photography at the harbour.',
  'Incorrect: the classroom is used in rain; the normal starting point is outdoors.',
  'Incorrect: the café is for lunch, not the course starting point.'
 ]),
 'modell-02-Lesen-12':item('Bitte bring deine eigene Kamera mit; ein Handy reicht für diese Übung leider nicht.',[
  'Correcta: un teléfono por sí solo no sirve para esta práctica; hace falta una cámara.',
  'Incorrecta: una cámara sí cumple el requisito de la actividad.',
  'Incorrecta: el correo permite pedir una cámara prestada, así que no tiene que ser propia.'
 ],[
  'Correct: a phone alone is not enough; the activity requires a camera.',
  'Incorrect: a camera does meet the activity requirement.',
  'Incorrect: the email allows borrowing one, so it need not be personally owned.'
 ]),
 'modell-02-Lesen-13':item('Du musst sie aber schon am Freitag abholen, weil das Büro samstags geschlossen ist.',[
  'Correcta: el cierre del despacho el sábado obliga a recogerla el viernes.',
  'Incorrecta: el despacho no abre el sábado, por eso esa opción contradice el aviso.',
  'Incorrecta: Emil necesita la cámara para el curso del domingo, no después de él.'
 ],[
  'Correct: the office closure on Saturday means it must be collected Friday.',
  'Incorrect: the office is not open Saturday, so that contradicts the notice.',
  'Incorrect: Emil needs the camera for Sunday’s course, not afterwards.'
 ]),
 'modell-02-Lesen-14':item('Das Essen ist nicht im Kurspreis enthalten.',[
  'Correcta: el almuerzo se paga aparte de la inscripción al curso.',
  'Incorrecta: el correo excluye explícitamente la comida del precio.',
  'Incorrecta: la instructora reserva una mesa; no pide que cada quien lleve su comida.'
 ],[
  'Correct: lunch is paid for separately from the course fee.',
  'Incorrect: the email explicitly excludes food from the fee.',
  'Incorrect: the instructor reserves a table; students are not asked to bring food.'
 ]),
 'modell-02-Lesen-15':item('Falls es regnet, beginnen wir sofort in der Schule; eine Nachricht dazu kommt spätestens am Sonntag um acht Uhr.',[
  'Incorrecta: no se cancela el curso; se cambia al edificio de la escuela.',
  'Correcta: si llueve, deben empezar directamente en la escuela.',
  'Incorrecta: el correo promete un aviso, pero no indica que deban esperar en el café.'
 ],[
  'Incorrect: the course is not cancelled; it moves to the school building.',
  'Correct: if it rains, they should go straight to the school.',
  'Incorrect: a message is promised, but nobody is told to wait at the café.'
 ]),
 'modell-03-Lesen-11':item('Das Hotel liegt zehn Minuten zu Fuß vom See entfernt. Dafür können wir dort kostenlos Fahrräder ausleihen.',[
  'Correcta: el préstamo gratuito de bicicletas es la ventaja indicada.',
  'Incorrecta: el desayuno está incluido; la cena se paga extra.',
  'Incorrecta: el hotel está a diez minutos a pie del lago, no junto a él.'
 ],[
  'Correct: free bicycle rental is the stated advantage.',
  'Incorrect: breakfast is included; dinner costs extra.',
  'Incorrect: the hotel is a ten-minute walk from the lake, not beside it.'
 ]),
 'modell-03-Lesen-12':item('Wir können erst ab vierzehn Uhr ins Zimmer. Deshalb schlage ich vor, dass wir morgens zuerst eine kleine Radtour machen. Unser Gepäck dürfen wir vorher an der Rezeption lassen.',[
  'Correcta: aunque todavía no pueden entrar al cuarto, sí pueden dejar las maletas en recepción.',
  'Incorrecta: el correo dice que el hotel presta bicicletas, pero no cascos.',
  'Incorrecta: la habitación está disponible a partir de las 14:00.'
 ],[
  'Correct: although they cannot enter the room yet, they can leave luggage at reception.',
  'Incorrect: the hotel lends bicycles, but not helmets.',
  'Incorrect: the room is available from 2 p.m.'
 ]),
 'modell-03-Lesen-13':item('Wenn du arbeiten musst, nehme ich den Bus zum Hotel.',[
  'Correcta: si Bea no puede ir, Lotte toma un autobús al hotel.',
  'Incorrecta: la estación es el lugar para recogerla si Bea está disponible, no la alternativa.',
  'Incorrecta: el mensaje no menciona un taxi ni ir directamente al lago.'
 ],[
  'Correct: if Bea cannot come, Lotte takes a bus to the hotel.',
  'Incorrect: the station is the pickup point if Bea is available, not the fallback.',
  'Incorrect: no taxi or direct trip to the lake is mentioned.'
 ]),
 'modell-03-Lesen-14':item('Du musst nicht mitkommen, falls du andere Pläne hast.',[
  'Correcta: Lotte visitará el museo aunque Bea tenga otros planes.',
  'Incorrecta: el tren de regreso sale por la tarde-noche, no por la mañana.',
  'Incorrecta: Lotte no le exige a Bea acompañarla.'
 ],[
  'Correct: Lotte will visit the museum even if Bea has other plans.',
  'Incorrect: the return train leaves in the evening, not in the morning.',
  'Incorrect: Lotte does not require Bea to come along.'
 ]),
 'modell-03-Lesen-15':item('Bitte sag mir bis Mittwoch, ob du ein vegetarisches Frühstück möchtest.',[
  'Correcta: Lotte pregunta por la preferencia de desayuno vegetariano.',
  'Incorrecta: la hora de llegada de Lotte ya está indicada; no necesita que Bea la confirme.',
  'Incorrecta: el casco debe llevarse, pero la pregunta del hotel solo trata del desayuno.'
 ],[
  'Correct: Lotte asks about a vegetarian breakfast preference.',
  'Incorrect: Lotte’s arrival time is already stated; Bea need not confirm it.',
  'Incorrect: the helmet must be brought, but the hotel’s question is about breakfast.'
 ])
});

export function attachReadingReviews(models){
 for(const model of models)for(const part of model.sections.find(section=>section.id==='Lesen')?.parts||[])for(const question of part.questions){
  const override=readingOverrides[question.id];
  if(override){question.prompt=override.prompt;question.options=override.options;question.answers=[override.options[override.answerIndex]];question.model=question.answers[0];question.contentVersion=(question.contentVersion||2)+1;}
  const note=readingReviews[question.id];
  if(!note){question.editorialReviewed=!!question.review;continue;}
  const options=question.options||[];
  const correctIndex=options.indexOf(question.answers?.[0]);
  question.evidence=note.evidence;
  question.editorialReviewed=!!note||!!question.review;
  question.review={evidence:note.evidence,options:options.map((option,index)=>({option,correct:index===correctIndex,explanation:{es:note.es[index],en:note.en[index]}}))};
 }
 return models;
}
