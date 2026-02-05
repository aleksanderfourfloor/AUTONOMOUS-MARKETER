import type { Competitor } from "../state/types";

export function downloadCompetitorsCsv(competitors: Competitor[]) {
  const header = ["id", "name", "website", "tags", "notes"];
  const rows = competitors.map((c) => [
    c.id,
    c.name,
    c.website,
    c.tags.join("|"),
    c.notes,
  ]);

  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "competitors.csv";
  a.click();
  URL.revokeObjectURL(url);
}

