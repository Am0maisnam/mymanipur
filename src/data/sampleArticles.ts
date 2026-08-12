// Placeholder editorial content standing in for the `articles` table until
// the D1 database and admin editor land in Phase 4/5. Clearly sample data —
// not to be mistaken for real published articles.

export interface SampleArticle {
  slug: string;
  title: string;
  excerpt: string;
  categorySlug: string;
  author: string;
  imageUrl: string;
  imageAlt: string;
  publishedLabel: string;
  readTime: string;
}

export const featuredArticle: SampleArticle = {
  slug: "sunset-over-imphal-new-development-initiatives",
  title: "Sunset Over Imphal: New Development Initiatives for the Valley",
  excerpt:
    "In a sweeping announcement, the state government unveiled a comprehensive infrastructure plan aimed at revitalizing key districts. The initiative promises widespread economic reform and localized job creation over the next five years.",
  categorySlug: "politics",
  author: "Sanatomba Meitei",
  imageUrl: "/images/hero-imphal-valley.png",
  imageAlt: "Aerial view of Imphal city valley at golden hour with misty mountains in the background",
  publishedLabel: "15 Mins Ago",
  readTime: "6 min read",
};

export const topStories: SampleArticle[] = [
  {
    slug: "sangai-festival-2024-celebration-of-heritage-and-unity",
    title: "Sangai Festival 2024: A Celebration of Heritage and Unity",
    excerpt:
      "Dancers in colorful ethnic attire opened this year's Sangai Festival, drawing crowds from across the state for a celebration of Manipuri heritage.",
    categorySlug: "culture",
    author: "Sanatomba Meitei",
    imageUrl: "/images/sangai-festival.png",
    imageAlt: "Traditional Manipuri cultural festival with dancers in colorful ethnic attire",
    publishedLabel: "2 Hours Ago",
    readTime: "5 min read",
  },
  {
    slug: "state-assembly-passes-landmark-resolution-on-local-governance",
    title: "State Assembly Passes Landmark Resolution on Local Governance",
    excerpt:
      "Lawmakers passed a landmark resolution reshaping how local governance bodies coordinate with the state assembly on district-level decisions.",
    categorySlug: "politics",
    author: "Sanatomba Meitei",
    imageUrl: "/images/governance-assembly.png",
    imageAlt: "Manipur government assembly hall, clean-lined architecture",
    publishedLabel: "5 Hours Ago",
    readTime: "8 min read",
  },
];

// DESIGN.md specifies a full-width Breaking News Ticker component that the
// original Stitch homepage export didn't actually include. Added per
// PROJECT_PLAN.md section 5.
export const breakingNews = {
  text: "Heavy rainfall warning issued for hill districts — relief teams on standby",
  href: "#",
};

export interface LiveUpdate {
  time: string;
  text: string;
}

export const liveUpdates: LiveUpdate[] = [
  { time: "1:15 PM", text: "Chief Minister arrives at the Assembly hall ahead of the budget session." },
  {
    time: "12:45 PM",
    text: "Traffic advisory issued for Tiddim Road due to ongoing roadworks. Commuters advised to use alternate routes.",
  },
  { time: "11:30 AM", text: "Heavy rainfall warning issued for the hill districts. Relief teams placed on standby." },
  { time: "10:00 AM", text: "Registration for the Sangai Festival volunteer program opens today." },
];
