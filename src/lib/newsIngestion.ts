// External news ingestion, per PROJECT_PLAN.md section 9.
//
// Design intent: external providers are swappable (one adapter per
// provider implementing NewsProvider), and ingested items land as DRAFT
// articles for an editor to review, expand, and categorize before they go
// live — never auto-published, and never storing a full copy of the
// source article's body (copyright). We only keep what the brief allows:
// headline, source, source URL, thumbnail, short excerpt, publish time.

import { escapeHtml, slugify } from "./content";

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
  created: number;
  skipped: number;
  errors: string[];
}

function wireContentHtml(item: NormalizedNewsItem): string {
  return `<p>${escapeHtml(item.excerpt)}</p><p><a href="${item.sourceUrl}" rel="noopener noreferrer" target="_blank">Read the full story at ${escapeHtml(item.sourceName)}</a></p>`;
}

/**
 * Inserts normalized news items as draft articles, skipping any whose
 * external_article_id already exists (idempotent re-sync). Category/author
 * are assigned a sensible default — an editor reassigns before publishing.
 */
export async function ingestNewsItems(
  db: D1Database,
  items: NormalizedNewsItem[],
  defaultCategoryId: number,
  defaultAuthorId: number
): Promise<IngestResult> {
  const result: IngestResult = { created: 0, skipped: 0, errors: [] };

  for (const item of items) {
    try {
      const existing = await db
        .prepare("SELECT id FROM articles WHERE external_article_id = ?")
        .bind(item.externalId)
        .first<{ id: number }>();

      if (existing) {
        result.skipped++;
        continue;
      }

      const baseSlug = slugify(item.title) || `wire-story-${item.externalId}`;
      let slug = baseSlug;
      let suffix = 1;
      // Slugs are unique per-category, not globally — check within the target category.
      while (
        await db
          .prepare("SELECT id FROM articles WHERE category_id = ? AND slug = ?")
          .bind(defaultCategoryId, slug)
          .first()
      ) {
        slug = `${baseSlug}-${++suffix}`;
      }

      await db
        .prepare(
          `INSERT INTO articles
            (title, slug, excerpt, content_html, featured_image_url, author_id, category_id,
             status, source, source_url, external_article_id, published_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, NULL)`
        )
        .bind(
          item.title,
          slug,
          item.excerpt,
          wireContentHtml(item),
          item.imageUrl,
          defaultAuthorId,
          defaultCategoryId,
          item.sourceName,
          item.sourceUrl,
          item.externalId
        )
        .run();
      result.created++;
    } catch (err) {
      result.errors.push(`${item.title}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return result;
}
