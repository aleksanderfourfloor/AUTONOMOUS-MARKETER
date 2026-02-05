import Link from "next/link";
import { Card, CardTitle, Button, Pill } from "./components/ui";
import { AnalysisList } from "./sections/AnalysisList";
import { QuickStats } from "./sections/QuickStats";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Track competitors, run a simple analysis, and export results.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 no-print">
          <Link href="/competitors">
            <Button variant="secondary">Add Competitor</Button>
          </Link>
          <Link href="/analysis">
            <Button>Run Analysis</Button>
          </Link>
        </div>
      </header>

      <QuickStats />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <CardTitle>Recent analyses</CardTitle>
            <Pill color="blue">Example data included</Pill>
          </div>
          <div className="mt-4">
            <AnalysisList />
          </div>
        </Card>

        <Card>
          <CardTitle>Getting started</CardTitle>
          <ol className="mt-3 space-y-2 text-sm text-zinc-600">
            <li>
              <span className="font-semibold text-zinc-900">1.</span> Add a few
              competitors (manual, bulk, or CSV).
            </li>
            <li>
              <span className="font-semibold text-zinc-900">2.</span> Choose
              analysis parameters.
            </li>
            <li>
              <span className="font-semibold text-zinc-900">3.</span> Run the
              analysis and review insights.
            </li>
            <li>
              <span className="font-semibold text-zinc-900">4.</span> Export CSV
              or print to PDF.
            </li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
