import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getLatestArticles, articleHref } from "../lib/articles";

export const GET: APIRoute = async (context) => {
  const db = env.DB;
  const articles = await getLatestArticles(db, 50);

  return rss({
    title: "MyManipur",
    description: "Regional news for Manipur and Northeast India.",
    site: context.url.origin,
    items: articles.map((article) => ({
      title: article.title,
      pubDate: new Date(article.publishedAt),
      description: article.excerpt,
      link: articleHref(article),
      categories: [article.categoryName],
      content: article.contentHtml,
    })),
    customData: "<language>en-in</language>",
  });
};
