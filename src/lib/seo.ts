// Shared helpers for page titles and descriptions.

export const SITE_NAME = "SQL Dojo";

/**
 * The live site's address, used to build absolute links in link previews.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://sqldojo.in).
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

/** Turns content markup (`code`, **bold**, blank lines) into plain text for meta tags. */
export function plainText(text: string) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Search engines show about 155 characters; cut at a word boundary. */
export function truncate(text: string, max = 155) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s.,;:!?-]+$/, "")}…`;
}
