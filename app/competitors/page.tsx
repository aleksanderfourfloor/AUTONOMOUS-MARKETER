"use client";

import * as React from "react";
import {
  Button,
  Card,
  CardTitle,
  Input,
  Pill,
  Textarea,
} from "../components/ui";
import { parseBulkLines, parseCompetitorCsv } from "../lib/csv";
import { downloadCompetitorsCsv } from "../lib/export";
import { useToast } from "../state/toast";
import { useAppStore } from "../state/store";
import { BACKEND_ENABLED } from "../lib/config";
import {
  bulkCreateCompetitors,
  deleteCompetitor,
  listCompetitors,
  updateCompetitor,
  uploadCompetitorsCsv,
} from "../lib/api";
import type { Competitor } from "../state/types";
import type { ApiCompetitor } from "../lib/api";
import {
  mapApiCompetitorToStore,
  mapStoreDraftToApiCreate,
} from "../lib/mappers";

export default function CompetitorsPage() {
  const {
    competitors,
    selectedCompetitorIds,
    addCompetitor,
    bulkAddCompetitors,
    replaceCompetitors,
    updateCompetitorLocal,
    deleteCompetitorLocal,
    toggleSelectedCompetitor,
    selectAllCompetitors,
  } = useAppStore();
  const toast = useToast();

  const [bulkText, setBulkText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerMode, setDrawerMode] = React.useState<"add" | "edit">("add");
  const [editingId, setEditingId] = React.useState<number | null>(null);

  type Draft = Omit<Competitor, "id">;
  const emptyDraft = React.useCallback(
    (): Draft => ({
      name: "",
      website_url: "",
      twitter_url: "",
      instagram_url: "",
      facebook_url: "",
      reddit_url: "",
      discord_url: "",
      industry: "",
      description: "",
      logo_url: "",
      status: "active",
    }),
    []
  );
  const [drafts, setDrafts] = React.useState<Draft[]>([emptyDraft()]);

  // Note: global competitor load happens in the store provider. Here we only refresh after mutations.
  async function refreshFromBackend() {
    const data = await listCompetitors();
    replaceCompetitors(data.items.map(mapApiCompetitorToStore));
  }

  function openDrawer() {
    setDrawerMode("add");
    setEditingId(null);
    setDrafts([emptyDraft()]);
    setDrawerOpen(true);
  }
  function openEditDrawer(c: Competitor) {
    setDrawerMode("edit");
    setEditingId(c.id);
    setDrafts([
      {
        name: c.name,
        website_url: c.website_url ?? "",
        twitter_url: c.twitter_url ?? "",
        instagram_url: c.instagram_url ?? "",
        facebook_url: c.facebook_url ?? "",
        reddit_url: c.reddit_url ?? "",
        discord_url: c.discord_url ?? "",
        industry: c.industry ?? "",
        description: c.description ?? "",
        logo_url: c.logo_url ?? "",
        status: c.status,
      },
    ]);
    setDrawerOpen(true);
  }
  function closeDrawer() {
    setDrawerOpen(false);
  }

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    if (drawerOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  function updateDraft(i: number, patch: Partial<Draft>) {
    setDrafts((prev) =>
      prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d))
    );
  }
  function addDraft() {
    setDrafts((prev) => [...prev, emptyDraft()]);
  }
  function removeDraft(i: number) {
    setDrafts((prev) =>
      prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)
    );
  }

  async function submitDrafts() {
    const items = drafts
      .map(cleanDraft)
      .filter((d) => d.name.trim().length > 0);
    if (!items.length) {
      toast.push({
        type: "error",
        message: "Add at least one competitor name.",
      });
      return;
    }
    try {
      setLoading(true);
      if (BACKEND_ENABLED) {
        if (drawerMode === "edit" && editingId) {
          await updateCompetitor(editingId, mapStoreDraftToApiCreate(items[0]));
        } else {
          await bulkCreateCompetitors(items.map(mapStoreDraftToApiCreate));
        }
        await refreshFromBackend();
      } else {
        if (drawerMode === "edit" && editingId) {
          updateCompetitorLocal(editingId, items[0]);
        } else {
          if (items.length === 1) addCompetitor(items[0]);
          else bulkAddCompetitors(items);
        }

        // Also persist new competitors to the temporary JSON-backed API
        if (drawerMode === "add") {
          await Promise.all(
            items.map((item) =>
              fetch("/api/competitors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item),
              })
            )
          );
        }
      }
      toast.push({
        type: "success",
        message:
          drawerMode === "edit"
            ? "Competitor updated"
            : `Added ${items.length} competitor(s)`,
      });
      closeDrawer();
    } catch (err) {
      console.error(err);
      toast.push({
        type: "error",
        message:
          drawerMode === "edit"
            ? "Could not update competitor"
            : "Could not add competitors",
      });
    } finally {
      setLoading(false);
    }
  }

  async function onDeleteEditing() {
    if (!editingId) return;
    const ok = window.confirm("Delete this competitor? This cannot be undone.");
    if (!ok) return;
    try {
      setLoading(true);
      if (BACKEND_ENABLED) {
        await deleteCompetitor(editingId);
        await refreshFromBackend();
      } else {
        deleteCompetitorLocal(editingId);
      }
      toast.push({ type: "success", message: "Competitor deleted" });
      closeDrawer();
    } catch (e) {
      console.error(e);
      toast.push({ type: "error", message: "Could not delete competitor" });
    } finally {
      setLoading(false);
    }
  }

  async function onBulkAdd() {
    const items = parseBulkLines(bulkText);
    if (!items.length) {
      toast.push({
        type: "error",
        message: "Nothing to import. Add at least one line.",
      });
      return;
    }
    try {
      setLoading(true);
      if (BACKEND_ENABLED) {
        await bulkCreateCompetitors(
          items.map((c) => ({
            name: c.name,
            website_url: c.website_url ?? null,
            industry: c.industry ?? null,
            description: c.description ?? null,
            status: c.status,
          }))
        );
        await refreshFromBackend();
      } else {
        bulkAddCompetitors(items);
      }
      setBulkText("");
      toast.push({
        type: "success",
        message: `Imported ${items.length} competitors`,
      });
    } catch (err) {
      console.error(err);
      toast.push({ type: "error", message: "Bulk import failed" });
    } finally {
      setLoading(false);
    }
  }

  async function onCsvUpload(file: File) {
    try {
      setLoading(true);
      if (BACKEND_ENABLED) {
        const data = await uploadCompetitorsCsv(file);
        replaceCompetitors(data.items.map(mapApiCompetitorToStore));
        toast.push({
          type: "success",
          message: `Imported ${data.total} competitors from CSV (backend)`,
        });
      } else {
        const text = await file.text();
        const items = parseCompetitorCsv(text);
        if (!items.length) {
          toast.push({
            type: "error",
            message:
              "CSV had no valid rows. Expected columns: name, website_url/website, industry, description, status.",
          });
          return;
        }
        bulkAddCompetitors(items);
        toast.push({
          type: "success",
          message: `Imported ${items.length} competitors from CSV`,
        });
      }
    } catch (err) {
      console.error(err);
      toast.push({ type: "error", message: "CSV upload failed" });
    } finally {
      setLoading(false);
    }
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
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Competitors List
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {BACKEND_ENABLED ? "Synced with FastAPI" : "Example data mode"} •{" "}
            {competitors.length} total
            {loading ? " • syncing..." : ""}
          </p>
        </div>
        <div className="no-print flex items-center gap-2">
          {BACKEND_ENABLED ? (
            <Pill color="emerald">Backend: ON</Pill>
          ) : (
            <Pill color="amber">Backend: OFF</Pill>
          )}
          <Button
            variant="secondary"
            onClick={() => downloadCompetitorsCsv(competitors)}
          >
            Download CSV
          </Button>
          <Button onClick={openDrawer}>+ Add New</Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <CardTitle>Competitors</CardTitle>
            <div className="no-print flex gap-2">
              <Button variant="secondary" onClick={toggleAll}>
                {selectedCompetitorIds.length === competitors.length
                  ? "Clear selection"
                  : "Select all"}
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {competitors.map((c) => {
              const selected = selectedCompetitorIds.includes(c.id);
              return (
                <div
                  key={c.id}
                  className={[
                    "w-full rounded-lg border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
                    selected
                      ? "border-blue-200 bg-blue-50/70"
                      : "border-zinc-200 bg-white hover:bg-zinc-50",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleSelectedCompetitor(c.id)}
                          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                          aria-label={`Select ${c.name}`}
                        />
                        <div className="truncate text-lg font-semibold text-zinc-900">
                          {c.name}
                        </div>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                        {c.website_url ? (
                          <span className="truncate">
                            {c.website_url.replace(/^https?:\/\//, "")}
                          </span>
                        ) : (
                          <span>—</span>
                        )}
                        {c.industry ? (
                          <Pill color="zinc">{c.industry}</Pill>
                        ) : null}
                      </div>
                      {c.description ? (
                        <div className="mt-2 text-sm text-zinc-600 line-clamp-2">
                          {c.description}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Pill color={c.status === "active" ? "emerald" : "zinc"}>
                        {c.status}
                      </Pill>
                      <div className="no-print flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDrawer(c)}
                          className="rounded-md px-2 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="lg:col-span-1">
          <CardTitle>Import</CardTitle>
          <p className="mt-2 text-sm text-zinc-500">
            Optional: paste lines or upload CSV for quick bulk add.
          </p>

          <div className="mt-4 space-y-4">
            <label className="no-print inline-flex w-full items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 focus-within:ring-2 focus-within:ring-blue-500">
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

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Bulk paste
              </div>
              <textarea
                className="mt-2 w-full rounded-md border border-zinc-300 px-2.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={6}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={
                  "Name, Website, Industry, Description\nSuno AI, https://suno.com, AI, Music generation"
                }
              />
              <div className="mt-2 no-print">
                <Button
                  variant="secondary"
                  onClick={() => void onBulkAdd()}
                  disabled={loading}
                >
                  {loading ? "Importing..." : "Import lines"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={
              drawerMode === "edit" ? "Edit competitor" : "Add competitors"
            }
            className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl"
          >
            <div className="flex h-full flex-col">
              <div className="no-print flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    {drawerMode === "edit"
                      ? "Edit competitor"
                      : "Step 2: Add competitors"}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-zinc-900">
                    {drawerMode === "edit"
                      ? "Update competitor details"
                      : "Add competitor details"}
                  </div>
                </div>
                <button
                  onClick={closeDrawer}
                  className="rounded-md px-2 py-1 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="space-y-4">
                  {drafts.map((d, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-zinc-200 p-4"
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          label="Competitor name *"
                          value={d.name}
                          onChange={(v) => updateDraft(i, { name: v })}
                          placeholder="Suno AI"
                          required
                        />
                        <Input
                          label="Website"
                          value={String(d.website_url ?? "")}
                          onChange={(v) => updateDraft(i, { website_url: v })}
                          placeholder="https://example.com"
                          type="url"
                        />
                        <Input
                          label="X/Twitter URL (optional)"
                          value={String(d.twitter_url ?? "")}
                          onChange={(v) => updateDraft(i, { twitter_url: v })}
                          placeholder="https://x.com/..."
                          type="url"
                        />
                        <Input
                          label="Instagram URL (optional)"
                          value={String(d.instagram_url ?? "")}
                          onChange={(v) => updateDraft(i, { instagram_url: v })}
                          placeholder="https://instagram.com/..."
                          type="url"
                        />
                        <Input
                          label="Facebook URL (optional)"
                          value={String(d.facebook_url ?? "")}
                          onChange={(v) => updateDraft(i, { facebook_url: v })}
                          placeholder="https://facebook.com/..."
                          type="url"
                        />
                        <Input
                          label="Reddit URL (optional)"
                          value={String(d.reddit_url ?? "")}
                          onChange={(v) => updateDraft(i, { reddit_url: v })}
                          placeholder="https://reddit.com/..."
                          type="url"
                        />
                        <Input
                          label="Discord URL (optional)"
                          value={String(d.discord_url ?? "")}
                          onChange={(v) => updateDraft(i, { discord_url: v })}
                          placeholder="https://discord.gg/..."
                          type="url"
                        />
                        <Input
                          label="Industry (optional)"
                          value={String(d.industry ?? "")}
                          onChange={(v) => updateDraft(i, { industry: v })}
                          placeholder="AI / Music"
                        />
                      </div>

                      <div className="mt-3 grid gap-3">
                        <Textarea
                          label="Description (optional)"
                          value={String(d.description ?? "")}
                          onChange={(v) => updateDraft(i, { description: v })}
                          placeholder="Short notes about positioning, pricing, target users..."
                          rows={3}
                        />
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input
                            label="Logo URL (optional)"
                            value={String(d.logo_url ?? "")}
                            onChange={(v) => updateDraft(i, { logo_url: v })}
                            placeholder="https://.../logo.png"
                            type="url"
                          />
                          <label className="block">
                            <div className="mb-1 text-xs font-medium text-zinc-600">
                              Status
                            </div>
                            <select
                              className="w-full rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={d.status}
                              onChange={(e) =>
                                updateDraft(i, {
                                  status: e.target.value as
                                    | "active"
                                    | "inactive",
                                })
                              }
                            >
                              <option value="active">active</option>
                              <option value="inactive">inactive</option>
                            </select>
                          </label>
                        </div>
                      </div>

                      {drawerMode === "add" ? (
                        <div className="mt-3 no-print flex items-center justify-between">
                          <button
                            onClick={() => removeDraft(i)}
                            className="text-sm font-semibold text-zinc-600 hover:underline"
                            type="button"
                          >
                            Remove
                          </button>
                          <div className="text-xs text-zinc-400">
                            Competitor #{i + 1}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="no-print border-t border-zinc-200 px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {drawerMode === "add" ? (
                    <Button variant="secondary" onClick={addDraft}>
                      + Add another
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => void onDeleteEditing()}
                      disabled={loading}
                    >
                      Delete
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={closeDrawer}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => void submitDrafts()}
                      disabled={loading}
                    >
                      {loading
                        ? "Saving..."
                        : drawerMode === "edit"
                        ? "Save changes"
                        : "Save competitors"}
                    </Button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  Tip: you can leave optional fields blank. Press{" "}
                  <span className="font-semibold">Esc</span> to close.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function cleanDraft(d: Omit<Competitor, "id">): Omit<Competitor, "id"> {
  return {
    name: d.name.trim(),
    website_url: (d.website_url ?? "").toString().trim() || null,
    twitter_url: (d.twitter_url ?? "").toString().trim() || null,
    instagram_url: (d.instagram_url ?? "").toString().trim() || null,
    facebook_url: (d.facebook_url ?? "").toString().trim() || null,
    reddit_url: (d.reddit_url ?? "").toString().trim() || null,
    discord_url: (d.discord_url ?? "").toString().trim() || null,
    industry: (d.industry ?? "").toString().trim() || null,
    description: (d.description ?? "").toString().trim() || null,
    logo_url: (d.logo_url ?? "").toString().trim() || null,
    status: d.status,
  };
}
