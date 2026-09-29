// Direct RSS/Atom feeds from outlets that cover Manipur. Free, no API key,
// no daily quota, and usually faster and more local than the news APIs.
//
// Before adding a feed: open the URL and confirm it returns RSS/Atom XML,
// and check the outlet's terms/robots.txt allow headline + summary + link
// reuse. Only headline, a short excerpt and the link are ever stored.
// Add the outlet's domain to TRUSTED_DOMAINS in ../newsRelevance.ts only if
// you are comfortable auto-publishing its reporting on sensitive events.

export interface RssFeed {
  /** Shown as "Source: …" on the article page. */
  name: string;
  url: string;
}

export const RSS_FEEDS: RssFeed[] = [
  // { name: "Imphal Free Press", url: "https://www.ifp.co.in/feed" },   // verify URL first
];
