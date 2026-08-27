import type { NewsProvider, NormalizedNewsItem } from "../newsIngestion";

interface GNewsArticle {
  title: string;
  description: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: { name: string; url: string };
}

interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

// Free tier: 100 requests/day, max 10 results per request. Query scoped to
// what this site actually covers, per PROJECT_PLAN.md's category list.
const DEFAULT_QUERY = '"Manipur" OR "Imphal" OR "Northeast India"';

export const gnewsProvider: NewsProvider = {
  name: "GNews",

  async fetchLatest(apiKey: string): Promise<NormalizedNewsItem[]> {
    const url = new URL("https://gnews.io/api/v4/search");
    url.searchParams.set("q", DEFAULT_QUERY);
    url.searchParams.set("lang", "en");
    url.searchParams.set("country", "in");
    url.searchParams.set("max", "10");
    url.searchParams.set("apikey", apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`GNews API request failed (${response.status}): ${body.slice(0, 200)}`);
    }

    const data = (await response.json()) as GNewsResponse;

    return data.articles.map((article) => ({
      title: article.title,
      excerpt: article.description ?? "",
      sourceName: article.source?.name ?? "Unknown source",
      sourceUrl: article.url,
      externalId: article.url,
      imageUrl: article.image ?? null,
      publishedAt: article.publishedAt,
    }));
  },
};
