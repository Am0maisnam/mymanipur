// Placeholder editorial content standing in for the `articles` table until
// the D1 database and admin editor land in Phase 4/5. Clearly marked sample
// data per the project brief's content rules — not real published articles.

export interface SampleArticle {
  slug: string;
  title: string;
  excerpt: string;
  content: string[]; // paragraphs
  categorySlug: string;
  author: string;
  imageUrl: string;
  imageAlt: string;
  publishedAt: Date;
  readTime: string;
  tags: string[];
  isFeatured?: boolean;
  isBreaking?: boolean;
}

export const articles: SampleArticle[] = [
  {
    slug: "sunset-over-imphal-new-development-initiatives",
    title: "Sunset Over Imphal: New Development Initiatives for the Valley",
    excerpt:
      "In a sweeping announcement, the state government unveiled a comprehensive infrastructure plan aimed at revitalizing key districts. The initiative promises widespread economic reform and localized job creation over the next five years.",
    content: [
      "In a sweeping announcement, the state government unveiled a comprehensive infrastructure plan aimed at revitalizing key districts across the Imphal Valley. The initiative promises widespread economic reform and localized job creation over the next five years.",
      "Officials say the plan prioritizes road connectivity between the valley and surrounding hill districts, along with upgrades to water and power infrastructure that have lagged behind population growth in recent years.",
      "Local business associations welcomed the announcement, though several district councils have asked for clearer timelines before committing to the accompanying land-use changes. A follow-up public consultation is expected within the month.",
    ],
    categorySlug: "politics",
    author: "Sanatomba Meitei",
    imageUrl: "/images/hero-imphal-valley.png",
    imageAlt: "Aerial view of Imphal city valley at golden hour with misty mountains in the background",
    publishedAt: new Date("2026-08-12T13:45:00+05:30"),
    readTime: "6 min read",
    tags: ["infrastructure", "imphal valley", "state government"],
    isFeatured: true,
  },
  {
    slug: "sangai-festival-2024-celebration-of-heritage-and-unity",
    title: "Sangai Festival 2024: A Celebration of Heritage and Unity",
    excerpt:
      "Dancers in colorful ethnic attire opened this year's Sangai Festival, drawing crowds from across the state for a celebration of Manipuri heritage.",
    content: [
      "Dancers in colorful ethnic attire opened this year's Sangai Festival, drawing crowds from across the state for a celebration of Manipuri heritage, craft, and cuisine.",
      "This year's programme expands the festival's cultural showcase to all nine districts, with organizers reporting record early registration for the handloom and handicraft pavilions.",
      "The festival runs through the end of the month, with folk performances, sporting exhibitions, and a food festival scheduled across venues in Imphal.",
    ],
    categorySlug: "culture",
    author: "Sanatomba Meitei",
    imageUrl: "/images/sangai-festival.png",
    imageAlt: "Traditional Manipuri cultural festival with dancers in colorful ethnic attire",
    publishedAt: new Date("2026-08-12T10:30:00+05:30"),
    readTime: "5 min read",
    tags: ["sangai festival", "culture", "tourism"],
  },
  {
    slug: "state-assembly-passes-landmark-resolution-on-local-governance",
    title: "State Assembly Passes Landmark Resolution on Local Governance",
    excerpt:
      "Lawmakers passed a landmark resolution reshaping how local governance bodies coordinate with the state assembly on district-level decisions.",
    content: [
      "Lawmakers passed a landmark resolution reshaping how local governance bodies coordinate with the state assembly on district-level decisions, in a session that ran late into the evening.",
      "The resolution grants district councils expanded authority over local infrastructure spending, a change officials say will speed up approval timelines for smaller civic projects.",
      "Opposition members raised concerns over funding oversight, and the assembly has agreed to review the resolution's financial reporting provisions in six months.",
    ],
    categorySlug: "politics",
    author: "Sanatomba Meitei",
    imageUrl: "/images/governance-assembly.png",
    imageAlt: "Manipur government assembly hall, clean-lined architecture",
    publishedAt: new Date("2026-08-12T08:15:00+05:30"),
    readTime: "8 min read",
    tags: ["state assembly", "local governance", "policy"],
  },
  {
    slug: "manipur-football-academy-sends-three-players-to-national-camp",
    title: "Manipur Football Academy Sends Three Players to National Camp",
    excerpt:
      "Three graduates of a local football academy have been called up to the national under-17 training camp, continuing the state's strong pipeline of footballing talent.",
    content: [
      "Three graduates of a local football academy have been called up to the national under-17 training camp, continuing the state's strong pipeline of footballing talent.",
      "The academy's coaching staff credited a renewed focus on grassroots scouting in the hill districts, where talent had historically gone unnoticed by state selectors.",
      "The trio will report to camp next week ahead of a regional qualifying tournament later this season.",
    ],
    categorySlug: "sports",
    author: "Ibemhal Chanu",
    imageUrl: "/images/hero-imphal-valley.png",
    imageAlt: "Aerial view of Imphal city valley",
    publishedAt: new Date("2026-08-11T18:00:00+05:30"),
    readTime: "4 min read",
    tags: ["football", "youth sports", "national camp"],
  },
  {
    slug: "handloom-exporters-see-record-season-ahead-of-festive-demand",
    title: "Handloom Exporters See Record Season Ahead of Festive Demand",
    excerpt:
      "Local handloom exporters are reporting their strongest order volumes in years, driven by growing festive-season demand from national retailers.",
    content: [
      "Local handloom exporters are reporting their strongest order volumes in years, driven by growing festive-season demand from national retailers.",
      "Industry groups say improved logistics links to Guwahati have cut delivery times nearly in half, making Manipuri handloom products more competitive on national platforms.",
      "Weaver cooperatives are now lobbying the state for expanded skill-training programs to keep pace with the increased order flow.",
    ],
    categorySlug: "business",
    author: "Ibemhal Chanu",
    imageUrl: "/images/sangai-festival.png",
    imageAlt: "Handloom and handicraft display",
    publishedAt: new Date("2026-08-11T14:20:00+05:30"),
    readTime: "5 min read",
    tags: ["handloom", "exports", "business"],
  },
  {
    slug: "heavy-rainfall-warning-issued-for-hill-districts",
    title: "Heavy Rainfall Warning Issued for Hill Districts",
    excerpt:
      "The meteorological department has issued a heavy rainfall warning for the hill districts, with relief teams placed on standby.",
    content: [
      "The meteorological department has issued a heavy rainfall warning for the hill districts, with relief teams placed on standby through the weekend.",
      "District administrations have pre-positioned emergency supplies in low-lying areas and are advising residents near riverbanks to stay alert for updates.",
    ],
    categorySlug: "northeast",
    author: "MyManipur Desk",
    imageUrl: "/images/hero-imphal-valley.png",
    imageAlt: "Misty hill districts of Manipur",
    publishedAt: new Date("2026-08-12T13:15:00+05:30"),
    readTime: "2 min read",
    tags: ["weather", "hill districts", "advisory"],
    isBreaking: true,
  },
];

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
