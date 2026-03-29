/** Base URL for share links (no trailing slash). */
export function getPublicAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://financelens-ai.vercel.app";
  return raw.replace(/\/+$/, "");
}

export function deckShareUrl(slug: string): string {
  return `${getPublicAppUrl()}/deck/${slug}`;
}
