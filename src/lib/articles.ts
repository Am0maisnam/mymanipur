// Data-access layer per PROJECT_PLAN.md section 6, now backed by D1 (the
// `articles` table) instead of the static placeholder data used before
// Phase 4. Pages call these functions and never touch D1 directly.

import { htmlToPlainText } from "./content";

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  featuredImageUrl: string | null;
  imageCaption: string | null;
  authorName: string;
  categorySlug: string;
  categoryName: string;
  isFeatured: boolean;
  isBreaking: boolean;
  publishedAt: string;
  tags: string[];
  /** Editor-written "how this affects Manipur" note; null for most articles. */
  localImpactSummary: string | null;
  /** Original publisher for wire stories; null for our own reporting. */
  source: string | null;
  sourceUrl: string | null;
}

interface ArticleRow {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  featuredImageUrl: string | null;
  imageCaption: string | null;
  authorName: string;
  categorySlug: string;
  categoryName: string;
  isFeatured: number;
  isBreaking: number;
  publishedAt: string;
  tagsRaw: string | null;
  localImpactSummary: string | null;
  source: string | null;
  sourceUrl: string | null;
}

const SELECT_ARTICLE = `
  SELECT
    a.id, a.title, a.slug, a.excerpt,
    a.content_html AS contentHtml,
    a.featured_image_url AS featuredImageUrl,
    a.image_caption AS imageCaption,
    au.name AS authorName,
    c.slug AS categorySlug,
    c.name AS categoryName,
    a.is_featured AS isFeatured,
    a.is_breaking AS isBreaking,
    a.published_at AS publishedAt,
    a.local_impact_summary AS localImpactSummary,
    a.source AS source,
    a.source_url AS sourceUrl,
    (
      SELECT GROUP_CONCAT(t.name, '|')
      FROM article_tags at2 JOIN tags t ON t.id = at2.tag_id
      WHERE at2.article_id = a.id
    ) AS tagsRaw
  FROM articles a
  JOIN authors au ON au.id = a.author_id
  JOIN categories c ON c.id = a.category_id
`;

function mapRow(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    contentHtml: row.contentHtml,
    featuredImageUrl: row.featuredImageUrl,
    imageCaption: row.imageCaption,
    authorName: row.authorName,
    categorySlug: row.categorySlug,
    categoryName: row.categoryName,
    isFeatured: row.isFeatured === 1,
    isBreaking: row.isBreaking === 1,
    publishedAt: row.publishedAt,
    tags: row.tagsRaw ? row.tagsRaw.split("|") : [],
    localImpactSummary: row.localImpactSummary,
    source: row.source,
    sourceUrl: row.sourceUrl,
  };
}

// Our CSP only allows same-origin images, and publisher photos aren't ours
// to reuse, so anything external (or missing) falls back to our own art.
const FALLBACK_IMAGES: Record<string, string> = {
  politics: "/images/governance-assembly.png",
  culture: "/images/sangai-festival.png",
  entertainment: "/images/sangai-festival.png",
};

export function displayImage(article: Pick<Article, "featuredImageUrl" | "categorySlug">): string {
  const url = article.featuredImageUrl;
  if (url && url.startsWith("/")) return url;
  return FALLBACK_IMAGES[article.categorySlug] ?? "/images/hero-imphal-valley.png";
}

export async function getLatestArticles(db: D1Database, limit = 10): Promise<Article[]> {
  const { results } = await db
    .prepare(`${SELECT_ARTICLE} WHERE a.status = 'published' ORDER BY a.published_at DESC LIMIT ?`)
    .bind(limit)
    .all<ArticleRow>();
  return results.map(mapRow);
}

export async function getFeaturedArticle(db: D1Database): Promise<Article | null> {
  const row = await db
    .prepare(
      // A pinned story stops being the hero after 2 days, otherwise the
      // homepage looks frozen even while the autopilot is publishing.
      `${SELECT_ARTICLE} WHERE a.status = 'published' AND a.is_featured = 1
        AND julianday(a.published_at) >= julianday('now', '-2 days')
        ORDER BY a.published_at DESC LIMIT 1`
    )
    .first<ArticleRow>();
  if (row) return mapRow(row);

  const [latest] = await getLatestArticles(db, 1);
  return latest ?? null;
}

export async function getBreakingArticle(db: D1Database): Promise<Article | null> {
  const row = await db
    .prepare(
      // "Breaking" expires after 24 hours.
      `${SELECT_ARTICLE} WHERE a.status = 'published' AND a.is_breaking = 1
        AND julianday(a.published_at) >= julianday('now', '-1 day')
        ORDER BY a.published_at DESC LIMIT 1`
    )
    .first<ArticleRow>();
  return row ? mapRow(row) : null;
}

export async function getArticlesByCategory(db: D1Database, categorySlug: string, limit = 20): Promise<Article[]> {
  const { results } = await db
    .prepare(`${SELECT_ARTICLE} WHERE a.status = 'published' AND c.slug = ? ORDER BY a.published_at DESC LIMIT ?`)
    .bind(categorySlug, limit)
    .all<ArticleRow>();
  return results.map(mapRow);
}

export async function getArticleBySlug(db: D1Database, categorySlug: string, slug: string): Promise<Article | null> {
  const row = await db
    .prepare(`${SELECT_ARTICLE} WHERE a.status = 'published' AND c.slug = ? AND a.slug = ?`)
    .bind(categorySlug, slug)
    .first<ArticleRow>();
  return row ? mapRow(row) : null;
}

export async function getRelatedArticles(db: D1Database, article: Article, limit = 3): Promise<Article[]> {
  const { results } = await db
    .prepare(
      `${SELECT_ARTICLE} WHERE a.status = 'published' AND c.slug = ? AND a.slug != ? ORDER BY a.published_at DESC LIMIT ?`
    )
    .bind(article.categorySlug, article.slug, limit)
    .all<ArticleRow>();
  return results.map(mapRow);
}

export async function getImpactArticles(db: D1Database, limit = 3): Promise<Article[]> {
  const { results } = await db
    .prepare(
      `${SELECT_ARTICLE} WHERE a.status = 'published' AND a.local_impact_summary IS NOT NULL
       ORDER BY a.published_at DESC LIMIT ?`
    )
    .bind(limit)
    .all<ArticleRow>();
  return results.map(mapRow);
}

export async function searchArticles(db: D1Database, query: string, limit = 20): Promise<Article[]> {
  const q = query.trim();
  if (!q) return [];
  const like = `%${q}%`;
  const { results } = await db
    .prepare(
      `${SELECT_ARTICLE} WHERE a.status = 'published' AND (a.title LIKE ? OR a.excerpt LIKE ? OR c.name LIKE ?)
       ORDER BY a.published_at DESC LIMIT ?`
    )
    .bind(like, like, like, limit)
    .all<ArticleRow>();
  return results.map(mapRow);
}

// --- Admin-facing functions (all statuses, no auth check — callers must be behind /admin) ---

export interface AdminArticleListItem {
  id: number;
  title: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  authorName: string;
  status: string;
  isFeatured: boolean;
  isBreaking: boolean;
  publishedAt: string | null;
}

export async function getAllArticlesAdmin(db: D1Database): Promise<AdminArticleListItem[]> {
  const { results } = await db
    .prepare(
      `SELECT a.id, a.title, a.slug, c.slug AS categorySlug, c.name AS categoryName, au.name AS authorName,
              a.status, a.is_featured AS isFeatured, a.is_breaking AS isBreaking, a.published_at AS publishedAt
       FROM articles a
       JOIN authors au ON au.id = a.author_id
       JOIN categories c ON c.id = a.category_id
       ORDER BY a.updated_at DESC`
    )
    .all<{
      id: number;
      title: string;
      slug: string;
      categorySlug: string;
      categoryName: string;
      authorName: string;
      status: string;
      isFeatured: number;
      isBreaking: number;
      publishedAt: string | null;
    }>();
  return results.map((r) => ({
    ...r,
    isFeatured: r.isFeatured === 1,
    isBreaking: r.isBreaking === 1,
  }));
}

export interface ArticleStats {
  total: number;
  published: number;
  drafts: number;
  breaking: number;
}

export async function getArticleStats(db: D1Database): Promise<ArticleStats> {
  const row = await db
    .prepare(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS drafts,
        SUM(CASE WHEN is_breaking = 1 AND status = 'published' THEN 1 ELSE 0 END) AS breaking
       FROM articles`
    )
    .first<{ total: number; published: number; drafts: number; breaking: number }>();
  return {
    total: row?.total ?? 0,
    published: row?.published ?? 0,
    drafts: row?.drafts ?? 0,
    breaking: row?.breaking ?? 0,
  };
}

export interface ArticleForEdit {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  contentText: string;
  featuredImageUrl: string | null;
  imageCaption: string | null;
  authorId: number;
  categoryId: number;
  status: string;
  isFeatured: boolean;
  isBreaking: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  localImpactSummary: string | null;
  tags: string[];
}

export async function getArticleForEdit(db: D1Database, id: number): Promise<ArticleForEdit | null> {
  const row = await db
    .prepare(
      `SELECT a.id, a.title, a.slug, a.excerpt, a.content_html AS contentHtml,
              a.featured_image_url AS featuredImageUrl, a.image_caption AS imageCaption,
              a.author_id AS authorId, a.category_id AS categoryId, a.status,
              a.is_featured AS isFeatured, a.is_breaking AS isBreaking,
              a.seo_title AS seoTitle, a.seo_description AS seoDescription,
              a.local_impact_summary AS localImpactSummary,
              (
                SELECT GROUP_CONCAT(t.name, '|')
                FROM article_tags at2 JOIN tags t ON t.id = at2.tag_id
                WHERE at2.article_id = a.id
              ) AS tagsRaw
       FROM articles a WHERE a.id = ?`
    )
    .bind(id)
    .first<{
      id: number;
      title: string;
      slug: string;
      excerpt: string;
      contentHtml: string;
      featuredImageUrl: string | null;
      imageCaption: string | null;
      authorId: number;
      categoryId: number;
      status: string;
      isFeatured: number;
      isBreaking: number;
      seoTitle: string | null;
      seoDescription: string | null;
      localImpactSummary: string | null;
      tagsRaw: string | null;
    }>();
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    // Editor works in plain text; strip the tags back out for the textarea.
    contentText: htmlToPlainText(row.contentHtml),
    featuredImageUrl: row.featuredImageUrl,
    imageCaption: row.imageCaption,
    authorId: row.authorId,
    categoryId: row.categoryId,
    status: row.status,
    isFeatured: row.isFeatured === 1,
    isBreaking: row.isBreaking === 1,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    localImpactSummary: row.localImpactSummary,
    tags: row.tagsRaw ? row.tagsRaw.split("|") : [],
  };
}

export interface ArticleInput {
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  featuredImageUrl: string | null;
  imageCaption: string | null;
  authorId: number;
  categoryId: number;
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  isBreaking: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  localImpactSummary: string | null;
  tags: string[];
}

async function linkTags(db: D1Database, articleId: number, tagNames: string[]): Promise<void> {
  await db.prepare("DELETE FROM article_tags WHERE article_id = ?").bind(articleId).run();
  for (const rawName of tagNames) {
    const name = rawName.trim();
    if (!name) continue;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (!slug) continue;
    await db
      .prepare("INSERT INTO tags (name, slug) VALUES (?, ?) ON CONFLICT(slug) DO NOTHING")
      .bind(name, slug)
      .run();
    const tag = await db.prepare("SELECT id FROM tags WHERE slug = ?").bind(slug).first<{ id: number }>();
    if (tag) {
      await db
        .prepare("INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)")
        .bind(articleId, tag.id)
        .run();
    }
  }
}

export async function createArticle(db: D1Database, input: ArticleInput): Promise<number> {
  const publishedAt = input.status === "published" ? new Date().toISOString() : null;
  const row = await db
    .prepare(
      `INSERT INTO articles
        (title, slug, excerpt, content_html, featured_image_url, image_caption, author_id, category_id,
         status, is_featured, is_breaking, published_at, seo_title, seo_description, local_impact_summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING id`
    )
    .bind(
      input.title,
      input.slug,
      input.excerpt,
      input.contentHtml,
      input.featuredImageUrl,
      input.imageCaption,
      input.authorId,
      input.categoryId,
      input.status,
      input.isFeatured ? 1 : 0,
      input.isBreaking ? 1 : 0,
      publishedAt,
      input.seoTitle,
      input.seoDescription,
      input.localImpactSummary
    )
    .first<{ id: number }>();
  const id = row!.id;
  await linkTags(db, id, input.tags);
  return id;
}

export async function updateArticle(db: D1Database, id: number, input: ArticleInput, wasPublished: boolean): Promise<void> {
  const publishedAt =
    input.status === "published" && !wasPublished ? new Date().toISOString() : undefined;

  if (publishedAt) {
    await db
      .prepare(
        `UPDATE articles SET title=?, slug=?, excerpt=?, content_html=?, featured_image_url=?, image_caption=?,
          author_id=?, category_id=?, status=?, is_featured=?, is_breaking=?, seo_title=?, seo_description=?,
          local_impact_summary=?, published_at=?, updated_at=datetime('now')
         WHERE id=?`
      )
      .bind(
        input.title, input.slug, input.excerpt, input.contentHtml, input.featuredImageUrl, input.imageCaption,
        input.authorId, input.categoryId, input.status, input.isFeatured ? 1 : 0, input.isBreaking ? 1 : 0,
        input.seoTitle, input.seoDescription, input.localImpactSummary, publishedAt, id
      )
      .run();
  } else {
    await db
      .prepare(
        `UPDATE articles SET title=?, slug=?, excerpt=?, content_html=?, featured_image_url=?, image_caption=?,
          author_id=?, category_id=?, status=?, is_featured=?, is_breaking=?, seo_title=?, seo_description=?,
          local_impact_summary=?, updated_at=datetime('now')
         WHERE id=?`
      )
      .bind(
        input.title, input.slug, input.excerpt, input.contentHtml, input.featuredImageUrl, input.imageCaption,
        input.authorId, input.categoryId, input.status, input.isFeatured ? 1 : 0, input.isBreaking ? 1 : 0,
        input.seoTitle, input.seoDescription, input.localImpactSummary, id
      )
      .run();
  }
  await linkTags(db, id, input.tags);
}

export async function archiveArticle(db: D1Database, id: number): Promise<void> {
  await db.prepare("UPDATE articles SET status = 'archived', updated_at = datetime('now') WHERE id = ?").bind(id).run();
}

export interface SitemapEntry {
  categorySlug: string;
  slug: string;
  publishedAt: string;
}

export async function getSitemapArticles(db: D1Database): Promise<SitemapEntry[]> {
  const { results } = await db
    .prepare(
      `SELECT c.slug AS categorySlug, a.slug, a.published_at AS publishedAt
       FROM articles a JOIN categories c ON c.id = a.category_id
       WHERE a.status = 'published' ORDER BY a.published_at DESC`
    )
    .all<SitemapEntry>();
  return results;
}

export function articleHref(article: Article): string {
  return `/${article.categorySlug}/${article.slug}`;
}

export function formatPublished(isoDate: string): string {
  return new Date(isoDate).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function estimateReadTime(contentHtml: string): string {
  const words = contentHtml.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}
