-- News autopilot: scoring columns on articles, a sync-run log for
-- monitoring, and a one-time repair of wire articles whose source link was
-- escaped into visible "&amp;lt;a href" text by repeated edit/save cycles.

ALTER TABLE articles ADD COLUMN ingest_score INTEGER;
ALTER TABLE articles ADD COLUMN review_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_articles_external_id ON articles(external_article_id);
CREATE INDEX IF NOT EXISTS idx_articles_source_url ON articles(source_url);
CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at);

CREATE TABLE IF NOT EXISTS sync_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ran_at TEXT NOT NULL DEFAULT (datetime('now')),
  trigger TEXT NOT NULL,
  providers TEXT,
  fetched INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 0,
  held INTEGER NOT NULL DEFAULT 0,
  skipped INTEGER NOT NULL DEFAULT 0,
  errors TEXT
);

-- Rebuild the body of wire articles from their excerpt, dropping the stored
-- link (the template now renders it). Only provider rows that still carry
-- the auto-generated "Read the full story" line are touched, so any body an
-- editor rewrote by hand is left alone.
UPDATE articles
SET content_html = '<p>' || replace(replace(replace(excerpt, '&', '&amp;'), '<', '&lt;'), '>', '&gt;') || '</p>',
    updated_at = datetime('now')
WHERE source_url IS NOT NULL
  AND content_html LIKE '%Read the full story at%';

-- Stop hotlinking publisher images on wire articles (blocked by our CSP,
-- and not ours to use). Components fall back to our own images.
UPDATE articles
SET featured_image_url = NULL
WHERE source_url IS NOT NULL AND featured_image_url LIKE 'http%';
