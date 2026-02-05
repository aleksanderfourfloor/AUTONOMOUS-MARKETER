"use client";

import Link from "next/link";
import { useAppStore } from "../state/store";
import { Card, CardTitle, Pill } from "../components/ui";

function Stat({
  label,
  value,
  hint,
  accent = "zinc",
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "zinc" | "blue" | "emerald" | "amber";
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {hint && <Pill color={accent}>{hint}</Pill>}
      </div>
    </div>
  );
}

export function QuickStats() {
  const { competitors, analyses } = useAppStore();
  const last = analyses[0];
  const lastDate = last ? new Date(last.createdAt) : null;
  const insightsCount = last?.insights?.length ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Stat
        label="Competitors tracked"
        value={String(competitors.length)}
        hint={competitors.length ? "Active list" : "Add some"}
        accent={competitors.length ? "emerald" : "amber"}
      />
      <Stat
        label="Last analysis date"
        value={lastDate ? lastDate.toLocaleDateString() : "—"}
        hint={last ? last.status : "None yet"}
        accent={last?.status === "completed" ? "emerald" : "blue"}
      />
      <Stat
        label="Key insights count"
        value={String(insightsCount)}
        hint={insightsCount ? "Review results" : "Run analysis"}
        accent={insightsCount ? "blue" : "amber"}
      />
      <div className="md:col-span-3">
        <Card className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Next action</CardTitle>
            <p className="mt-1 text-sm text-zinc-500">
              Add competitors, then run analysis to generate comparisons and insights.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/competitors" className="text-sm font-semibold text-blue-700 hover:underline">
              Add competitors
            </Link>
            <span className="text-zinc-300">/</span>
            <Link href="/analysis" className="text-sm font-semibold text-blue-700 hover:underline">
              Run analysis
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

