/// <reference types="astro/client" />

// Secrets set via `wrangler secret put` don't appear in wrangler.jsonc (by
// design — that's what keeps them out of source control), so they aren't
// picked up by `wrangler types`. Declared here instead, merged into the
// ambient Env interface from worker-configuration.d.ts.
interface Env {
  NEWS_API_KEY?: string;
}

declare namespace App {
  interface SessionData {
    userId: number;
    userEmail: string;
  }
}
