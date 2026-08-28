import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { createMedia } from "../../lib/media";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const POST: APIRoute = async ({ request, session }) => {
  const userId = await session?.get("userId");
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return new Response(JSON.stringify({ error: "Only JPEG, PNG, WebP, and GIF images are allowed" }), {
      status: 400,
    });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return new Response(JSON.stringify({ error: "File is too large (5MB max)" }), { status: 400 });
  }

  const ext = EXTENSION_BY_TYPE[file.type];
  const key = `articles/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  await env.MEDIA.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  await createMedia(env.DB, key, null, userId as number);

  return new Response(JSON.stringify({ url: `/media/${key}` }), {
    headers: { "Content-Type": "application/json" },
  });
};
