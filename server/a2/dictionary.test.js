import test from 'node:test';
import assert from 'node:assert/strict';
import {dictionary,lookup} from './dictionary.js';
import {flashcards} from './flashcards.js';

test('dictionary resolves common requested lemmas and keeps bilingual noun metadata',()=>{
 const table=lookup('Tisch');
 assert.equal(table?.article,'der');assert.equal(table?.lemma,'Tisch');assert.equal(table?.es,'mesa');assert.equal(table?.en,'table');assert.equal(table?.plural,'Tische');
 assert.equal(lookup('hoffen')?.es,'esperar');assert.equal(lookup('hoffen')?.en,'to hope');
 assert.deepEqual(['Haus','gehen','Wohnung','Fahrrad'].map(word=>lookup(word)?.lemma),['Haus','gehen','Wohnung','Fahrrad']);
});

test('dictionary normalizes case and punctuation and resolves validated inflected forms',()=>{
 for(const form of ['Tisch,','tisch'])assert.equal(lookup(form)?.lemma,'Tisch');
 for(const [form,lemma] of [['hoffe','hoffen'],['hoffst','hoffen'],['gehofft','hoffen'],['gegangen','gehen'],['Häuser','Haus'],['Kindern','Kind'],['schöner','schön'],['besseren','besser']])assert.equal(lookup(form)?.lemma,lemma,form);
 for(const form of ['Termin','verschieben','Einladung','trotzdem'])assert.ok(lookup(form),form);
 assert.equal(lookup('unbekannteswort'),null);
 assert.equal(lookup('Tisch, und Haus'),null);
});

test('dictionary recognizes frequent modal and present-tense forms without stripping arbitrary suffixes',()=>{
 for(const [form,lemma] of [['könnten','können'],['nehme','nehmen'],['nimmst','nehmen'],['brauche','brauchen'],['wartest','warten'],['Besuchern','Besucher']])assert.equal(lookup(form)?.lemma,lemma,form);
 assert.equal(lookup('Besucher')?.plural,'Besucher');
 assert.equal(lookup('Trinkst'),null);
});

test('dictionary extends the curated entries with the validated vocabulary catalogue',()=>{
 const lemmas=new Set(dictionary.map(w=>w.lemma.toLocaleLowerCase('de')));
 const publishedWords=flashcards.filter(card=>card.kind==='word');
 assert.ok(publishedWords.every(card=>lemmas.has(card.lemma.toLocaleLowerCase('de'))));
 assert.ok(dictionary.length>=135,`only ${dictionary.length} usable entries`);
 assert.equal(new Set(dictionary.map(w=>w.id)).size,dictionary.length);
 for(const entry of dictionary)assert.ok(entry.es&&entry.en&&entry.example,entry.lemma);
});
