// External news ingestion, per PROJECT_PLAN.md section 9.
//
// Providers are swappable (one adapter per provider implementing
// NewsProvider). Each item is assessed by newsRelevance.ts and then:
//   - skipped      if it isn't about Manipur or duplicates a recent story
//   - held (draft) if it's sensitive or only loosely relevant — an editor decides
//   - published    if it's clearly a Manipur story with no sensitive terms
//                  AND auto-publishing is switched on (AUTOPUBLISH=true)
//
// We never store the source's full body (copyright) or hotlink its image
// (the site's CSP blocks third-party images anyway, and the image rights
// belong to the publisher). We keep: headline, source, link, short excerpt.

import { escapeHtml, htmlToPlainText, slugify } from "./content";
import { assessItem, isDuplicate, titleTokens, type Decision } from "./newsRelevance";

export interface NormalizedNewsItem {
  title: string;
  excerpt: string;
  sourceName: string;
  sourceUrl: string;
  externalId: string;
  imageUrl: string | null;
  publishedAt: string; // ISO
}

export interface NewsProvider {
  name: string;
  fetchLatest(apiKey: string): Promise<NormalizedNewsItem[]>;
}

export interface IngestResult {
  fetched: number;
  published: number;
  heldForReview: number;
  skippedIrrelevant: number;
  skippedDuplicate: number;
  skippedExisting: number;
  errors: string[];
}

export interface IngestOptions {
  autoPublish: boolean;
  deskAuthorId: number;
  categoryIds: Map<string, number>;
  fallbackCategoryId: number;
}

export function emptyResult(): IngestResult {
  return {
    fetched: 0,
    published: 0,
    heldForReview: 0,
    skippedIrrelevant: 0,
    skippedDuplicate: 0,
    skippedExisting: 0,
    errors: [],
  };
}

// Body is only the excerpt. The source link is rendered by the article
// template from the source/source_url columns — never stored as HTML, which
// is what caused the "&amp;amp;lt;a href" text on live articles (each edit
// re-escaped the stored <a> tag).
export function wireContentHtml(excerpt: string): string {
  return excerpt ? `<p>${escapeHtml(excerpt)}</p>` : "";
}

function cleanTitle(title: string): string {
  // Wire prefixes like "India News | " or "Manipur: " add nothing.
  return title.replace(/^(india news|latest news|news)\s*\|\s*/i, "").trim();
}

async function recentTitleTokens(db: D1Database): Promise<Set<string>[]> {
  const { results } = await db
    .prepare("SELECT title FROM articles WHERE created_at >= datetime('now', '-3 days')")
    .all<{ title: string }>();
  return results.map((r) => titleTokens(r.title));
}

async function uniqueSlug(db: D1Database, categoryId: number, title: string, externalId: string): Promise<string> {
  const baseSlug = slugify(title).slice(0, 90).replace(/-+$/, "") || `wire-story-${slugify(externalId).slice(0, 40)}`;
  let slug = baseSlug;
  let suffix = 1;
  while (
    await db.prepare("SELECT id FROM articles WHERE category_id = ? AND slug = ?").bind(categoryId, slug).first()
  ) {
    slug = `${baseSlug}-${++suffix}`;
  }
  return slug;
}

export async function ingestNewsItems(
  db: D1Database,
  items: NormalizedNewsItem[],
  options: IngestOptions,
  result: IngestResult = emptyResult()
): Promise<IngestResult> {
  const recent = await recentTitleTokens(db);
  result.fetched += items.length;

  for (const raw of items) {
    // Providers sometimes send HTML/entities in titles and descriptions.
    const item = {
      ...raw,
      title: cleanTitle(htmlToPlainText(raw.title)),
      excerpt: htmlToPlainText(raw.excerpt).slice(0, 400),
    };
    try {
      if (!item.title || !item.sourceUrl) {
        result.skippedIrrelevant++;
        continue;
      }

      const existing = await db
        .prepare("SELECT id FROM articles WHERE external_article_id = ? OR source_url = ?")
        .bind(item.externalId, item.sourceUrl)
        .first<{ id: number }>();
      if (existing) {
        result.skippedExisting++;
        continue;
      }

      const assessment = assessItem(item);
      if (assessment.decision === "skip") {
        result.skippedIrrelevant++;
        continue;
      }

      const tokens = titleTokens(item.title);
      if (isDuplicate(tokens, recent)) {
        result.skippedDuplicate++;
        continue;
      }

      const decision: Decision =
        assessment.decision === "publish" && options.autoPublish ? "publish" : "review";
      const reviewReason =
        decision === "publish"
          ? null
          : assessment.decision === "publish"
            ? "Auto-publish is off (set AUTOPUBLISH=true)"
            : assessment.reason;

      const categoryId = options.categoryIds.get(assessment.categorySlug) ?? options.fallbackCategoryId;
      const slug = await uniqueSlug(db, categoryId, item.title, item.externalId);

      await db
        .prepare(
          `INSERT INTO articles
            (title, slug, excerpt, content_html, featured_image_url, author_id, category_id,
             status, source, source_url, external_article_id, published_at, ingest_score, review_reason)
           VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          item.title,
          slug,
          item.excerpt,
          wireContentHtml(item.excerpt),
          options.deskAuthorId,
          categoryId,
          decision === "publish" ? "published" : "draft",
          item.sourceName,
          item.sourceUrl,
          item.externalId,
          decision === "publish" ? new Date().toISOString() : null,
          assessment.score,
          reviewReason
        )
        .run();

      recent.push(tokens);
      if (decision === "publish") result.published++;
      else result.heldForReview++;
    } catch (err) {
      result.errors.push(`${item.title}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return result;
}
