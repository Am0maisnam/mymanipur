# MyManipur — Project Plan

Status: **Phase 1 (inspection) complete.** Nothing outside this file has been created or modified yet. Everything below is a proposal for your review before any code is written.

---

## 1. What currently exists

```
stitch_mymanipur_modern_news_portal/            <- repo root (not yet a git repo)
└── stitch_mymanipur_modern_news_portal/        <- Google Stitch export
    ├── ethos_news/DESIGN.md                    <- design tokens + style rationale
    ├── mymanipur_homepage/code.html             <- homepage HTML (Tailwind CDN)
    ├── mymanipur_homepage/screen.png
    ├── mymanipur_logo/screen.png
    ├── mymanipur_text_logo_1/screen.png
    ├── mymanipur_text_logo_2/screen.png
    ├── aerial_view_of_imphal_city_valley.../screen.png
    ├── manipur_government_building.../screen.png
    └── traditional_manipuri_cultural_festival.../screen.png
```

- **Design system** (from DESIGN.md): off-white background `#F9F9F9`, near-black text/primary `#1A1C1C`/`#000000`, sharp 0px corners everywhere, hairline `1px` borders instead of shadows, Inter typeface only, a 4px spacing scale, 1280px max content width, 12-col desktop grid. Named type scale: `display-lg`, `headline-lg` (+ mobile variant), `headline-md`, `body-lg`, `body-md`, `label-caps`, `metadata`.
- **One page only**: the homepage. It has a sticky header/nav (5 nav links: Imphal & Valley, Hills & Districts, Governance, Culture, Sports), a hero/featured article, a 2-card "Top Stories" grid, one promo/decorative block, a sticky "Live Updates" sidebar with a manually-coded timeline, and a footer with a newsletter signup form (non-functional, no backend).
- **No category page, article page, search page, or admin UI exist yet** — these need to be designed to match the homepage's system, since Stitch never generated them.
- Images are hot-linked to Google's temporary `lh3.googleusercontent.com/aida-public/...` URLs — fine as design references, **not safe to ship to production** (no uptime/licensing guarantee). Real articles will need real, owned images in R2.
- No logo source file (SVG/AI) exists, only rasterized `screen.png` previews — you'll want an actual logo asset before launch.
- Nav categories in the HTML (Imphal & Valley, Hills & Districts, Governance, Culture, Sports) differ from the category list in your brief (Manipur, Imphal, Northeast, Politics, Crime, Business, Education, Sports, Culture, Entertainment, Technology, India, World) — see open question in §12.

---

## 2. Proposed architecture

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | **Astro** + TypeScript | Ships near-zero JS by default (matches the "minimal JS" performance goal), first-class Cloudflare adapter, easy to hand-port static Tailwind HTML like the Stitch export. |
| Styling | **Tailwind CSS**, compiled (not CDN) | The Stitch file uses the Tailwind CDN + inline config, fine for a prototype, wrong for production (no purge, no build step, flash of unstyled content). We'll port the exact same token values into a real `tailwind.config` during Phase 2. |
| Backend/API | **Cloudflare Workers**, via Astro's Cloudflare adapter (SSR endpoints) | One deploy target for site + API, no separate backend service to run. |
| Database | **Cloudflare D1** (SQLite) | Free tier friendly, sufficient for a regional news site's read-heavy, moderate-write load. |
| Image storage | **Cloudflare R2** | S3-compatible object storage, no egress fees, pairs naturally with Workers. |
| Caching | **Cloudflare KV**, used sparingly (e.g. rendered homepage fragments, category lists) | Only where it clearly helps — not a cache-everything strategy. |
| Deployment | **Cloudflare Pages/Workers** | Matches the above; single provider, generous free tier. |
| Auth | Session cookies issued by a Worker, password hashing via `bcrypt`/`scrypt`-equivalent available in Workers runtime (e.g. `@node-rs/bcrypt` isn't available in Workers — will use Web Crypto `PBKDF2` or `argon2` via a Workers-compatible library) | Keep it simple: no third-party auth provider needed for a single-admin-team site initially. |

This is intentionally the same stack you and the brief proposed — I'm not deviating from it. No queues, no microservices, no ORM beyond a thin typed query layer.

---

## 3. Route structure

**Public**
```
/                          homepage
/[category]                category listing (e.g. /manipur, /sports)
/[category]/[slug]         article page
/search?q=...              search results
/rss.xml                   RSS feed
/sitemap.xml                sitemap
```

**Admin** (all behind auth middleware)
```
/admin/login
/admin                     dashboard (counts: published/drafts/breaking/recent)
/admin/articles            list + filter
/admin/articles/new
/admin/articles/[id]/edit
/admin/categories
/admin/authors
```

Article URLs are `/[category]/[slug]` (not `/article/[slug]`) — this matches typical news-site SEO conventions and reads naturally (`mymanipur.com/sports/sangai-festival-2024`).

---

## 4. Database schema (D1 / SQLite)

```sql
users            (id, email, password_hash, role, created_at)
authors          (id, name, bio, avatar_url, user_id nullable)
categories       (id, name, slug, sort_order)
tags             (id, name, slug)
articles         (
  id, title, slug, excerpt, content_html,
  featured_image_url, image_caption,
  author_id, category_id,
  status,            -- 'draft' | 'published' | 'archived'
  is_featured, is_breaking,
  published_at, created_at, updated_at,
  seo_title, seo_description,
  source, source_url, external_article_id  -- for ingested content
)
article_tags     (article_id, tag_id)
media            (id, r2_key, width, height, alt_text, uploaded_by, created_at)
```

Indexes: `articles(slug)` unique, `articles(status, published_at)`, `articles(category_id, status, published_at)`, `articles(is_breaking)`, `articles(is_featured)`.

Public queries always filter `status = 'published'` — draft/archived rows are never reachable from public routes, enforced in the data-access layer, not ad hoc per-page.

---

## 5. Component structure (mapped from the Stitch homepage)

The homepage HTML already implies a clean component boundary — Phase 2 will extract these as Astro components rather than one long page:

- `Header.astro` — logo, nav (data-driven from `categories` table, not hardcoded), search icon, live date
- `HeroArticle.astro` — featured/hero story block
- `ArticleCard.astro` — the "Top Stories" card, reused across homepage/category pages (vertical variant seen in Stitch; will add a horizontal variant for list-style pages per DESIGN.md's component note)
- `LiveUpdatesFeed.astro` — sidebar ticker (will become real data-driven "breaking/live" items, not hardcoded)
- `BreakingNewsTicker.astro` — new; DESIGN.md specifies this component but it isn't in the current homepage HTML
- `Footer.astro`
- `CategoryTag.astro`, `Chip.astro` — small reusable label components from the design system

All using the same design tokens (colors, spacing, radius = 0, type scale) pulled from `DESIGN.md` into `tailwind.config`.

---

## 6. API / data-access layer

Kept as plain typed functions, not scattered raw queries in components:

```
getLatestArticles(limit, offset)
getFeaturedArticle()
getBreakingArticles()
getArticlesByCategory(categorySlug, limit, offset)
getArticleBySlug(categorySlug, slug)
searchArticles(query, limit, offset)
createArticle(data)      -- admin only
updateArticle(id, data)  -- admin only
deleteArticle(id)        -- admin only (soft: sets status='archived')
```

Admin mutation endpoints live under `/api/admin/*`, protected by session middleware; never exposed to anonymous users.

---

## 7. Authentication

- Single `users` table, `role` field (`admin`/`editor`) for future flexibility, only one role enforced initially.
- Password hashing via a Workers-runtime-compatible algorithm (PBKDF2 via Web Crypto, or `argon2` if a suitable WASM build works in Workers — decided during Phase 5 implementation).
- Sessions: signed, httpOnly cookie holding a session ID stored in D1 (or KV) with expiry — not a JWT-in-localStorage pattern, to avoid XSS token theft.
- No hardcoded credentials anywhere; first admin user created via a one-time seed script reading from an env var, not committed.

---

## 8. News ingestion (Phase 7, after manual publishing works)

- External sources normalized into a common shape before touching `articles`: `{ title, excerpt, source, source_url, thumbnail_url, published_at }`.
- Stored as their own lightweight `status` or flagged via `source`/`source_url` fields already in the schema — not required to duplicate full article bodies.
- Never auto-publish full third-party article text; excerpt + attribution + link to original only.
- Ingestion adapters are swappable (one function per provider) so losing an API doesn't break the layer — manual articles remain the backbone of the site regardless of feed status.

---

## 9. SEO

- Astro's file-based routing gives clean canonical URLs by construction.
- Per-article: dynamic `<title>`, meta description from `seo_title`/`seo_description` fields (falling back to `excerpt`), Open Graph + Twitter Card tags, `NewsArticle` JSON-LD structured data.
- Sitemap and RSS generated at build/request time from published articles.
- `robots.txt` disallows `/admin`.

---

## 10. Images

- Admin uploads go to R2 via a Worker endpoint; store the R2 key + dimensions in `media`.
- Cloudflare's image resizing (or a manual set of pre-generated sizes) serves appropriately sized images per breakpoint — avoid shipping full-resolution originals to mobile.
- The Stitch-provided `lh3.googleusercontent.com` URLs are placeholders only; real launch content needs owned/licensed images.

---

## 11. Development phases (as you specified)

1. ~~Inspect repo + Stitch UI, produce this plan~~ ✅ (this document)
2. Project scaffolding: Astro + TS + Tailwind config ported from DESIGN.md, shared components extracted from the homepage HTML
3. Public site: homepage, category pages, article page, search, responsive pass
4. Database: schema, migrations, data-access layer, seed categories/authors
5. Auth + admin: login, dashboard, article editor, publish workflow
6. Images: R2 integration, upload flow, resizing
7. External news ingestion (RSS/APIs), normalized and attributed
8. SEO: sitemap, RSS, structured data, performance pass
9. Security + accessibility review, responsive QA, production deploy to Cloudflare

Each phase ends with something you can see/click before the next one starts.

---

## 12. Decisions (resolved)

1. **Category taxonomy — merged.** The geographic terms already in the Stitch nav (Imphal & Valley, Hills & Districts, Governance, Culture, Sports) stay as the visible top-nav groupings. Underneath, the `categories` table uses the fuller topic-based list from the brief (Manipur, Imphal, Northeast, Politics, Crime, Business, Education, Sports, Culture, Entertainment, Technology, India, World). Nav items map to one or more underlying categories (e.g. "Governance" nav link → `politics` category), configured in data, not hardcoded in the template — so the mapping can be adjusted later without touching component code.
2. **Breaking-news accent — dedicated token.** Adding `accent`/`breaking: #B91C1C` as its own Tailwind color token, distinct from `error: #ba1a1a`. Used for the breaking-news ticker, breaking tags, and "wayfinding" indicators per DESIGN.md; `error` stays reserved for actual error/failure UI (form validation, 404, etc.).
3. **Logo — placeholder for now.** No source logo file exists yet (only rasterized `screen.png` crops). Will keep using the Stitch logo crop as a placeholder until a real logo asset is provided; swapping it later is a one-file change.

---

## 13. Environment variables (documented in `.env.example`, created in Phase 2)

```
DATABASE_URL / D1 binding name
SESSION_SECRET
R2_BUCKET binding name
ADMIN_SEED_EMAIL
ADMIN_SEED_PASSWORD        (used once, for initial admin creation only)
NEWS_API_KEY(S)            (Phase 7, per external provider)
SITE_URL
```

No secrets are committed; this file only documents variable *names*.

---

## 14. Future scalability notes (not built now, just kept in mind)

- `role` column on `users` already supports adding editor/contributor tiers later without a schema change.
- Ingestion adapters are isolated per-provider so a new API/RSS source is additive.
- KV caching layer can be extended to more routes if traffic grows past what D1 reads comfortably serve.
- Trending logic starts as `published_at DESC`; a `views` counter column can be added later without breaking existing queries.

---

**Nothing has been built yet.** Decisions in §12 are locked in — say the word and I'll start Phase 2: scaffolding the Astro project and porting the Stitch homepage into real components.
