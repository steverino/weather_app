import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createDatabase(filename) {
  const db = new Database(filename);

  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,

      UNIQUE(city, latitude, longitude)
    )
  `);

  return db;
}

const db = createDatabase(path.join(__dirname, "weather.db"));

export default db;
