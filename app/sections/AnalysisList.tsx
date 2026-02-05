"use client";

import Link from "next/link";
import { useAppStore } from "../state/store";
import { Button, Pill } from "../components/ui";

export function AnalysisList() {
  const { analyses } = useAppStore();

  if (!analyses.length) {
    return (
      <div className="rounded-md border border-dashed border-zinc-200 p-6 text-sm text-zinc-600">
        No analyses yet. Head to <Link className="font-semibold text-blue-700 hover:underline" href="/analysis">Run Analysis</Link>.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {analyses.slice(0, 5).map((a) => {
        const date = new Date(a.createdAt);
        const statusColor: "emerald" | "blue" | "zinc" =
          a.status === "completed" ? "emerald" : a.status === "running" ? "blue" : "zinc";
        return (
          <li
            key={a.id}
            className="flex flex-col gap-2 rounded-md border border-zinc-200 p-3 md:flex-row md:items-center md:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="truncate text-sm font-semibold text-zinc-900">
                  {a.name}
                </div>
                <Pill color={statusColor}>{a.status}</Pill>
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                {date.toLocaleString()} • {a.competitorIds.length} competitors
              </div>
            </div>
            <div className="no-print flex gap-2">
              <Link href={`/results/${a.id}`}>
                <Button variant="secondary">View results</Button>
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

