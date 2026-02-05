import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { migrate } from "@/app/lib/localdb/migrate";

function resolveSqlitePath() {
  const fromEnv = process.env.SQLITE_PATH;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv;
  return path.join(process.cwd(), ".data", "frontend.sqlite");
}

export function getSqlitePath() {
  const p = resolveSqlitePath();
  // If user supplied a relative path via env, resolve against CWD.
  return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
}

// Keep a single DB connection during dev HMR.
declare global {
  var __sqliteDb: Database.Database | undefined;
}

function prepareDb(db: Database.Database) {
  db.pragma("journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON;");
  migrate(db);
}

export function getDb() {
  if (globalThis.__sqliteDb) {
    // In dev/HMR, we may reload code but keep the same DB connection.
    // Always ensure migrations ran.
    prepareDb(globalThis.__sqliteDb);
    return globalThis.__sqliteDb;
  }

  const dbPath = getSqlitePath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  prepareDb(db);

  globalThis.__sqliteDb = db;
  return db;
}
