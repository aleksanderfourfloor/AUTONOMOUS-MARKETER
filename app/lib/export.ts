import type { Competitor } from "../state/types";

export function downloadCompetitorsCsv(competitors: Competitor[]) {
  const header = [
    "id",
    "name",
    "website_url",
    "twitter_url",
    "instagram_url",
    "facebook_url",
    "reddit_url",
    "discord_url",
    "industry",
    "description",
    "logo_url",
    "status",
  ];
  const rows = competitors.map((c) => [
    c.id,
    c.name,
    c.website_url ?? "",
    c.twitter_url ?? "",
    c.instagram_url ?? "",
    c.facebook_url ?? "",
    c.reddit_url ?? "",
    c.discord_url ?? "",
    c.industry ?? "",
    c.description ?? "",
    c.logo_url ?? "",
    c.status,
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

