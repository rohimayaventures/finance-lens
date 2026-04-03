/** Minimal HTML for deck share errors when returned from middleware (no App CSS bundle). */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type DeckShareLinkErrorKind = "not-found" | "gone";

export function deckShareLinkErrorDocument(homeUrl: string, kind: DeckShareLinkErrorKind): string {
  const safeHome = escapeHtml(homeUrl);
  const title =
    kind === "gone"
      ? "This shared deck has expired"
      : "This shared link was not found";
  const lead =
    kind === "gone"
      ? "Shared links last 30 days. Run a new analysis on FinanceLens to create a fresh link."
      : "Check the URL or run a new analysis on FinanceLens to create a new share link.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} — FinanceLens</title>
  <style>
    :root { color-scheme: light dark; }
    body { margin: 0; min-height: 100vh; font-family: ui-sans-serif, system-ui, sans-serif; background: #0c0d10; color: #e8eaef; display: grid; place-items: center; padding: 2rem; }
    .box { max-width: 28rem; text-align: center; }
    h1 { font-size: 1.25rem; font-weight: 600; letter-spacing: 0.02em; margin: 0 0 0.75rem; }
    p { margin: 0 0 1.5rem; line-height: 1.55; color: #a8adb8; font-size: 0.95rem; }
    a { display: inline-block; padding: 0.55rem 1.1rem; border-radius: 0.35rem; background: #e8eaef; color: #0c0d10; text-decoration: none; font-weight: 600; font-size: 0.875rem; }
    a:hover { filter: brightness(1.05); }
  </style>
</head>
<body>
  <div class="box">
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(lead)}</p>
    <a href="${safeHome}">Back to FinanceLens AI</a>
  </div>
</body>
</html>`;
}
