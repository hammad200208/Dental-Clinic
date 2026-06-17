import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";

let db;

export function initDatabase() {
  const dbPath = path.join(app.getPath("userData"), "clinic.db");
  db = new Database(dbPath);

  db.prepare(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      age INTEGER,
      gender TEXT,
      problem TEXT,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // ✅ Safely add missing columns via migration
  const patientColumns = db.prepare("PRAGMA table_info(patients)").all().map(c => c.name);
  if (!patientColumns.includes("gender")) {
    db.prepare("ALTER TABLE patients ADD COLUMN gender TEXT").run();
    console.log("Migration: added gender column");
  }
  if (!patientColumns.includes("status")) {
    db.prepare("ALTER TABLE patients ADD COLUMN status TEXT DEFAULT 'Active'").run();
    console.log("Migration: added status column");
  }

  db.prepare(`
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      treatment TEXT,
      notes TEXT,
      amount REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      next_visit TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      name TEXT,
      phone TEXT,
      treatment TEXT,
      date TEXT,
      time TEXT,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `).run();

  console.log("SQLite DB ready at:", dbPath);
  return db;
}

export function getDb() {
  return db;
}