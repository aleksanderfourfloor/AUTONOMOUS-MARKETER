import type { Competitor } from "../state/types";

export function parseCompetitorCsv(text: string): Omit<Competitor, "id">[] {
  // Expected columns: name, website, tags, notes
  // Minimal CSV parsing: handles quoted values and commas inside quotes.
  const rows = splitCsvRows(text);
  if (rows.length === 0) return [];

  const header = rows[0].map((h) => normalizeHeader(h));
  const idx = {
    name: header.indexOf("name"),
    website: header.indexOf("website"),
    tags: header.indexOf("tags"),
    notes: header.indexOf("notes"),
  };

  const items: Omit<Competitor, "id">[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = get(row, idx.name).trim();
    if (!name) continue;
    const website = get(row, idx.website).trim();
    const tagsRaw = get(row, idx.tags).trim();
    const notes = get(row, idx.notes).trim();
    const tags = tagsRaw
      ? tagsRaw
          .split(/[;,|]/)
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    items.push({
      name,
      website,
      tags,
      notes,
    });
  }
  return items;
}

export function parseBulkLines(text: string): Omit<Competitor, "id">[] {
  // Each line: Name, Website, tags(optional), notes(optional)
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      const [name, website = "", tags = "", notes = ""] = parts;
      return {
        name,
        website,
        tags: tags
          ? tags
              .split(/[;,|]/)
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        notes,
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

