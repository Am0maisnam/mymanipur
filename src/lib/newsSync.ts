// One sync run across every configured provider. Used by both the admin
// "Sync now" button and the scheduled /api/cron/news-sync endpoint, so the
// two can never drift apart.

import { getCategories } from "./categories";
import { getAuthors } from "./authors";
import { emptyResult, ingestNewsItems, type IngestResult, type NewsProvider } from "./newsIngestion";
import { gnewsProvider } from "./newsProviders/gnews";
import { newsdataProvider } from "./newsProviders/newsdata";

export interface SyncEnv {
  DB: D1Database;
  NEWS_API_KEY?: string;
  NEWSDATA_API_KEY?: string;
  AUTOPUBLISH?: string;
}

export interface ProviderConfig {
  id: string;
  provider: NewsProvider;
  apiKey: string | undefined;
  setupCommand: string;
}

export function providerConfigs(env: SyncEnv): ProviderConfig[] {
  return [
    { id: "gnews", provider: gnewsProvider, apiKey: env.NEWS_API_KEY, setupCommand: "wrangler secret put NEWS_API_KEY" },
    { id: "newsdata", provider: newsdataProvider, apiKey: env.NEWSDATA_API_KEY, setupCommand: "wrangler secret put NEWSDATA_API_KEY" },
  ];
}

export function autoPublishEnabled(env: SyncEnv): boolean {
  return String(env.AUTOPUBLISH ?? "").toLowerCase() === "true";
}

export interface SyncOutcome {
  result: IngestResult;
  providersRun: string[];
  providersFailed: string[];
  autoPublish: boolean;
}

export async function runNewsSync(env: SyncEnv, trigger: "cron" | "manual", onlyProviderId?: string): Promise<SyncOutcome> {
  const db = env.DB;
  const categories = await getCategories(db);
  const authors = await getAuthors(db);
  const desk = authors.find((a) => a.name === "MyManipur Desk") ?? authors[0];
  const fallback = categories.find((c) => c.slug === "manipur") ?? categories[0];
  if (!desk || !fallback) throw new Error("Need at least one category and one author before syncing.");

  const autoPublish = autoPublishEnabled(env);
  const options = {
    autoPublish,
    deskAuthorId: desk.id,
    categoryIds: new Map(categories.map((c) => [c.slug, c.id])),
    fallbackCategoryId: fallback.id,
  };

  const result = emptyResult();
  const providersRun: string[] = [];
  const providersFailed: string[] = [];

  for (const config of providerConfigs(env)) {
    if (onlyProviderId && config.id !== onlyProviderId) continue;
    if (!config.apiKey) continue;
    providersRun.push(config.provider.name);
    try {
      const items = await config.provider.fetchLatest(config.apiKey);
      await ingestNewsItems(db, items, options, result);
    } catch (err) {
      providersFailed.push(config.provider.name);
      result.errors.push(`${config.provider.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  await db
    .prepare(
      `INSERT INTO sync_runs (trigger, providers, fetched, published, held, skipped, errors)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      trigger,
      providersRun.join(", "),
      result.fetched,
      result.published,
      result.heldForReview,
      result.skippedIrrelevant + result.skippedDuplicate + result.skippedExisting,
      result.errors.length ? result.errors.join("\n").slice(0, 2000) : null
    )
    .run();

  return { result, providersRun, providersFailed, autoPublish };
}

export interface SyncRun {
  ranAt: string;
  trigger: string;
  providers: string;
  fetched: number;
  published: number;
  held: number;
  skipped: number;
  errors: string | null;
}

export async function getRecentSyncRuns(db: D1Database, limit = 10): Promise<SyncRun[]> {
  const { results } = await db
    .prepare(
      `SELECT ran_at AS ranAt, trigger, providers, fetched, published, held, skipped, errors
       FROM sync_runs ORDER BY id DESC LIMIT ?`
    )
    .bind(limit)
    .all<SyncRun>();
  return results;
}

export async function hoursSinceLastPublish(db: D1Database): Promise<number | null> {
  const row = await db
    .prepare("SELECT MAX(published_at) AS last FROM articles WHERE status = 'published'")
    .first<{ last: string | null }>();
  if (!row?.last) return null;
  return (Date.now() - new Date(row.last).getTime()) / 36e5;
}

export interface HeldDraft {
  id: number;
  title: string;
  source: string | null;
  categoryName: string;
  reviewReason: string | null;
  createdAt: string;
}

export async function getHeldDrafts(db: D1Database, limit = 50): Promise<HeldDraft[]> {
  const { results } = await db
    .prepare(
      `SELECT a.id, a.title, a.source, c.name AS categoryName, a.review_reason AS reviewReason, a.created_at AS createdAt
       FROM articles a JOIN categories c ON c.id = a.category_id
       WHERE a.status = 'draft' AND a.source_url IS NOT NULL
       ORDER BY a.created_at DESC LIMIT ?`
    )
    .bind(limit)
    .all<HeldDraft>();
  return results;
}

/**
 * Re-runs the relevance rules over already-published wire stories and
 * archives (never deletes) the ones that aren't about Manipur — e.g. the
 * Uttarakhand Congress story that was on the homepage.
 */
export async function archiveIrrelevantPublishedWire(db: D1Database): Promise<{ checked: number; archived: string[] }> {
  const { assessItem } = await import("./newsRelevance");
  const { results } = await db
    .prepare(
      `SELECT id, title, excerpt, source, source_url AS sourceUrl, external_article_id AS externalId, published_at AS publishedAt
       FROM articles WHERE status = 'published' AND source_url IS NOT NULL`
    )
    .all<{ id: number; title: string; excerpt: string; source: string | null; sourceUrl: string; externalId: string | null; publishedAt: string }>();

  const archived: string[] = [];
  for (const row of results) {
    const assessment = assessItem({
      title: row.title,
      excerpt: row.excerpt,
      sourceName: row.source ?? "",
      sourceUrl: row.sourceUrl,
      externalId: row.externalId ?? row.sourceUrl,
      imageUrl: null,
      publishedAt: row.publishedAt,
    });
    if (assessment.decision === "skip") {
      await db
        .prepare("UPDATE articles SET status = 'archived', review_reason = ?, updated_at = datetime('now') WHERE id = ?")
        .bind(`Archived by relevance re-check: ${assessment.reason}`, row.id)
        .run();
      archived.push(row.title);
    }
  }
  return { checked: results.length, archived };
}
