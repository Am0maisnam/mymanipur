import type { NewsProvider, NormalizedNewsItem } from "../newsIngestion";

interface NewsDataArticle {
  article_id: string;
  title: string;
  link: string;
  description: string | null;
  image_url: string | null;
  pubDate: string; // "YYYY-MM-DD HH:MM:SS", UTC
  source_id: string;
  source_url: string | null;
}

interface NewsDataResponse {
  status: string;
  totalResults: number;
  results: NewsDataArticle[];
}

// Free tier: 200 credits/day, ~10 results per request. Same scope as the
// GNews adapter, per PROJECT_PLAN.md's category list.
const DEFAULT_QUERY = "Manipur OR Imphal";

function toIso(pubDate: string): string {
  // NewsData returns "YYYY-MM-DD HH:MM:SS" in UTC, not strict ISO 8601.
  return `${pubDate.replace(" ", "T")}Z`;
}

export const newsdataProvider: NewsProvider = {
  name: "NewsData.io",

  async fetchLatest(apiKey: string): Promise<NormalizedNewsItem[]> {
    const url = new URL("https://newsdata.io/api/1/news");
    url.searchParams.set("q", DEFAULT_QUERY);
    url.searchParams.set("country", "in");
    url.searchParams.set("language", "en");
    url.searchParams.set("apikey", apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`NewsData.io API request failed (${response.status}): ${body.slice(0, 200)}`);
    }

    const data = (await response.json()) as NewsDataResponse;
    if (data.status !== "success") {
      throw new Error(`NewsData.io returned status "${data.status}"`);
    }

    return (data.results ?? []).map((article) => ({
      title: article.title,
      excerpt: article.description ?? "",
      sourceName: article.source_id ?? "Unknown source",
      sourceUrl: article.link,
      externalId: article.article_id || article.link,
      imageUrl: article.image_url ?? null,
      publishedAt: toIso(article.pubDate),
    }));
  },
};
