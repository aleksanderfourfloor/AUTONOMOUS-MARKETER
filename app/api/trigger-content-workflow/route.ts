import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const N8N_WEBHOOK_URL =
  "https://itsabbas-ataie.app.n8n.cloud/webhook/9ab24b1d-7785-43a3-9c20-907e18ba31c5";

/**
 * POST /api/trigger-content-workflow
 * Proxies the request to the n8n webhook server-side to avoid CORS.
 * Body: same as the content page sends (type, analysis, channels, prompt, competitors, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const contentStoreUrl = `${base}/api/social-content`;

    const payload = {
      ...body,
      contentStoreUrl,
      analysisIdForStore: body.analysis?.id ?? body.analysisId,
    };

    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const contentType = res.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { detail: text || `Webhook returned ${res.status}` },
        { status: res.status }
      );
    }

    if (isJson) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    const text = await res.text();
    return NextResponse.json({ raw: text });
  } catch (e) {
    console.error("POST /api/trigger-content-workflow", e);
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}
