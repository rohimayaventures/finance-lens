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

**Briefing deck (from results):** Claude builds a 7-slide outline; optional **Unsplash** photos (with `UNSPLASH_ACCESS_KEY`) or abstract image fallback; **download .pptx** and **full-screen** presenter view at `/briefing/deck`.

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
| AI | Claude (Sonnet / Haiku via env & “Faster model” toggle) |
| Validation | Zod + one-shot JSON repair retry |
| Deck file | pptxgenjs (client) |
| PDF | pdf-lib (API route) |
| Deployment | Vercel |

`@supabase/supabase-js` is in `package.json` for future use; **there is no Supabase integration in the app code yet**.

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
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

`UNSPLASH_ACCESS_KEY` (Unsplash **Access Key**) powers stock photos in briefing slides. Without it, optional abstract image URLs are still used when the model emits prompts.

Optional analysis tuning:

- `ANTHROPIC_ANALYZE_MODEL` / `ANTHROPIC_ANALYZE_MODEL_FAST`
- `ANTHROPIC_ANALYZE_MAX_TOKENS` / `ANTHROPIC_ANALYZE_MAX_TOKENS_FAST`

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
| `/briefing/deck` | Full-screen slides (after opening from results) |
| `/api/analyze` | Structured analysis JSON |
| `/api/compare` | Compare JSON |
| `/api/canva` | Briefing deck JSON + resolved slide images (name is legacy) |
| `/api/export-pdf` | Branded PDF |
| `/api/parse-pdf` | Server PDF text (optional; analyze UI upload still uses a simple client decode — prefer paste for reliability) |

---

## Portfolio / case study

See **`FINANCELENS-AI-CASE-STUDY.md`** for portfolio-ready narrative, accurate architecture, and a **works / doesn’t / needs improvement** matrix.

---

## Author

Hannah Kraulik Pagade · [hannahkraulikpagade.com](https://hannahkraulikpagade.com)
