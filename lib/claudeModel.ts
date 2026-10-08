/**
 * Claude Sonnet 4 (`claude-sonnet-4-20250514`) was retired on 2026-06-15.
 * Sonnet 4.6 is Anthropic's drop-in replacement and does not turn adaptive
 * thinking on unless the request asks for it, so JSON-only calls stay stable.
 */
export const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-6";

const RETIRED_MODELS = new Set([
  "claude-sonnet-4-20250514",
  "claude-sonnet-4-0",
  "claude-opus-4-20250514",
  "claude-opus-4-1-20250805",
  "claude-3-7-sonnet-20250219",
  "claude-3-5-haiku-20241022",
  "claude-3-haiku-20240307",
]);

/** Shared model for analyze, compare, and briefing. Retired env overrides are ignored. */
export function resolveClaudeModel(): string {
  const fromEnv =
    process.env.ANTHROPIC_MODEL?.trim() || process.env.ANTHROPIC_ANALYZE_MODEL?.trim() || "";
  if (fromEnv && !RETIRED_MODELS.has(fromEnv)) return fromEnv;
  return DEFAULT_CLAUDE_MODEL;
}
