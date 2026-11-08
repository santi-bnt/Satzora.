import test from 'node:test';
import assert from 'node:assert/strict';
import { profileText, profileLanguage } from './profile.ts';

for (const language of ['es', 'es-MX', 'en', 'en-US']) {
  const english = language.startsWith('en');
  test(`${language}: missing and blank names use generic greetings and profiles`, () => {
    for (const name of [undefined, null, '', '   ', '\t\n', 42, {}]) {
      const text = profileText(name, language);
      assert.equal(text.greeting, english ? 'Hello!' : '¡Hola!');
      assert.equal(text.label, english ? 'My profile' : 'Mi perfil');
      assert.equal(text.initial, '');
      assert.equal(text.name, '');
    }
  });
  test(`${language}: authentic names are trimmed and preserved, including Alex`, () => {
    for (const name of ['María José', 'Alex', '李明', 'Élodie']) {
      const text = profileText(`  ${name}  `, language);
      assert.equal(text.greeting, english ? `Hello, ${name}!` : `¡Hola, ${name}!`);
      assert.equal(text.label, name);
      assert.equal(text.name, name);
      assert.ok(text.initial);
    }
  });
}
test('page language takes precedence and browser/default languages are fallbacks', () => {
  assert.equal(profileLanguage('es', 'en-US'), 'es');
  assert.equal(profileLanguage('en', 'es-MX'), 'en');
  assert.equal(profileLanguage('', 'en-US'), 'en-US');
  assert.equal(profileLanguage(undefined, undefined), 'es');
  assert.equal(profileText(undefined, profileLanguage('', 'en-US')).greeting, 'Hello!');
});
