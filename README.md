# FinanceLens AI

**Financial document intelligence. Plain language. Drift detection. Shareable PDF and briefing exports.**

Built by Hannah Kraulik Pagade · [hannahkraulikpagade.com](https://hannahkraulikpagade.com)

---

## What it does

Paste a financial document and FinanceLens returns structured intelligence:

| Section | What you get |
|---|---|
| **What they said** | Plain English, jargon stripped |
| **What it actually means** | Interpretation with spin removed |
| **Key numbers** | Metrics with direction and context |
| **Language drift** | Hedging vs firmer language, with quotes |
| **Worth a closer look** | Flags with evidence-oriented framing |
| **Source anchors** | Short excerpts from your paste (verify in the filing) |

**Supported document types:** earnings call, 10-K, regulatory notice (each uses a different Claude prompt).

**Compare mode:** Two documents side by side — new language, dropped language, confidence per doc, claim shifts.

**Briefing deck (from results):** Claude builds a 7-slide outline; optional **Unsplash** photos (with `UNSPLASH_ACCESS_KEY`) or abstract image fallback; **download .pptx**, **shareable `/deck/[slug]` URLs** (Supabase), and full-screen presenter view on that page.

**Share as PDF:** Branded PDF export of the full analysis (`/api/export-pdf`).

**Methodology:** `/methodology` explains models, confidence, imagery, and limitations.

---

## Design system — WSJ Editorial

| Token | Value |
|---|---|
| Background | `#FAFAF7` warm cream |
| Primary text | `#1C1C1E` deep ink |
| Signal red | `#C0392B` |
| Positive | `#1A7A3C` |
| Drift hedge | `#9A6B00` amber |
| Typography | Georgia + IBM Plex Mono |

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI | Claude Sonnet 4 (`claude-sonnet-4-20250514` for analyze/compare; override via env) |
| Validation | Zod + one-shot JSON repair retry |
| Deck file | pptxgenjs (client) |
| PDF | pdf-lib (API route) |
| Shares | Supabase (`financelens_sessions`) + `nanoid` slugs |
| Deployment | Vercel |

**Supabase:** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` persist analysis and briefing decks for **30-day** share links (`/deck/[slug]`). Row access depends on your RLS policies (insert + read by `share_slug`).

---

## Getting started

```bash
git clone https://github.com/rohimayaventures/finance-lens.git
cd finance-lens
npm install
```

Create `.env.local`:

```bash
ANTHROPIC_API_KEY=your_key_here
NEXT_PUBLIC_SITE_URL=https://financelens-ai.vercel.app
NEXT_PUBLIC_APP_URL=https://financelens-ai.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

`UNSPLASH_ACCESS_KEY` (Unsplash **Access Key**) powers stock photos in briefing slides. Without it, optional abstract image URLs are still used when the model emits prompts.

`NEXT_PUBLIC_SITE_URL` is the canonical site origin for `metadataBase` / Open Graph (falls back to Vercel URL detection in `app/layout.tsx` when unset). `NEXT_PUBLIC_APP_URL` is used for share links and public deck URLs.

Optional analysis tuning:

- `ANTHROPIC_ANALYZE_MODEL` (default Sonnet 4)
- `ANTHROPIC_ANALYZE_MAX_TOKENS`

The analyze route sets `maxDuration` to **120s**; **Vercel Hobby** may still cap execution time lower than that.

```bash
npm run dev
```

Open `http://localhost:3000`

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing |
| `/analyze` | Input + run analysis |
| `/results` | Report, briefing, PDF |
| `/compare` | Two-document compare |
| `/methodology` | Trust, limits, how it works |
| `/deck/[slug]` | Shared briefing deck or analysis (scroll + full-screen) |
| `/api/analyze` | Structured analysis JSON (+ optional `shareSlug`) |
| `/api/compare` | Compare JSON |
| `/api/briefing` | Briefing deck JSON + resolved slide images + share URL |
| `/api/export-pdf` | Branded PDF |
| `/api/parse-pdf` | PDF text extraction for analyze uploads (`pdf-parse`; truncates at 15k chars) |

---

## Portfolio / case study

See **`FINANCELENS-AI-CASE-STUDY.md`** for portfolio-ready narrative, accurate architecture, and a **works / doesn’t / needs improvement** matrix.

---

## Author

Hannah Kraulik Pagade · [hannahkraulikpagade.com](https://hannahkraulikpagade.com)
