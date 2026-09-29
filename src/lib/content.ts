// Converts plain-text editor input (paragraphs separated by a blank line)
// into safe HTML. Escapes user input first — this is real admin-submitted
// content now, unlike the trusted seed data from earlier phases.

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&"); // last, so "&amp;lt;" decodes to "&lt;", not "<"
}

// Inverse of plainTextToHtml, for loading stored HTML back into the editor's
// plain-text textarea. Previously only <p>/<br> were stripped and entities
// were left escaped, so every save escaped the body one more time.
export function htmlToPlainText(html: string): string {
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<[^>]+>/g, "");
  return decodeHtmlEntities(withBreaks).trim();
}

export function plainTextToHtml(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

// JSON.stringify doesn't escape "</", so a title/excerpt containing the
// literal text "</script>" could break out of a <script> tag it's embedded
// in via set:html. This is the standard mitigation.
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
