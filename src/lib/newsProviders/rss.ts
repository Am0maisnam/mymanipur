import type { NewsProvider, NormalizedNewsItem } from "../newsIngestion";
import { RSS_FEEDS, type RssFeed } from "./rssFeeds";

// Minimal RSS 2.0 / Atom parser. Workers have no DOMParser, and feeds are
// small and regular enough that tag extraction is reliable.

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  if (!m) return "";
  return m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1").trim();
}

function atomLink(block: string): string {
  const alt = block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i);
  if (alt) return alt[1];
  const any = block.match(/<link[^>]*href=["']([^"']+)["']/i);
  return any ? any[1] : "";
}

function toIso(date: string): string {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export function parseFeed(xml: string, feed: RssFeed): NormalizedNewsItem[] {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  return items
    .map((block) => {
      const link = tag(block, "link") || atomLink(block);
      const guid = tag(block, "guid") || tag(block, "id") || link;
      return {
        title: tag(block, "title"),
        // Excerpt is cleaned (HTML stripped, length capped) during ingestion.
        excerpt: tag(block, "description") || tag(block, "summary"),
        sourceName: feed.name,
        sourceUrl: link,
        externalId: guid,
        imageUrl: null,
        publishedAt: toIso(tag(block, "pubDate") || tag(block, "published") || tag(block, "updated")),
      };
    })
    .filter((i) => i.title && /^https?:\/\//.test(i.sourceUrl))
    .slice(0, 20);
}

export const rssProvider: NewsProvider = {
  name: "RSS feeds",

  async fetchLatest(): Promise<NormalizedNewsItem[]> {
    const results = await Promise.allSettled(
      RSS_FEEDS.map(async (feed) => {
        const res = await fetch(feed.url, {
          headers: { "user-agent": "MyManipurBot/1.0 (+https://mymanipur.com)", accept: "application/rss+xml, application/atom+xml, text/xml" },
        });
        if (!res.ok) throw new Error(`${feed.name}: HTTP ${res.status}`);
        return parseFeed(await res.text(), feed);
      })
    );
    const items = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
    const failures = results.filter((r) => r.status === "rejected");
    // Only fail the provider if every feed failed; one dead feed shouldn't stop the rest.
    if (items.length === 0 && failures.length > 0) {
      throw new Error(failures.map((f) => (f as PromiseRejectedResult).reason?.message ?? "feed failed").join("; "));
    }
    return items;
  },
};
