// Older databases did not record whether their default name had been confirmed.
// Keep that raw value, but do not present it as a user's identity until they save it.
export function initializeProfile(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK(id=1),
    name TEXT NOT NULL DEFAULT '',
    goal INTEGER NOT NULL DEFAULT 15,
    name_source TEXT NOT NULL DEFAULT 'user'
  );`);
  if (!db.prepare('PRAGMA table_info(profile)').all().some(column => column.name === 'name_source')) {
    db.exec(`BEGIN;
      ALTER TABLE profile ADD COLUMN name_source TEXT NOT NULL DEFAULT 'user';
      UPDATE profile SET name_source = 'legacy-default' WHERE name = 'Alex';
      COMMIT;`);
  }
  // Explicitly supply an empty name even when an old table still has its old default.
  db.prepare("INSERT OR IGNORE INTO profile(id,name) VALUES(1,'')").run();
}

export function readProfile(db) {
  return db.prepare("SELECT CASE WHEN name_source = 'legacy-default' THEN '' ELSE name END AS name, goal FROM profile WHERE id=1").get();
}
