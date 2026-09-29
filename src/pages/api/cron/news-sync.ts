// Scheduled entry point for the news autopilot. The site is deployed as a
// Cloudflare Pages project, which has no cron triggers, so a GitHub Actions
// schedule (.github/workflows/news-sync.yml) POSTs here instead.
//
// Auth: `Authorization: Bearer <CRON_SECRET>`. Returns non-2xx when the run
// is unhealthy so the GitHub workflow fails and GitHub emails the owner —
// that's the alert that would have caught the month-long stall.

import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { hoursSinceLastPublish, runNewsSync, type SyncEnv } from "../../../lib/newsSync";

const STALE_AFTER_HOURS = 48;

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const POST: APIRoute = async ({ request }) => {
  const secret = (env as unknown as { CRON_SECRET?: string }).CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!secret || !token || !safeEqual(token, secret)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  try {
    const outcome = await runNewsSync(env as unknown as SyncEnv, "cron");
    const hours = await hoursSinceLastPublish(env.DB);
    const stale = hours === null || hours > STALE_AFTER_HOURS;
    const noProviders = outcome.providersRun.length === 0;
    const allFailed = !noProviders && outcome.providersFailed.length === outcome.providersRun.length;

    const body = {
      ...outcome,
      hoursSinceLastPublish: hours === null ? null : Math.round(hours),
      stale,
      problems: [
        noProviders && "No provider API keys configured",
        allFailed && "Every provider failed",
        stale && `Nothing published in over ${STALE_AFTER_HOURS}h`,
      ].filter(Boolean),
    };
    const status = noProviders || allFailed ? 502 : stale ? 503 : 200;
    return new Response(JSON.stringify(body, null, 2), {
      status,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), { status: 500 });
  }
};
