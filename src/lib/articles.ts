// Data-access layer per PROJECT_PLAN.md section 6, now backed by D1 (the
// `articles` table) instead of the static placeholder data used before
// Phase 4. Pages call these functions and never touch D1 directly.

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
  };
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
      `${SELECT_ARTICLE} WHERE a.status = 'published' AND a.is_featured = 1 ORDER BY a.published_at DESC LIMIT 1`
    )
    .first<ArticleRow>();
  if (row) return mapRow(row);

  const [latest] = await getLatestArticles(db, 1);
  return latest ?? null;
}

export async function getBreakingArticle(db: D1Database): Promise<Article | null> {
  const row = await db
    .prepare(
      `${SELECT_ARTICLE} WHERE a.status = 'published' AND a.is_breaking = 1 ORDER BY a.published_at DESC LIMIT 1`
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
