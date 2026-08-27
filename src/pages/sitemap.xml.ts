import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getSitemapArticles } from "../lib/articles";
import { getCategories } from "../lib/categories";

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export const GET: APIRoute = async ({ url }) => {
  const db = env.DB;
  const origin = url.origin;

  const [articles, categories] = await Promise.all([getSitemapArticles(db), getCategories(db)]);

  const urls: { loc: string; lastmod?: string }[] = [
    { loc: `${origin}/` },
    { loc: `${origin}/search` },
    ...categories.map((c) => ({ loc: `${origin}/${c.slug}` })),
    ...articles.map((a) => ({ loc: `${origin}/${a.categorySlug}/${a.slug}`, lastmod: a.publishedAt })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ""}</url>`
  )
  .join("\n")}
</urlset>
`;

  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
