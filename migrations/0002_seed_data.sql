-- Seed data: the taxonomy from PROJECT_PLAN.md and the placeholder articles
-- that were previously hardcoded in src/data/sampleArticles.ts, now moved
-- into the database. Still sample/dev content, not real published articles.

INSERT INTO categories (name, slug, sort_order) VALUES
  ('Manipur', 'manipur', 1),
  ('Imphal', 'imphal', 2),
  ('Northeast', 'northeast', 3),
  ('Politics', 'politics', 4),
  ('Crime', 'crime', 5),
  ('Business', 'business', 6),
  ('Education', 'education', 7),
  ('Sports', 'sports', 8),
  ('Culture', 'culture', 9),
  ('Entertainment', 'entertainment', 10),
  ('Technology', 'technology', 11),
  ('India', 'india', 12),
  ('World', 'world', 13);

INSERT INTO authors (name) VALUES
  ('Sanatomba Meitei'),
  ('Ibemhal Chanu'),
  ('MyManipur Desk');

INSERT INTO tags (name, slug) VALUES
  ('infrastructure', 'infrastructure'),
  ('imphal valley', 'imphal-valley'),
  ('state government', 'state-government'),
  ('sangai festival', 'sangai-festival'),
  ('culture', 'culture'),
  ('tourism', 'tourism'),
  ('state assembly', 'state-assembly'),
  ('local governance', 'local-governance'),
  ('policy', 'policy'),
  ('football', 'football'),
  ('youth sports', 'youth-sports'),
  ('national camp', 'national-camp'),
  ('handloom', 'handloom'),
  ('exports', 'exports'),
  ('business', 'business'),
  ('weather', 'weather'),
  ('hill districts', 'hill-districts'),
  ('advisory', 'advisory');

INSERT INTO articles (title, slug, excerpt, content_html, featured_image_url, image_caption, author_id, category_id, status, is_featured, is_breaking, published_at)
VALUES
(
  'Sunset Over Imphal: New Development Initiatives for the Valley',
  'sunset-over-imphal-new-development-initiatives',
  'In a sweeping announcement, the state government unveiled a comprehensive infrastructure plan aimed at revitalizing key districts. The initiative promises widespread economic reform and localized job creation over the next five years.',
  '<p>In a sweeping announcement, the state government unveiled a comprehensive infrastructure plan aimed at revitalizing key districts across the Imphal Valley. The initiative promises widespread economic reform and localized job creation over the next five years.</p><p>Officials say the plan prioritizes road connectivity between the valley and surrounding hill districts, along with upgrades to water and power infrastructure that have lagged behind population growth in recent years.</p><p>Local business associations welcomed the announcement, though several district councils have asked for clearer timelines before committing to the accompanying land-use changes. A follow-up public consultation is expected within the month.</p>',
  '/images/hero-imphal-valley.png',
  'Aerial view of Imphal city valley at golden hour with misty mountains in the background',
  (SELECT id FROM authors WHERE name = 'Sanatomba Meitei'),
  (SELECT id FROM categories WHERE slug = 'politics'),
  'published', 1, 0, '2026-08-12T13:45:00+05:30'
),
(
  'Sangai Festival 2024: A Celebration of Heritage and Unity',
  'sangai-festival-2024-celebration-of-heritage-and-unity',
  'Dancers in colorful ethnic attire opened this year''s Sangai Festival, drawing crowds from across the state for a celebration of Manipuri heritage.',
  '<p>Dancers in colorful ethnic attire opened this year''s Sangai Festival, drawing crowds from across the state for a celebration of Manipuri heritage, craft, and cuisine.</p><p>This year''s programme expands the festival''s cultural showcase to all nine districts, with organizers reporting record early registration for the handloom and handicraft pavilions.</p><p>The festival runs through the end of the month, with folk performances, sporting exhibitions, and a food festival scheduled across venues in Imphal.</p>',
  '/images/sangai-festival.png',
  'Traditional Manipuri cultural festival with dancers in colorful ethnic attire',
  (SELECT id FROM authors WHERE name = 'Sanatomba Meitei'),
  (SELECT id FROM categories WHERE slug = 'culture'),
  'published', 0, 0, '2026-08-12T10:30:00+05:30'
),
(
  'State Assembly Passes Landmark Resolution on Local Governance',
  'state-assembly-passes-landmark-resolution-on-local-governance',
  'Lawmakers passed a landmark resolution reshaping how local governance bodies coordinate with the state assembly on district-level decisions.',
  '<p>Lawmakers passed a landmark resolution reshaping how local governance bodies coordinate with the state assembly on district-level decisions, in a session that ran late into the evening.</p><p>The resolution grants district councils expanded authority over local infrastructure spending, a change officials say will speed up approval timelines for smaller civic projects.</p><p>Opposition members raised concerns over funding oversight, and the assembly has agreed to review the resolution''s financial reporting provisions in six months.</p>',
  '/images/governance-assembly.png',
  'Manipur government assembly hall, clean-lined architecture',
  (SELECT id FROM authors WHERE name = 'Sanatomba Meitei'),
  (SELECT id FROM categories WHERE slug = 'politics'),
  'published', 0, 0, '2026-08-12T08:15:00+05:30'
),
(
  'Manipur Football Academy Sends Three Players to National Camp',
  'manipur-football-academy-sends-three-players-to-national-camp',
  'Three graduates of a local football academy have been called up to the national under-17 training camp, continuing the state''s strong pipeline of footballing talent.',
  '<p>Three graduates of a local football academy have been called up to the national under-17 training camp, continuing the state''s strong pipeline of footballing talent.</p><p>The academy''s coaching staff credited a renewed focus on grassroots scouting in the hill districts, where talent had historically gone unnoticed by state selectors.</p><p>The trio will report to camp next week ahead of a regional qualifying tournament later this season.</p>',
  '/images/hero-imphal-valley.png',
  'Aerial view of Imphal city valley',
  (SELECT id FROM authors WHERE name = 'Ibemhal Chanu'),
  (SELECT id FROM categories WHERE slug = 'sports'),
  'published', 0, 0, '2026-08-11T18:00:00+05:30'
),
(
  'Handloom Exporters See Record Season Ahead of Festive Demand',
  'handloom-exporters-see-record-season-ahead-of-festive-demand',
  'Local handloom exporters are reporting their strongest order volumes in years, driven by growing festive-season demand from national retailers.',
  '<p>Local handloom exporters are reporting their strongest order volumes in years, driven by growing festive-season demand from national retailers.</p><p>Industry groups say improved logistics links to Guwahati have cut delivery times nearly in half, making Manipuri handloom products more competitive on national platforms.</p><p>Weaver cooperatives are now lobbying the state for expanded skill-training programs to keep pace with the increased order flow.</p>',
  '/images/sangai-festival.png',
  'Handloom and handicraft display',
  (SELECT id FROM authors WHERE name = 'Ibemhal Chanu'),
  (SELECT id FROM categories WHERE slug = 'business'),
  'published', 0, 0, '2026-08-11T14:20:00+05:30'
),
(
  'Heavy Rainfall Warning Issued for Hill Districts',
  'heavy-rainfall-warning-issued-for-hill-districts',
  'The meteorological department has issued a heavy rainfall warning for the hill districts, with relief teams placed on standby.',
  '<p>The meteorological department has issued a heavy rainfall warning for the hill districts, with relief teams placed on standby through the weekend.</p><p>District administrations have pre-positioned emergency supplies in low-lying areas and are advising residents near riverbanks to stay alert for updates.</p>',
  '/images/hero-imphal-valley.png',
  'Misty hill districts of Manipur',
  (SELECT id FROM authors WHERE name = 'MyManipur Desk'),
  (SELECT id FROM categories WHERE slug = 'northeast'),
  'published', 0, 1, '2026-08-12T13:15:00+05:30'
);

INSERT INTO article_tags (article_id, tag_id)
SELECT a.id, t.id FROM articles a, tags t WHERE
  (a.slug = 'sunset-over-imphal-new-development-initiatives' AND t.slug IN ('infrastructure', 'imphal-valley', 'state-government')) OR
  (a.slug = 'sangai-festival-2024-celebration-of-heritage-and-unity' AND t.slug IN ('sangai-festival', 'culture', 'tourism')) OR
  (a.slug = 'state-assembly-passes-landmark-resolution-on-local-governance' AND t.slug IN ('state-assembly', 'local-governance', 'policy')) OR
  (a.slug = 'manipur-football-academy-sends-three-players-to-national-camp' AND t.slug IN ('football', 'youth-sports', 'national-camp')) OR
  (a.slug = 'handloom-exporters-see-record-season-ahead-of-festive-demand' AND t.slug IN ('handloom', 'exports', 'business')) OR
  (a.slug = 'heavy-rainfall-warning-issued-for-hill-districts' AND t.slug IN ('weather', 'hill-districts', 'advisory'));
