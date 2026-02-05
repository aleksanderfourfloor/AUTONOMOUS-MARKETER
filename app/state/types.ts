export type Competitor = {
  id: number;
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
  status: "active" | "inactive";
};

export type AnalysisParameters = {
  pricing: boolean;
  features: boolean;
  marketing: boolean;
  audience: boolean;
  techStack: boolean;
  content: boolean;
  social: boolean;
  reviews: boolean;
};

export type CompetitorResult = {
  competitorId: number;
  pricingScore: number; // 0-100
  featureScore: number; // 0-100
  marketingScore: number; // 0-100
  audienceScore: number; // 0-100
  techScore: number; // 0-100
  contentScore: number; // 0-100
  socialScore: number; // 0-100
  reviewsScore: number; // 0-100
  priceMonthlyUsd: number;
  features: Record<string, boolean>;
};

export type InsightPriority = "High" | "Medium" | "Low";

export type Insight = {
  id: string;
  category:
    | "Feature gaps"
    | "Pricing opportunities"
    | "Messaging angles"
    | "Underserved segments";
  title: string;
  priority: InsightPriority;
  recommendation: string;
};

export type AnalysisRun = {
  id: string;
  name: string;
  createdAt: string;
  status: "draft" | "running" | "completed";
  competitorIds: number[];
  parameters: AnalysisParameters;
  results?: CompetitorResult[];
  insights?: Insight[];
};

export type AppState = {
  competitors: Competitor[];
  analyses: AnalysisRun[]; // newest first
  selectedCompetitorIds: number[];
  activeAnalysisId: string | null;
};

