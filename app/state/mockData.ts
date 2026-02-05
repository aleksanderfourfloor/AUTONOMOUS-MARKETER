import type {
  AnalysisParameters,
  AnalysisRun,
  Competitor,
  CompetitorResult,
  Insight,
} from "./types";

export const DEFAULT_PARAMETERS: AnalysisParameters = {
  pricing: true,
  features: true,
  marketing: true,
  audience: true,
  techStack: true,
  content: true,
  social: true,
  reviews: true,
};

export const MOCK_COMPETITORS: Competitor[] = [
  {
    id: 1,
    name: "Acme Analytics",
    website_url: "https://acme-analytics.example",
    twitter_url: null,
    instagram_url: null,
    facebook_url: null,
    reddit_url: null,
    discord_url: null,
    industry: "SaaS / Analytics",
    description: "Strong dashboards, premium pricing, enterprise focus.",
    logo_url: null,
    status: "active",
  },
  {
    id: 2,
    name: "BrightCRM",
    website_url: "https://brightcrm.example",
    twitter_url: null,
    instagram_url: null,
    facebook_url: null,
    reddit_url: null,
    discord_url: null,
    industry: "CRM (SMB)",
    description: "Affordable, lots of integrations, simpler UI.",
    logo_url: null,
    status: "active",
  },
  {
    id: 3,
    name: "Nimbus MarketIQ",
    website_url: "https://nimbus-marketiq.example",
    twitter_url: null,
    instagram_url: null,
    facebook_url: null,
    reddit_url: null,
    discord_url: null,
    industry: "Marketing / AI",
    description: "Great messaging and content, weaker reporting depth.",
    logo_url: null,
    status: "active",
  },
];

export const FEATURE_KEYS = [
  "Free trial",
  "API access",
  "Team collaboration",
  "Custom reports",
  "Integrations",
  "SLA / enterprise support",
] as const;

export function makeMockResults(competitorIds: number[]): CompetitorResult[] {
  const seed = competitorIds.reduce((a, b) => a + b, 0) || 1;
  return competitorIds.map((id, idx) => {
    const base = ((seed + id * 17 + idx * 23) % 60) + 30; // 30-89
    const price = 29 + (((seed + id * 11) % 8) * 20); // 29..169
    const features: Record<string, boolean> = {};
    FEATURE_KEYS.forEach((k, i) => {
      features[k] = ((seed + id * 7 + i * 13) % 3) !== 0; // mostly true
    });
    // Make at least one "gap" per competitor
    features[FEATURE_KEYS[(id + seed) % FEATURE_KEYS.length]] = false;

    return {
      competitorId: id,
      pricingScore: clamp(base + 3),
      featureScore: clamp(base + 8),
      marketingScore: clamp(base + ((id % 2) ? 12 : -4)),
      audienceScore: clamp(base + 2),
      techScore: clamp(base + ((id % 3) ? 6 : -6)),
      contentScore: clamp(base + ((id % 2) ? -2 : 10)),
      socialScore: clamp(base + ((id % 2) ? 7 : -3)),
      reviewsScore: clamp(base + 1),
      priceMonthlyUsd: price,
      features,
    };
  });
}

export function makeMockInsights(
  competitorIds: number[],
  results: CompetitorResult[]
): Insight[] {
  const missingCounts: Record<string, number> = {};
  for (const r of results) {
    for (const [k, v] of Object.entries(r.features)) {
      if (!v) missingCounts[k] = (missingCounts[k] ?? 0) + 1;
    }
  }
  const topGap =
    Object.entries(missingCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "Team collaboration";

  const avgPrice =
    results.reduce((sum, r) => sum + r.priceMonthlyUsd, 0) / (results.length || 1);
  const lowPrice = Math.max(19, Math.round(avgPrice * 0.8));

  const ids = competitorIds.join("-");
  return [
    {
      id: `ins-${ids}-gap`,
      category: "Feature gaps",
      title: `Differentiate with “${topGap}”`,
      priority: "High",
      recommendation:
        `Multiple competitors lack “${topGap}”. Make it a headline feature and show it in your first-run experience.`,
    },
    {
      id: `ins-${ids}-pricing`,
      category: "Pricing opportunities",
      title: `Win mid-market with a $${lowPrice}/mo plan`,
      priority: "Medium",
      recommendation:
        "Offer a clear mid-tier price point with key features, and keep enterprise add-ons separate.",
    },
    {
      id: `ins-${ids}-messaging`,
      category: "Messaging angles",
      title: "Lead with time-to-value",
      priority: "Medium",
      recommendation:
        "Competitors emphasize features; you can emphasize speed, setup simplicity, and measurable outcomes.",
    },
    {
      id: `ins-${ids}-segments`,
      category: "Underserved segments",
      title: "Target teams with lightweight compliance needs",
      priority: "Low",
      recommendation:
        "Create a simple compliance checklist + templates to attract regulated SMBs without enterprise complexity.",
    },
  ];
}

export function makeMockAnalysis(name: string, competitorIds: number[]): AnalysisRun {
  const results = makeMockResults(competitorIds);
  const insights = makeMockInsights(competitorIds, results);
  return {
    id: String(Date.now()),
    name,
    createdAt: new Date().toISOString(),
    status: "completed",
    competitorIds,
    parameters: { ...DEFAULT_PARAMETERS },
    results,
    insights,
  };
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

