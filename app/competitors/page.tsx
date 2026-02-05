"use client";

import * as React from "react";
import { Button, Card, CardTitle, Input, Pill, Textarea } from "../components/ui";
import { parseBulkLines, parseCompetitorCsv } from "../lib/csv";
import { downloadCompetitorsCsv } from "../lib/export";
import { useToast } from "../state/toast";
import { useAppStore } from "../state/store";

export default function CompetitorsPage() {
  const {
    competitors,
    selectedCompetitorIds,
    addCompetitor,
    bulkAddCompetitors,
    toggleSelectedCompetitor,
    selectAllCompetitors,
  } = useAppStore();
  const toast = useToast();

  const [name, setName] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const [bulkText, setBulkText] = React.useState("");

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.push({ type: "error", message: "Competitor name is required" });
      return;
    }
    addCompetitor({
      name: name.trim(),
      website: website.trim(),
      tags: tags
        .split(/[;,|]/)
        .map((t) => t.trim())
        .filter(Boolean),
      notes: notes.trim(),
    });
    setName("");
    setWebsite("");
    setTags("");
    setNotes("");
    toast.push({ type: "success", message: "Competitor added" });
  }

  function onBulkAdd() {
    const items = parseBulkLines(bulkText);
    if (!items.length) {
      toast.push({ type: "error", message: "Nothing to import. Add at least one line." });
      return;
    }
    bulkAddCompetitors(items);
    setBulkText("");
    toast.push({ type: "success", message: `Imported ${items.length} competitors` });
  }

  async function onCsvUpload(file: File) {
    const text = await file.text();
    const items = parseCompetitorCsv(text);
    if (!items.length) {
      toast.push({ type: "error", message: "CSV had no valid rows. Expected columns: name, website, tags, notes." });
      return;
    }
    bulkAddCompetitors(items);
    toast.push({ type: "success", message: `Imported ${items.length} competitors from CSV` });
  }

  function toggleAll() {
    if (selectedCompetitorIds.length === competitors.length) {
      selectAllCompetitors([]);
    } else {
      selectAllCompetitors(competitors.map((c) => c.id));
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Competitors</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Add competitors manually, bulk paste, or upload a simple CSV. Select competitors to include in analysis.
          </p>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => downloadCompetitorsCsv(competitors)}>
            Download CSV
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardTitle>Add competitor</CardTitle>
          <form className="mt-4 space-y-3" onSubmit={onAdd}>
            <Input label="Competitor name *" value={name} onChange={setName} required placeholder="Acme Corp" />
            <Input label="Website" value={website} onChange={setWebsite} placeholder="https://example.com" type="url" />
            <Input label="Tags (comma separated)" value={tags} onChange={setTags} placeholder="SaaS, Analytics, B2B" />
            <Textarea label="Notes" value={notes} onChange={setNotes} placeholder="Positioning, strengths, weaknesses..." />
            <Button type="submit">Add</Button>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Competitors list</CardTitle>
              <p className="mt-1 text-sm text-zinc-500">
                {selectedCompetitorIds.length} selected • {competitors.length} total
              </p>
            </div>
            <div className="no-print flex flex-wrap gap-2">
              <Button variant="secondary" onClick={toggleAll}>
                {selectedCompetitorIds.length === competitors.length ? "Clear selection" : "Select all"}
              </Button>
              <label className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onCsvUpload(f);
                    e.currentTarget.value = "";
                  }}
                />
                Upload CSV
              </label>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-2 py-2">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Website</th>
                  <th className="px-2 py-2">Tags</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((c) => {
                  const selected = selectedCompetitorIds.includes(c.id);
                  return (
                    <tr
                      key={c.id}
                      className={[
                        "border-b border-zinc-100 last:border-0",
                        selected ? "bg-blue-50/60" : "bg-white",
                      ].join(" ")}
                    >
                      <td className="px-2 py-2 align-top">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleSelectedCompetitor(c.id)}
                          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                          aria-label={`Select ${c.name}`}
                        />
                      </td>
                      <td className="px-2 py-2 align-top">
                        <div className="font-semibold text-zinc-900">{c.name}</div>
                        {c.notes && <div className="mt-0.5 text-xs text-zinc-500">{c.notes}</div>}
                      </td>
                      <td className="px-2 py-2 align-top text-xs">
                        {c.website ? (
                          <a className="text-blue-700 hover:underline" href={c.website} target="_blank" rel="noreferrer">
                            {c.website.replace(/^https?:\/\//, "")}
                          </a>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-2 py-2 align-top">
                        <div className="flex flex-wrap gap-1">
                          {c.tags.length ? (
                            c.tags.slice(0, 6).map((t) => (
                              <Pill key={t} color="zinc">
                                {t}
                              </Pill>
                            ))
                          ) : (
                            <span className="text-xs text-zinc-400">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card className="border-dashed">
              <CardTitle>Bulk paste</CardTitle>
              <p className="mt-2 text-sm text-zinc-500">
                One competitor per line. Format: <span className="font-medium text-zinc-700">Name, Website, tags, notes</span>
              </p>
              <textarea
                className="mt-3 w-full rounded-md border border-zinc-300 px-2.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={6}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={"Example Inc, https://example.com, SaaS|B2B, Strong onboarding\nAnother Co, https://another.com"}
              />
              <div className="mt-3 no-print">
                <Button variant="secondary" onClick={onBulkAdd}>
                  Import pasted lines
                </Button>
              </div>
            </Card>

            <Card className="border-dashed">
              <CardTitle>CSV format</CardTitle>
              <p className="mt-2 text-sm text-zinc-500">
                Minimal CSV expected columns:
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-zinc-600">
                <li>
                  <span className="font-medium text-zinc-800">name</span> (required)
                </li>
                <li>website</li>
                <li>tags (use | or comma)</li>
                <li>notes</li>
              </ul>
              <p className="mt-3 text-sm text-zinc-500">
                Tip: after upload, go to <span className="font-medium text-zinc-800">Run Analysis</span>.
              </p>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
}

