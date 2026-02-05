import { API_BASE_URL, BACKEND_ENABLED } from "./config";

/**
 * FastAPI integration helpers (optional).
 *
 * This frontend works out-of-the-box with example data via React Context.
 * To wire it to your backend later:
 * - set `NEXT_PUBLIC_API_BASE_URL` (see `Frontend/env.example`)
 * - replace Context actions with these functions (or call them inside the actions)
 */

export type ApiCompetitor = {
  id: number;
  name: string;
  website_url?: string | null;
  twitter_url?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  reddit_url?: string | null;
  discord_url?: string | null;
  industry?: string | null;
  description?: string | null;
  logo_url?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export type ApiCompetitorCreate = {
  name: string;
  website_url?: string | null;
  twitter_url?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  reddit_url?: string | null;
  discord_url?: string | null;
  industry?: string | null;
  description?: string | null;
  logo_url?: string | null;
  status?: "active" | "inactive";
};

export type ApiCompetitorList = { items: ApiCompetitor[]; total: number };

export type ApiAnalysisRunCreate = {
  name: string;
  competitor_ids: number[];
  parameters?: Record<string, unknown> | null;
  created_by?: string | null;
};

export type ApiAnalysisRun = {
  id: number;
  name: string;
  status: string;
  parameters?: Record<string, unknown> | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
};

export type ApiAnalysisStatus = {
  id: number;
  status: string;
  started_at?: string | null;
  completed_at?: string | null;
};

export type ApiInsight = {
  id: number;
  analysis_run_id: number;
  insight_type: string;
  category?: string | null;
  title: string;
  description?: string | null;
  priority?: string | null;
  actionable_recommendation?: string | null;
  supporting_data?: Record<string, unknown> | null;
  created_at: string;
};

export type ApiInsightList = { items: ApiInsight[]; total: number };

export type ApiOpportunity = {
  id: number;
  analysis_run_id: number;
  opportunity_type?: string | null;
  title: string;
  description?: string | null;
  competitors_affected?: unknown[] | null;
  impact_score?: number | null;
  created_at: string;
};

export type ApiOpportunityList = { items: ApiOpportunity[]; total: number };

function assertBackendEnabled() {
  if (!BACKEND_ENABLED) {
    throw new Error(
      "Backend is not enabled. Set NEXT_PUBLIC_API_BASE_URL to use FastAPI."
    );
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  assertBackendEnabled();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

async function apiFetchVoid(path: string, init?: RequestInit): Promise<void> {
  assertBackendEnabled();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }
}

async function apiFetchForm<T>(path: string, init?: RequestInit): Promise<T> {
  assertBackendEnabled();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    // DO NOT set Content-Type here; browser will set correct multipart boundary.
    headers: {
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function listCompetitors(): Promise<ApiCompetitorList> {
  return await apiFetch<ApiCompetitorList>("/competitors");
}

export async function createCompetitor(
  payload: ApiCompetitorCreate
): Promise<ApiCompetitor> {
  return await apiFetch<ApiCompetitor>("/competitors", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCompetitor(
  competitorId: number,
  payload: Partial<ApiCompetitorCreate>
): Promise<ApiCompetitor> {
  return await apiFetch<ApiCompetitor>(`/competitors/${competitorId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCompetitor(competitorId: number): Promise<void> {
  await apiFetchVoid(`/competitors/${competitorId}`, {
    method: "DELETE",
  });
}

export async function bulkCreateCompetitors(
  competitors: ApiCompetitorCreate[]
): Promise<ApiCompetitorList> {
  return await apiFetch<ApiCompetitorList>("/competitors/bulk", {
    method: "POST",
    body: JSON.stringify({ competitors }),
  });
}

export async function uploadCompetitorsCsv(file: File): Promise<ApiCompetitorList> {
  const form = new FormData();
  form.append("file", file, file.name);
  return await apiFetchForm<ApiCompetitorList>("/competitors/bulk/csv", {
    method: "POST",
    body: form,
  });
}

export async function startAnalysis(
  payload: ApiAnalysisRunCreate
): Promise<ApiAnalysisRun> {
  return await apiFetch<ApiAnalysisRun>("/analysis/run", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAnalysisStatus(id: number): Promise<ApiAnalysisStatus> {
  return await apiFetch<ApiAnalysisStatus>(`/analysis/${id}/status`);
}

export async function getInsights(analysisId: number): Promise<ApiInsightList> {
  return await apiFetch<ApiInsightList>(`/insights/${analysisId}`);
}

export async function getOpportunities(
  analysisId: number
): Promise<ApiOpportunityList> {
  return await apiFetch<ApiOpportunityList>(
    `/insights/${analysisId}/opportunities`
  );
}

