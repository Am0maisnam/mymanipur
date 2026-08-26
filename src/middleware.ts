import { defineMiddleware } from "astro:middleware";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/setup"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (!pathname.startsWith("/admin")) {
    return next();
  }

  if (PUBLIC_ADMIN_PATHS.includes(pathname)) {
    return next();
  }

  const userId = await context.session?.get("userId");
  if (!userId) {
    return context.redirect("/admin/login");
  }

  return next();
});
