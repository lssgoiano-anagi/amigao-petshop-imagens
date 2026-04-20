const Database = require('better-sqlite3');
const config = require('../config');

let db;

function getDb() {
  if (!db) {
    db = new Database(config.dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    migrate(db);
  }
  return db;
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      phone      TEXT UNIQUE NOT NULL,
      name       TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pets (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      name        TEXT,
      species     TEXT,
      breed       TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      status      TEXT NOT NULL DEFAULT 'bot',
      agent       TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id),
      role            TEXT NOT NULL,
      content         TEXT NOT NULL,
      sender          TEXT NOT NULL DEFAULT 'bot',
      created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id  INTEGER NOT NULL REFERENCES customers(id),
      pet_name     TEXT,
      service      TEXT,
      scheduled_at DATETIME,
      status       TEXT NOT NULL DEFAULT 'pending',
      notes        TEXT,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

module.exports = { getDb };
