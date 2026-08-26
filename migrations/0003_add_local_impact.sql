-- "How this affects Manipur" feature: an optional, editor-written summary
-- attached to national/international articles explaining local relevance.
-- NULL for articles where it doesn't apply (most articles).

ALTER TABLE articles ADD COLUMN local_impact_summary TEXT;

CREATE INDEX idx_articles_local_impact ON articles(local_impact_summary) WHERE local_impact_summary IS NOT NULL;
