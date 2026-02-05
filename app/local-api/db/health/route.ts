import { NextResponse } from "next/server";
import { getDb, getSqlitePath } from "@/app/lib/sqlite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();

  const sqliteVersion = (
    db.prepare("select sqlite_version() as version").get() as { version: string }
  ).version;

  const userVersion = db.pragma("user_version", { simple: true }) as number;

  const tables = db
    .prepare(
      "select name from sqlite_master where type='table' and name not like 'sqlite_%' order by name"
    )
    .all() as { name: string }[];

  return NextResponse.json({
    ok: true,
    sqliteVersion,
    userVersion,
    path: getSqlitePath(),
    tables: tables.map((t) => t.name),
  });
}
