-- Sample India/World articles demonstrating the "how this affects Manipur"
-- feature. Still placeholder/dev content, same as the rest of the seed data.

INSERT INTO tags (name, slug) VALUES
  ('union budget', 'union-budget'),
  ('highways', 'highways'),
  ('trade', 'trade'),
  ('rice prices', 'rice-prices'),
  ('global trade', 'global-trade'),
  ('cost of living', 'cost-of-living');

INSERT INTO articles (title, slug, excerpt, content_html, featured_image_url, image_caption, author_id, category_id, status, is_featured, is_breaking, published_at, local_impact_summary)
VALUES
(
  'Union Budget 2026: What the New Highway Allocation Means for the Northeast',
  'union-budget-2026-highway-allocation-northeast',
  'The union budget earmarks a sharp increase in highway funding for the Northeast, including upgrades to routes linking Manipur with Myanmar.',
  '<p>The union budget earmarks a sharp increase in highway funding for the Northeast, including upgrades to routes linking Manipur with Myanmar.</p><p>Officials say the allocation prioritizes trade corridors that have seen rising cross-border commercial traffic in recent years, with contracts expected to be tendered within the fiscal year.</p><p>Opposition MPs from the region welcomed the funding but pressed for firm construction timelines, citing past delays on similar highway projects.</p>',
  '/images/governance-assembly.png',
  'National assembly session where the union budget was presented',
  (SELECT id FROM authors WHERE name = 'MyManipur Desk'),
  (SELECT id FROM categories WHERE slug = 'india'),
  'published', 0, 0, '2026-08-20T09:00:00+05:30',
  'The budget earmarks additional funds for the Imphal-Moreh highway upgrade, a route Manipur traders rely on for cross-border commerce with Myanmar. Faster, more reliable road access could cut transport times and costs for goods moving through the valley, though locals note similar past allocations have faced construction delays.'
),
(
  'Global Rice Price Surge Follows Export Restrictions From Major Producers',
  'global-rice-price-surge-export-restrictions',
  'A wave of export restrictions from major rice-producing nations has pushed global prices sharply higher, with ripple effects reaching import-dependent Indian states.',
  '<p>A wave of export restrictions from major rice-producing nations has pushed global prices sharply higher over the past month, with ripple effects reaching import-dependent Indian states.</p><p>Trade analysts say wholesale buyers are already adjusting sourcing strategies, and the effects are expected to reach retail markets within weeks.</p><p>The central government has said it is monitoring domestic supply but has not announced intervention measures so far.</p>',
  '/images/hero-imphal-valley.png',
  'Market stalls in a regional trading hub',
  (SELECT id FROM authors WHERE name = 'MyManipur Desk'),
  (SELECT id FROM categories WHERE slug = 'world'),
  'published', 0, 0, '2026-08-19T11:30:00+05:30',
  'Manipur sources part of its rice supply from outside the state, so wholesalers here may face higher procurement costs in the coming weeks. Local market vendors say they are watching wholesale rates closely before adjusting retail prices — households may see a modest rise at neighborhood markets by next month.'
);

INSERT INTO article_tags (article_id, tag_id)
SELECT a.id, t.id FROM articles a, tags t WHERE
  (a.slug = 'union-budget-2026-highway-allocation-northeast' AND t.slug IN ('union-budget', 'highways', 'trade')) OR
  (a.slug = 'global-rice-price-surge-export-restrictions' AND t.slug IN ('rice-prices', 'global-trade', 'cost-of-living'));
