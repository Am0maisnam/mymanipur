// Category data-access, backed by the `categories` table (D1).

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export async function getCategories(db: D1Database): Promise<Category[]> {
  const { results } = await db
    .prepare("SELECT id, name, slug FROM categories ORDER BY sort_order")
    .all<Category>();
  return results;
}

export async function getCategoryBySlug(db: D1Database, slug: string): Promise<Category | null> {
  const row = await db
    .prepare("SELECT id, name, slug FROM categories WHERE slug = ?")
    .bind(slug)
    .first<Category>();
  return row ?? null;
}

export interface NavItem {
  label: string;
  path: string;
  /** Underlying categories this nav grouping covers. */
  categorySlugs: string[];
}

// Geographic groupings from the original Stitch nav, kept as the visible
// top-level navigation per PROJECT_PLAN.md's merged-taxonomy decision. This
// is UI configuration, not database content, so it stays static. Routes are
// Each points at its primary category page until dedicated landing pages exist.
export const navItems: NavItem[] = [
  { label: "Imphal & Valley", path: "/imphal", categorySlugs: ["imphal", "manipur"] },
  { label: "Hills & Districts", path: "/manipur", categorySlugs: ["manipur", "northeast"] },
  { label: "Governance", path: "/politics", categorySlugs: ["politics"] },
  { label: "Culture", path: "/culture", categorySlugs: ["culture", "entertainment"] },
  { label: "Sports", path: "/sports", categorySlugs: ["sports"] },
];
