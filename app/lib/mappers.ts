import type { ApiCompetitor, ApiCompetitorCreate } from "./api";
import type { Competitor } from "../state/types";

export function mapApiCompetitorToStore(c: ApiCompetitor): Competitor {
  return {
    id: c.id,
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
    status: (c.status === "inactive" ? "inactive" : "active") as "active" | "inactive",
  };
}

export function mapStoreDraftToApiCreate(
  c: Omit<Competitor, "id">
): ApiCompetitorCreate {
  return {
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
    status: c.status,
  };
}

