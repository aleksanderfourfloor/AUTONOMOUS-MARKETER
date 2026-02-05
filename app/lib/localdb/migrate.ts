import type Database from "better-sqlite3";

const SCHEMA_VERSION = 1;

function createSchemaV1(db: Database.Database) {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS competitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      website_url TEXT,
      twitter_url TEXT,
      instagram_url TEXT,
      facebook_url TEXT,
      reddit_url TEXT,
      discord_url TEXT,
      industry TEXT,
      description TEXT,
      logo_url TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TRIGGER IF NOT EXISTS trg_competitors_updated_at
    AFTER UPDATE ON competitors
    FOR EACH ROW
    BEGIN
      UPDATE competitors SET updated_at = datetime('now') WHERE id = OLD.id;
    END;

    CREATE INDEX IF NOT EXISTS idx_competitors_name ON competitors(name);
    CREATE INDEX IF NOT EXISTS idx_competitors_industry ON competitors(industry);
    CREATE INDEX IF NOT EXISTS idx_competitors_status ON competitors(status);

    CREATE TABLE IF NOT EXISTS analysis_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      parameters TEXT,
      started_at TEXT,
      completed_at TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_analysis_runs_name ON analysis_runs(name);
    CREATE INDEX IF NOT EXISTS idx_analysis_runs_status ON analysis_runs(status);

    CREATE TABLE IF NOT EXISTS analysis_competitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      analysis_run_id INTEGER NOT NULL,
      competitor_id INTEGER NOT NULL,
      FOREIGN KEY (analysis_run_id) REFERENCES analysis_runs(id) ON DELETE CASCADE,
      FOREIGN KEY (competitor_id) REFERENCES competitors(id) ON DELETE CASCADE,
      UNIQUE(analysis_run_id, competitor_id)
    );

    CREATE INDEX IF NOT EXISTS idx_analysis_competitors_analysis_run_id
      ON analysis_competitors(analysis_run_id);

    CREATE INDEX IF NOT EXISTS idx_analysis_competitors_competitor_id
      ON analysis_competitors(competitor_id);

    CREATE TABLE IF NOT EXISTS insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      analysis_run_id INTEGER NOT NULL,
      insight_type TEXT NOT NULL,
      category TEXT,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT,
      actionable_recommendation TEXT,
      supporting_data TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (analysis_run_id) REFERENCES analysis_runs(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_insights_analysis_run_id ON insights(analysis_run_id);
    CREATE INDEX IF NOT EXISTS idx_insights_insight_type ON insights(insight_type);

    CREATE TABLE IF NOT EXISTS news_mentions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      competitor_id INTEGER NOT NULL,
      analysis_run_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      url TEXT,
      source TEXT,
      published_date TEXT,
      content TEXT,
      sentiment_score REAL,
      extracted_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (competitor_id) REFERENCES competitors(id) ON DELETE CASCADE,
      FOREIGN KEY (analysis_run_id) REFERENCES analysis_runs(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_news_mentions_competitor_id ON news_mentions(competitor_id);
    CREATE INDEX IF NOT EXISTS idx_news_mentions_analysis_run_id ON news_mentions(analysis_run_id);
  `);
}

export function migrate(db: Database.Database) {
  db.exec("PRAGMA foreign_keys = ON;");

  const userVersion = db.pragma("user_version", { simple: true }) as number;
  if (userVersion === SCHEMA_VERSION) return;

  if (userVersion === 0) {
    createSchemaV1(db);
    db.pragma(`user_version = ${SCHEMA_VERSION}`);
    return;
  }

  // Future migrations go here.
  throw new Error(
    `Unsupported SQLite schema version: ${userVersion}. Expected ${SCHEMA_VERSION}.`
  );
}
