import { NextRequest, NextResponse } from "next/server";
import { createCompetitor } from "@/app/lib/competitors-store";

export const runtime = "nodejs";

type BulkCreateBody = {
  competitors: {
    name: string;
    website_url?: string | null;
    twitter_url?: string | null;
    instagram_url?: string | null;
    facebook_url?: string | null;
    reddit_url?: string | null;
    discord_url?: string | null;
    industry?: string | null;
    description?: string | null;
    logo_url?: string | null;
    status?: string;
  }[];
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BulkCreateBody;

    if (!body || !Array.isArray(body.competitors)) {
      return NextResponse.json(
        { detail: "Body must be { competitors: [...] }" },
        { status: 400 }
      );
    }

    const filtered = body.competitors.filter(
      (c) => typeof c.name === "string" && c.name.trim().length > 0
    );

    if (!filtered.length) {
      return NextResponse.json(
        {
          detail: "At least one competitor with a non-empty name is required.",
        },
        { status: 400 }
      );
    }

    const created = [];
    for (const c of filtered) {
      const saved = await createCompetitor({
        name: c.name,
        website_url: c.website_url ?? null,
        twitter_url: c.twitter_url ?? null,
        instagram_url: c.instagram_url ?? null,
        facebook_url: c.facebook_url ?? null,
        reddit_url: c.reddit_url ?? null,
        discord_url: c.discord_url ?? null,
        industry: c.industry ?? null,
        description: c.description ?? null,
        logo_url: c.logo_url ?? null,
        status: c.status ?? "active",
      });
      created.push(saved);
    }

    return NextResponse.json(
      {
        items: created,
        total: created.length,
      },
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("POST /api/competitors/bulk", e);
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}
