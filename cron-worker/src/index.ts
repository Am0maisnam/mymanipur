// Calls the site's sync endpoint every 30 minutes (see wrangler.jsonc).
// Logs the result; a non-2xx is thrown so it shows as a failed invocation
// in the Cloudflare dashboard (Workers > mymanipur-cron > Logs).

interface Env {
  SYNC_URL: string;
  CRON_SECRET: string;
}

async function runSync(env: Env): Promise<Response> {
  return fetch(env.SYNC_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.CRON_SECRET}`,
      "content-type": "application/json",
    },
    body: "{}",
  });
}

export default {
  async scheduled(_event: ScheduledController, env: Env): Promise<void> {
    const res = await runSync(env);
    const body = await res.text();
    console.log(`news-sync HTTP ${res.status}: ${body.slice(0, 1500)}`);
    if (!res.ok) throw new Error(`news-sync failed with HTTP ${res.status}`);
  },

  // Manual check: GET https://mymanipur-cron.<account>.workers.dev/ with the
  // same Bearer token triggers one run and returns the site's JSON.
  async fetch(request: Request, env: Env): Promise<Response> {
    const auth = request.headers.get("authorization") ?? "";
    if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
      return new Response("Not found", { status: 404 });
    }
    const res = await runSync(env);
    return new Response(await res.text(), { status: res.status, headers: { "content-type": "application/json" } });
  },
} satisfies ExportedHandler<Env>;
