// Decides what happens to each ingested wire item, deterministically and
// without any paid API: publish automatically, hold for an editor, or skip.
//
// Why rules and not an LLM (for now): the rules are free, explainable
// ("held because: mentions 'curfew'"), and easy for an editor to tune.
// An LLM scorer can be added later as a second opinion on the "review"
// bucket — it should never be the thing that auto-publishes sensitive news.

import type { NormalizedNewsItem } from "./newsIngestion";

export type Decision = "publish" | "review" | "skip";

export interface Assessment {
  decision: Decision;
  score: number;
  categorySlug: string;
  reason: string;
}

// Terms that make a story specifically about Manipur. Community names are
// deliberately NOT here — they are sensitivity triggers (see below).
const MANIPUR_TERMS = [
  "manipur", "manipuri", "imphal", "bishnupur", "thoubal", "kakching", "churachandpur", "chandel",
  "ukhrul", "senapati", "tamenglong", "jiribam", "kangpokpi", "tengnoupal", "noney", "pherzawl",
  "kamjong", "moreh", "loktak", "sangai", "kangla", "keibul lamjao", "moirang", "lamphel",
  "tiddim road", "manipur university", "jnims", "rims imphal",
];

// Other states outside the Northeast. A headline led by one of these, with
// no Manipur term in it, is almost always a national story that only lists
// Manipur in passing (e.g. "Uttarakhand, UP, Punjab, Goa and Manipur").
const OTHER_STATE_TERMS = [
  "uttarakhand", "uttar pradesh", "punjab", "goa", "bihar", "kerala", "tamil nadu", "karnataka",
  "maharashtra", "gujarat", "rajasthan", "madhya pradesh", "west bengal", "odisha", "telangana",
  "andhra", "haryana", "himachal", "jharkhand", "chhattisgarh", "delhi", "jammu", "kashmir",
];

// Anything touching violence, security operations, communities, or
// shutdowns goes to a human. In Manipur a wrong auto-published line here
// can cause real harm, so this list is intentionally broad.
const SENSITIVE_TERMS = [
  "killed", "kill", "dead", "death", "died", "body", "bodies", "murder", "shot", "firing", "gunfight",
  "encounter", "ambush", "militant", "insurgent", "cadre", "extortion", "arson", "torched", "violence",
  "violent", "clash", "clashes", "riot", "mob", "curfew", "prohibitory", "section 144", "section 163",
  "internet", "suspended", "suspension", "law and order", "bandh", "blockade", "shutdown", "afspa",
  "displaced", "relief camp", "ethnic", "kuki", "meitei", "meetei", "naga", "zomi", "hmar", "zo ",
  "rape", "assault", "abduct", "kidnap", "hostage", "bomb", "ied", "grenade", "explosive", "arrested",
  "arrest", "security forces", "assam rifles", "crpf", "bsf", "army", "weapons", "arms", "looted",
  "protest", "agitation", "rumour", "rumor", "fake news", "president rule",
  // Matching is whole-word (plus a plural "s"), so other verb forms and
  // related words have to be listed explicitly.
  "killing", "killings", "dies", "casualty", "casualties", "attack", "attacked", "attacker", "gunman",
  "gunmen", "gun", "gunshot", "shooting", "shootout", "fired", "injured", "injuries", "wounded",
  "ablaze", "burnt", "burned", "torch", "drone", "rocket", "abducted", "abduction", "kidnapped",
  "kidnapping", "lynch", "lynched", "missing", "tension", "tense", "unrest", "conflict", "terror",
  "communal", "tribal", "fled", "flee", "refugee", "myanmar", "border fencing", "free movement regime",
  "drugs", "narcotics", "poppy", "seized", "recovered", "combing", "search operation", "suicide",
];

const CATEGORY_RULES: { slug: string; terms: string[] }[] = [
  { slug: "sports", terms: ["football", "cricket", "boxing", "weightlifting", "hockey", "polo", "olympic", "tournament", "championship", "medal", "league", "match", "athlete"] },
  { slug: "politics", terms: ["assembly", "chief minister", "minister", "governor", "election", "bjp", "congress", "mla", "mp ", "cabinet", "lok sabha", "rajya sabha", "party", "government", "policy"] },
  { slug: "education", terms: ["exam", "school", "university", "college", "student", "cbse", "board result", "neet", "jee", "scholarship"] },
  { slug: "culture", terms: ["festival", "sangai", "lai haraoba", "ras leela", "yaoshang", "ningol chakouba", "cheiraoba", "dance", "heritage", "handloom", "film", "music"] },
  { slug: "business", terms: ["business", "trade", "market", "price", "bank", "startup", "investment", "economy", "budget", "tourism"] },
];

const PUBLISH_THRESHOLD = 6; // a Manipur term in the headline
const REVIEW_THRESHOLD = 3;  // Manipur only in the summary: let an editor decide

function norm(text: string): string {
  // Drop possessives so "Manipur's" matches "manipur".
  const lower = text.toLowerCase().replace(/[’']s\b/g, "");
  return ` ${lower.replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ")} `;
}

function has(haystack: string, term: string): boolean {
  // Word-boundary-ish match on the normalized, space-padded string.
  return haystack.includes(` ${term.trim()} `) || haystack.includes(` ${term.trim()}s `);
}

function matches(haystack: string, terms: string[]): string[] {
  return terms.filter((t) => has(haystack, t));
}

export function assessItem(item: NormalizedNewsItem): Assessment {
  const title = norm(item.title);
  const body = norm(item.excerpt);
  const all = `${title}${body}`;

  const titleManipur = matches(title, MANIPUR_TERMS);
  const bodyManipur = matches(body, MANIPUR_TERMS).filter((t) => !titleManipur.includes(t));
  const titleOtherState = matches(title, OTHER_STATE_TERMS);

  let score = 0;
  if (titleManipur.length > 0) score += 6 + Math.min(titleManipur.length - 1, 2);
  score += Math.min(bodyManipur.length, 2) * 3;
  if (has(all, "northeast") || has(all, "north east")) score += 1;
  if (titleOtherState.length > 0 && titleManipur.length === 0) score -= 4;

  const categorySlug = guessCategory(title, all);

  if (score < REVIEW_THRESHOLD) {
    return { decision: "skip", score, categorySlug, reason: "Not about Manipur" };
  }

  const sensitive = matches(all, SENSITIVE_TERMS);
  if (sensitive.length > 0) {
    return {
      decision: "review",
      score,
      categorySlug,
      reason: `Sensitive topic — needs an editor (${sensitive.slice(0, 3).map((s) => s.trim()).join(", ")})`,
    };
  }

  if (score < PUBLISH_THRESHOLD || titleManipur.length === 0) {
    return { decision: "review", score, categorySlug, reason: "Manipur only mentioned in passing — check relevance" };
  }

  // "Uttarakhand, UP, Punjab, Goa and Manipur …" names Manipur in the
  // headline but is a national story; an editor decides if it belongs.
  if (titleOtherState.length > 0) {
    return { decision: "review", score, categorySlug, reason: "Headline names other states too — check relevance" };
  }

  return { decision: "publish", score, categorySlug, reason: "Auto-published: Manipur story, no sensitive terms" };
}

function guessCategory(title: string, all: string): string {
  for (const rule of CATEGORY_RULES) {
    if (matches(title, rule.terms).length > 0) return rule.slug;
  }
  for (const rule of CATEGORY_RULES) {
    if (matches(all, rule.terms).length >= 2) return rule.slug;
  }
  return has(title, "imphal") ? "imphal" : "manipur";
}

// ---- Duplicate detection -------------------------------------------------

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "in", "on", "for", "to", "at", "by", "with", "from", "as", "is",
  "are", "was", "were", "be", "after", "over", "amid", "into", "its", "it", "this", "that", "news",
  "india", "says", "said", "new",
]);

export function titleTokens(title: string): Set<string> {
  return new Set(
    norm(title)
      .split(" ")
      .filter((w) => w.length > 2 && !STOPWORDS.has(w))
  );
}

export function similarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const w of a) if (b.has(w)) shared++;
  return shared / (a.size + b.size - shared);
}

/** Same story from a second outlet ("India News | Congress Appoints…" vs "Congress revamps…"). */
export const DUPLICATE_THRESHOLD = 0.5;

export function isDuplicate(tokens: Set<string>, recent: Set<string>[]): boolean {
  return recent.some((other) => similarity(tokens, other) >= DUPLICATE_THRESHOLD);
}
