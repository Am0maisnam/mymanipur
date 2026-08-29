import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/setup"];

function buildCsp(adsenseEnabled: boolean): string {
  const adsSources = adsenseEnabled
    ? " https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com"
    : "";
  // Ad Traffic Quality (fraud/invalid-traffic detection) — a separate domain
  // from the ad-serving ones above, and it both loads a script and makes
  // its own network requests, so it's needed in both script-src and
  // connect-src.
  const adTrafficQuality = adsenseEnabled ? " https://*.adtrafficquality.google" : "";
  // AdSense creates workers from blob: URLs for some ad rendering; without
  // an explicit worker-src, browsers fall back to script-src for that check.
  const workerSrc = adsenseEnabled ? " blob:" : "";

  // Cloudflare auto-injects its own Web Analytics beacon on zones/custom
  // domains (not present on the plain workers.dev URL), unrelated to ads.
  const cloudflareInsights = " https://static.cloudflareinsights.com";

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${adsSources}${adTrafficQuality}${workerSrc}${cloudflareInsights}`,
    `worker-src 'self'${workerSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `img-src 'self' data:${adsSources}`,
    `connect-src 'self'${adsSources}${adTrafficQuality}${cloudflareInsights}`,
    `frame-src 'self'${adsSources}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (pathname.startsWith("/admin") && !PUBLIC_ADMIN_PATHS.includes(pathname)) {
    const userId = await context.session?.get("userId");
    if (!userId) {
      return context.redirect("/admin/login");
    }
  }

  const response = await next();

  // Baseline security headers on every response.
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Content-Security-Policy", buildCsp(Boolean(env.ADSENSE_CLIENT_ID as string)));

  return response;
});
