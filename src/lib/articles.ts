// Data-access layer per PROJECT_PLAN.md section 6. Pages call these
// functions, never the raw data arrays directly, so swapping this file's
// internals for D1 queries in Phase 4 won't require touching any page.

import { articles, type SampleArticle } from "../data/sampleArticles";
import { getCategory } from "../data/categories";

export type { SampleArticle as Article };

function byPublishedDesc(a: SampleArticle, b: SampleArticle) {
  return b.publishedAt.getTime() - a.publishedAt.getTime();
}

export function getLatestArticles(limit = 10): SampleArticle[] {
  return [...articles].sort(byPublishedDesc).slice(0, limit);
}

export function getFeaturedArticle(): SampleArticle | undefined {
  return articles.find((a) => a.isFeatured) ?? getLatestArticles(1)[0];
}

export function getBreakingArticle(): SampleArticle | undefined {
  return articles.find((a) => a.isBreaking);
}

export function getArticlesByCategory(categorySlug: string, limit = 20): SampleArticle[] {
  return articles
    .filter((a) => a.categorySlug === categorySlug)
    .sort(byPublishedDesc)
    .slice(0, limit);
}

export function getArticleBySlug(categorySlug: string, slug: string): SampleArticle | undefined {
  return articles.find((a) => a.categorySlug === categorySlug && a.slug === slug);
}

export function getRelatedArticles(article: SampleArticle, limit = 3): SampleArticle[] {
  return articles
    .filter((a) => a.categorySlug === article.categorySlug && a.slug !== article.slug)
    .sort(byPublishedDesc)
    .slice(0, limit);
}

export function searchArticles(query: string, limit = 20): SampleArticle[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return articles
    .filter((a) => {
      const category = getCategory(a.categorySlug)?.name ?? "";
      const haystack = `${a.title} ${a.excerpt} ${category} ${a.tags.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    })
    .sort(byPublishedDesc)
    .slice(0, limit);
}

export function articleHref(article: SampleArticle): string {
  return `/${article.categorySlug}/${article.slug}`;
}

export function formatPublished(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
