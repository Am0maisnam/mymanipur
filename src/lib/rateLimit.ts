// Simple IP-based rate limiting for the admin login form, backed by a
// dedicated KV namespace (kept separate from Astro's own session KV).

const WINDOW_SECONDS = 15 * 60; // 15 minutes
const MAX_ATTEMPTS = 5;

export interface RateLimitStatus {
  allowed: boolean;
  retryAfterMinutes: number;
}

function keyFor(ip: string): string {
  return `login-attempts:${ip}`;
}

export async function checkLoginRateLimit(kv: KVNamespace, ip: string): Promise<RateLimitStatus> {
  const raw = await kv.get(keyFor(ip));
  const count = raw ? parseInt(raw, 10) : 0;
  return {
    allowed: count < MAX_ATTEMPTS,
    retryAfterMinutes: Math.ceil(WINDOW_SECONDS / 60),
  };
}

export async function recordFailedLogin(kv: KVNamespace, ip: string): Promise<void> {
  const key = keyFor(ip);
  const raw = await kv.get(key);
  const count = raw ? parseInt(raw, 10) : 0;
  await kv.put(key, String(count + 1), { expirationTtl: WINDOW_SECONDS });
}

export async function resetLoginRateLimit(kv: KVNamespace, ip: string): Promise<void> {
  await kv.delete(keyFor(ip));
}
