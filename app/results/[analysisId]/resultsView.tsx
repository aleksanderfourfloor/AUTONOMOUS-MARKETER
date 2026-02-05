"use client";

import * as React from "react";
import { useToast } from "../../state/toast";
import { useAppStore } from "../../state/store";
import type { CompetitorResult, Insight, InsightPriority } from "../../state/types";
import { Button, Card, CardTitle, Pill } from "../../components/ui";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const PRIORITY_ORDER: Record<InsightPriority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

export function ResultsView({ analysisId }: { analysisId: string }) {
  const toast = useToast();
  const { analyses, competitors } = useAppStore();

  const analysis = analyses.find((a) => a.id === analysisId) ?? analyses[0];
  const [activeCompetitorId, setActiveCompetitorId] = React.useState<number | null>(
    analysis?.competitorIds?.[0] ?? null
  );

  React.useEffect(() => {
    setActiveCompetitorId(analysis?.competitorIds?.[0] ?? null);
  }, [analysisId, analysis?.competitorIds]);

  if (!analysis) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Results</h1>
        <div className="rounded-md border border-dashed border-zinc-200 p-6 text-sm text-zinc-600">
          Analysis not found.
        </div>
      </div>
    );
  }

  const selectedCompetitors = analysis.competitorIds
    .map((id) => competitors.find((c) => c.id === id))
    .filter(Boolean);

  const results = analysis.results ?? [];
  const insights = (analysis.insights ?? []).slice().sort((a, b) => {
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  });

  const activeResult = results.find((r) => r.competitorId === activeCompetitorId) ?? results[0];
  const featureKeys = activeResult ? Object.keys(activeResult.features) : [];

  const priceData = results.map((r) => ({
    name: competitorName(r.competitorId, competitors),
    price: r.priceMonthlyUsd,
  }));

  const barData = results.map((r) => ({
    name: competitorName(r.competitorId, competitors),
    Features: r.featureScore,
    Pricing: r.pricingScore,
    Marketing: r.marketingScore,
  }));

  const radarData = makeRadarData(results, competitors);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Results</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {analysis.name} • {new Date(analysis.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              window.print();
              toast.push({ type: "info", message: "Use Print → Save as PDF to export." });
            }}
          >
            Export PDF
          </Button>
          <Button
            variant="secondary"
            onClick={() => void copyShareLink(toast)}
          >
            Copy share link
          </Button>
          <Button
            variant="secondary"
            onClick={() => downloadResultsCsv(analysis.id, results, competitors)}
            disabled={!results.length}
          >
            Download CSV
          </Button>
        </div>
      </header>

      {/* Tabs / cards per competitor */}
      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Competitors</CardTitle>
            <p className="mt-1 text-sm text-zinc-500">
              Switch tabs to view a quick summary per competitor.
            </p>
          </div>
          <Pill color={analysis.status === "completed" ? "emerald" : "blue"}>
            {analysis.status}
          </Pill>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedCompetitors.map((c) => {
            const isActive = c!.id === activeCompetitorId;
            return (
              <button
                key={c!.id}
                onClick={() => setActiveCompetitorId(c!.id)}
                className={[
                  "rounded-md border px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
                  isActive
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50",
                ].join(" ")}
              >
                {c!.name}
              </button>
            );
          })}
        </div>

        {activeResult ? (
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <MiniStat label="Price / month" value={`$${activeResult.priceMonthlyUsd}`} />
            <MiniStat label="Features score" value={String(activeResult.featureScore)} accent="blue" />
            <MiniStat label="Marketing score" value={String(activeResult.marketingScore)} accent="amber" />
            <MiniStat label="Reviews score" value={String(activeResult.reviewsScore)} accent="emerald" />
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-zinc-200 p-6 text-sm text-zinc-600">
            This analysis has no results yet.
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Side-by-side table */}
        <Card className="lg:col-span-2">
          <CardTitle>Side-by-side comparison</CardTitle>
          <p className="mt-2 text-sm text-zinc-500">
            Quick table view across selected competitors.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-3 py-2">Metric</th>
                  {analysis.competitorIds.map((id) => (
                    <th key={id} className="px-3 py-2">
                      {competitorName(id, competitors)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renderRow("Price (USD/mo)", analysis.competitorIds, results, (r) => `$${r.priceMonthlyUsd}`)}
                {renderRow("Features", analysis.competitorIds, results, (r) => r.featureScore)}
                {renderRow("Pricing strategy", analysis.competitorIds, results, (r) => r.pricingScore)}
                {renderRow("Marketing messaging", analysis.competitorIds, results, (r) => r.marketingScore)}
                {renderRow("Target audience", analysis.competitorIds, results, (r) => r.audienceScore)}
                {renderRow("Tech stack", analysis.competitorIds, results, (r) => r.techScore)}
                {renderRow("Content strategy", analysis.competitorIds, results, (r) => r.contentScore)}
                {renderRow("Social presence", analysis.competitorIds, results, (r) => r.socialScore)}
                {renderRow("Customer reviews", analysis.competitorIds, results, (r) => r.reviewsScore)}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Differentiation Opportunities */}
        <Card className="lg:col-span-1">
          <CardTitle>Your differentiation opportunities</CardTitle>
          <p className="mt-2 text-sm text-zinc-500">
            AI-style recommendations (example data). Prioritize the “High” items first.
          </p>
          <div className="mt-4 space-y-3">
            {insights.length ? (
              insights.map((i) => <InsightCard key={i.id} insight={i} />)
            ) : (
              <div className="rounded-md border border-dashed border-zinc-200 p-4 text-sm text-zinc-600">
                No insights available for this run.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>Pricing comparison</CardTitle>
          <p className="mt-2 text-sm text-zinc-500">
            Monthly pricing estimate per competitor (example data).
          </p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="price" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-1">
          <CardTitle>Core scores (bar)</CardTitle>
          <p className="mt-2 text-sm text-zinc-500">
            Top-line comparison for a few dimensions.
          </p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Features" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Pricing" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Marketing" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Multi-dimensional comparison (radar)</CardTitle>
            <p className="mt-2 text-sm text-zinc-500">
              Wider view across all dimensions (0–100).
            </p>
          </div>
          <div className="text-xs text-zinc-500">
            Tip: radar is best with ≤ 4 competitors.
          </div>
        </div>
        <div className="mt-4 h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              {results.map((r, idx) => (
                <Radar
                  key={r.competitorId}
                  name={competitorName(r.competitorId, competitors)}
                  dataKey={String(r.competitorId)}
                  stroke={RADAR_COLORS[idx % RADAR_COLORS.length]}
                  fill={RADAR_COLORS[idx % RADAR_COLORS.length]}
                  fillOpacity={0.12}
                />
              ))}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Feature presence matrix */}
      <Card>
        <CardTitle>Feature presence matrix</CardTitle>
        <p className="mt-2 text-sm text-zinc-500">
          Checkmarks show which competitor appears to support each feature (example data).
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-3 py-2">Feature</th>
                {analysis.competitorIds.map((id) => (
                  <th key={id} className="px-3 py-2">
                    {competitorName(id, competitors)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureKeys.map((k) => (
                <tr key={k} className="border-b border-zinc-100 last:border-0">
                  <td className="px-3 py-2 font-medium text-zinc-900">{k}</td>
                  {analysis.competitorIds.map((id) => {
                    const r = results.find((x) => x.competitorId === id);
                    const v = r?.features?.[k];
                    return (
                      <td key={id} className="px-3 py-2">
                        {typeof v === "boolean" ? (
                          v ? (
                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                              ✓
                              <span className="sr-only">Yes</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-500">
                              —
                              <span className="sr-only">No</span>
                            </span>
                          )
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const color: "red" | "amber" | "zinc" =
    insight.priority === "High"
      ? "red"
      : insight.priority === "Medium"
      ? "amber"
      : "zinc";
  return (
    <div className="rounded-md border border-zinc-200 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900">{insight.title}</div>
          <div className="mt-1 text-xs uppercase tracking-wide text-zinc-400">
            {insight.category}
          </div>
        </div>
        <Pill color={color}>{insight.priority}</Pill>
      </div>
      <p className="mt-2 text-sm text-zinc-600">{insight.recommendation}</p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent = "zinc",
}: {
  label: string;
  value: string;
  accent?: "zinc" | "blue" | "emerald" | "amber";
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {accent !== "zinc" ? <Pill color={accent}>{accent}</Pill> : null}
      </div>
    </div>
  );
}

function renderRow(
  label: string,
  competitorIds: number[],
  results: CompetitorResult[],
  value: (r: CompetitorResult) => string | number
) {
  return (
    <tr className="border-b border-zinc-100 last:border-0">
      <td className="px-3 py-2 font-medium text-zinc-900">{label}</td>
      {competitorIds.map((id) => {
        const r = results.find((x) => x.competitorId === id);
        return (
          <td key={id} className="px-3 py-2 text-zinc-700">
            {r ? value(r) : <span className="text-zinc-400">—</span>}
          </td>
        );
      })}
    </tr>
  );
}

function competitorName(id: number, competitors: { id: number; name: string }[]) {
  return competitors.find((c) => c.id === id)?.name ?? `Competitor ${id}`;
}

async function copyShareLink(toast: ReturnType<typeof useToast>) {
  const link = window.location.href;
  try {
    await navigator.clipboard.writeText(link);
    toast.push({ type: "success", message: "Share link copied" });
  } catch {
    toast.push({ type: "error", message: "Could not copy link" });
  }
}

function downloadResultsCsv(
  analysisId: string,
  results: CompetitorResult[],
  competitors: { id: number; name: string }[]
) {
  const headers = [
    "analysis_id",
    "competitor_id",
    "competitor_name",
    "price_monthly_usd",
    "pricing_score",
    "feature_score",
    "marketing_score",
    "audience_score",
    "tech_score",
    "content_score",
    "social_score",
    "reviews_score",
  ];
  const rows = results.map((r) => [
    analysisId,
    r.competitorId,
    competitorName(r.competitorId, competitors),
    r.priceMonthlyUsd,
    r.pricingScore,
    r.featureScore,
    r.marketingScore,
    r.audienceScore,
    r.techScore,
    r.contentScore,
    r.socialScore,
    r.reviewsScore,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `analysis-${analysisId}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function makeRadarData(results: CompetitorResult[], competitors: { id: number; name: string }[]) {
  const dimensions = [
    { key: "featureScore", label: "Features" },
    { key: "pricingScore", label: "Pricing" },
    { key: "marketingScore", label: "Marketing" },
    { key: "audienceScore", label: "Audience" },
    { key: "techScore", label: "Tech" },
    { key: "contentScore", label: "Content" },
    { key: "socialScore", label: "Social" },
    { key: "reviewsScore", label: "Reviews" },
  ] as const;

  return dimensions.map((d) => {
    const row: Record<string, string | number> = { dimension: d.label };
    for (const r of results) {
      row[String(r.competitorId)] = r[d.key];
    }
    return row;
  });
}

const RADAR_COLORS = ["#2563eb", "#0ea5e9", "#f59e0b", "#10b981", "#a855f7"];

