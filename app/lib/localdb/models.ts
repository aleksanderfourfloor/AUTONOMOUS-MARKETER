/**
 * Local SQLite models that mirror the backend SQLAlchemy models.
 *
 * Notes:
 * - We store datetimes as ISO strings (TEXT) in SQLite.
 * - JSON columns are stored as JSON-serialized strings (TEXT).
 */

export type DbTimestamp = string; // ISO string

export type DbCompetitor = {
  id: number;
  name: string;
  website_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  reddit_url: string | null;
  discord_url: string | null;
  industry: string | null;
  description: string | null;
  logo_url: string | null;
  status: "active" | "inactive";
  created_at: DbTimestamp;
  updated_at: DbTimestamp;
};

export type DbAnalysisRun = {
  id: number;
  name: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  parameters: string | null; // JSON string
  started_at: DbTimestamp | null;
  completed_at: DbTimestamp | null;
  created_by: string | null;
  created_at: DbTimestamp;
};

export type DbAnalysisCompetitor = {
  id: number;
  analysis_run_id: number;
  competitor_id: number;
};

export type DbInsight = {
  id: number;
  analysis_run_id: number;
  insight_type: string;
  category: string | null;
  title: string;
  description: string | null;
  priority: string | null;
  actionable_recommendation: string | null;
  supporting_data: string | null; // JSON string
  created_at: DbTimestamp;
};

export type DbNewsMention = {
  id: number;
  competitor_id: number;
  analysis_run_id: number;
  title: string;
  url: string | null;
  source: string | null;
  published_date: DbTimestamp | null;
  content: string | null;
  sentiment_score: number | null;
  extracted_at: DbTimestamp;
};
