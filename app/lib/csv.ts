import type { Competitor } from "../state/types";

export function parseCompetitorCsv(text: string): Omit<Competitor, "id">[] {
  // Expected columns (compatible with backend): name, website_url (or website), industry, description, status
  // Minimal CSV parsing: handles quoted values and commas inside quotes.
  const rows = splitCsvRows(text);
  if (rows.length === 0) return [];

  const header = rows[0].map((h) => normalizeHeader(h));
  const idx = {
    name: header.indexOf("name"),
    website_url: header.indexOf("website_url"),
    website: header.indexOf("website"),
    industry: header.indexOf("industry"),
    description: header.indexOf("description"),
    status: header.indexOf("status"),
  };

  const items: Omit<Competitor, "id">[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = get(row, idx.name).trim();
    if (!name) continue;
    const website_url = (get(row, idx.website_url) || get(row, idx.website)).trim();
    const industry = get(row, idx.industry).trim();
    const description = get(row, idx.description).trim();
    const statusRaw = get(row, idx.status).trim().toLowerCase();
    const status: "active" | "inactive" =
      statusRaw === "inactive" ? "inactive" : "active";
    items.push({
      name,
      website_url: website_url || null,
      industry: industry || null,
      description: description || null,
      status,
    });
  }
  return items;
}

export function parseBulkLines(text: string): Omit<Competitor, "id">[] {
  // Each line: Name, Website, Industry(optional), Description(optional)
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      const [name, website_url = "", industry = "", description = ""] = parts;
      return {
        name,
        website_url: website_url || null,
        industry: industry || null,
        description: description || null,
        status: "active" as const,
      };
    })
    .filter((c) => c.name.length > 0);
}

function normalizeHeader(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

function get(row: string[], index: number) {
  if (index < 0) return "";
  return row[index] ?? "";
}

function splitCsvRows(text: string): string[][] {
  const lines = text
    .replace(/^\uFEFF/, "") // remove BOM
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);

  return lines.map(splitCsvLine);
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

