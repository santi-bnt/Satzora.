import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { initializeProfile, readProfile } from './profile.js';

test('fresh profiles contain no example identity', () => {
  const db = new DatabaseSync(':memory:');
  try {
    initializeProfile(db);
    assert.deepEqual({ ...readProfile(db) }, { name: '', goal: 15 });
    assert.equal(db.prepare('SELECT name FROM profile').get().name, '');
    initializeProfile(db);
    assert.equal(readProfile(db).name, '');
  } finally { db.close(); }
});

for (const name of ['Alex', 'María José', '']) {
  test(`legacy profile ${JSON.stringify(name)}: safely migrate default provenance without losing stored values`, () => {
    const db = new DatabaseSync(':memory:');
    try {
      db.exec("CREATE TABLE profile (id INTEGER PRIMARY KEY, name TEXT NOT NULL DEFAULT 'Alex', goal INTEGER NOT NULL DEFAULT 15)");
      db.prepare('INSERT INTO profile(id,name,goal) VALUES(1,?,30)').run(name);
      initializeProfile(db);
      assert.equal(readProfile(db).name, name === 'Alex' ? '' : name);
      assert.equal(readProfile(db).goal, 30);
      assert.equal(db.prepare('SELECT name FROM profile').get().name, name);
      initializeProfile(db);
      assert.equal(readProfile(db).name, name === 'Alex' ? '' : name);
      db.prepare("UPDATE profile SET name='Alex', name_source='user' WHERE id=1").run();
      initializeProfile(db);
      assert.equal(readProfile(db).name, 'Alex');
    } finally { db.close(); }
  });
}
