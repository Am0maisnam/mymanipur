// Temporary static data standing in for the `categories` table until the D1
// database lands in Phase 4. Shapes here are meant to match that table.

export interface Category {
  slug: string;
  name: string;
}

// Full topic-based taxonomy from the project brief. Articles are tagged
// against these, not against the nav groupings below.
export const categories: Category[] = [
  { slug: "manipur", name: "Manipur" },
  { slug: "imphal", name: "Imphal" },
  { slug: "northeast", name: "Northeast" },
  { slug: "politics", name: "Politics" },
  { slug: "crime", name: "Crime" },
  { slug: "business", name: "Business" },
  { slug: "education", name: "Education" },
  { slug: "sports", name: "Sports" },
  { slug: "culture", name: "Culture" },
  { slug: "entertainment", name: "Entertainment" },
  { slug: "technology", name: "Technology" },
  { slug: "india", name: "India" },
  { slug: "world", name: "World" },
];

export interface NavItem {
  label: string;
  path: string;
  /** Underlying categories this nav grouping covers. */
  categorySlugs: string[];
}

// Geographic groupings from the original Stitch nav, kept as the visible
// top-level navigation per PROJECT_PLAN.md's merged-taxonomy decision.
// Routes are placeholders ("#") until category pages are built in Phase 3.
export const navItems: NavItem[] = [
  { label: "Imphal & Valley", path: "#", categorySlugs: ["imphal", "manipur"] },
  { label: "Hills & Districts", path: "#", categorySlugs: ["manipur", "northeast"] },
  { label: "Governance", path: "#", categorySlugs: ["politics"] },
  { label: "Culture", path: "#", categorySlugs: ["culture", "entertainment"] },
  { label: "Sports", path: "#", categorySlugs: ["sports"] },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
