/**
 * Turn an AI-authored image prompt into a fetchable image URL (no API key).
 * Swappable for OpenAI / Replicate / etc. later via env if needed.
 */

const POLLINATIONS = "https://image.pollinations.ai/prompt";

export function sanitizeBriefingImageUrl(raw: string | undefined): string | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("https://")) return undefined;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "https:") return undefined;
    return u.href;
  } catch {
    return undefined;
  }
}

/** Stable seed so the same slide index + title doesn’t churn on every refresh. */
export function pollinationsImageUrl(prompt: string, seedKey: string): string {
  const text = prompt.trim().slice(0, 320);
  let seed = 0;
  for (let i = 0; i < seedKey.length; i++) {
    seed = (seed * 31 + seedKey.charCodeAt(i)) >>> 0;
  }
  return `${POLLINATIONS}/${encodeURIComponent(text)}?width=1280&height=720&nologo=true&seed=${seed % 2147483647}`;
}
