# FinanceLens AI

**Financial document intelligence. Plain language. Drift detection. One-click Canva decks.**

Built by Hannah Kraulik Pagade · [hannahkraulikpagade.com](https://hannahkraulikpagade.com)

---

## What it does

Paste or upload a financial document and FinanceLens returns five structured intelligence sections:

| Section | What you get |
|---|---|
| **What they said** | The official narrative in plain English, jargon removed |
| **What it actually means** | Interpretation with spin stripped out |
| **Key numbers explained** | Metrics with direction of change and context |
| **Language drift signals** | Where management shifted from definitive to hedging language |
| **Worth a closer look** | Buried risks, undisclosed figures, claim confidence scoring |

**Supported document types:**
- Earnings call transcripts
- 10-K annual filings
- Regulatory notices

**Compare mode:** Paste two documents side by side — Q3 vs Q4, or two competitors — and get a diff of what changed, what disappeared, and what new language appeared.

**Generate Canva deck:** One click converts the full analysis into a branded, shareable presentation deck via the Canva API. Ready to share with a board, a team, or an investor.

---

## Why this exists

Executives write earnings calls to communicate selectively. The language is deliberate. "We believe we are well-positioned" is not the same as "we are confident we will deliver." Most retail investors and non-finance professionals miss those shifts entirely.

FinanceLens surfaces what the language is actually signaling — not just what it says.

---

## Design system — WSJ Editorial

FinanceLens is the only light-background product in the Rohimaya portfolio. The WSJ Editorial system was designed to read like a financial newspaper crossed with a research report.

| Token | Value |
|---|---|
| Background | `#FAFAF7` warm cream |
| Primary text | `#1C1C1E` deep ink |
| Signal red (flags, negatives) | `#C0392B` |
| Positive indicators | `#1A7A3C` |
| Drift hedge signal | `#9A6B00` amber |
| Typography | Georgia serif (headings) + IBM Plex Mono (data) |

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI | Claude API (claude-sonnet-4-20250514) |
| Presentation | Canva API (branded deck generation) |
| Storage | Supabase (share URLs, analysis history) |
| Deployment | Vercel |

---

## Getting started

```bash
git clone https://github.com/rohimayaventures/financelens-ai.git
cd financelens-ai
npm install
```

Create `.env.local`:

```bash
ANTHROPIC_API_KEY=your_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
CANVA_API_TOKEN=your_canva_token_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

`UNSPLASH_ACCESS_KEY` is the Unsplash **Access Key** (Client ID). It powers stock photography in briefing decks. Without it, decks still work using optional abstract image prompts as a fallback.

Optional analysis tuning (all default sensibly if unset):

- `ANTHROPIC_ANALYZE_MODEL` — override the default Sonnet model id for **standard** (non-fast) runs.
- `ANTHROPIC_ANALYZE_MODEL_FAST` — override the default Haiku model id when **Faster model** is on (default `claude-3-5-haiku-20241022`).
- `ANTHROPIC_ANALYZE_MAX_TOKENS` / `ANTHROPIC_ANALYZE_MAX_TOKENS_FAST` — max output tokens (defaults 3072 / 2048, capped for safety).

The analyze API route sets `maxDuration` to 120s so Vercel Pro (or similar) can finish long Claude calls; Hobby plans may still enforce shorter limits.

Run locally:

```bash
npm run dev
```

Open `http://localhost:3000`

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/analyze` | Document input and five-section analysis output |
| `/compare` | Two-document comparison mode |
| `/methodology` | How the product works: LLMs, validation, decks, imagery |
| `/api/analyze` | Claude analysis route — returns structured JSON |
| `/api/slides` | Slide content formatter for Canva generation |
| `/api/canva` | Canva deck generation via Canva API |
| `/api/compare` | Cross-document diff and change detection |

---

## API architecture

**`/api/analyze`**
Accepts document text and document type. Returns structured JSON with five sections. Document type selector adjusts Claude's reasoning logic — an earnings call is analyzed differently from a 10-K.

**`/api/slides`**
Takes the five-section analysis and structures it into seven slide outlines: title, executive summary, interpretation, key metrics, language drift, flags, and source reference.

**`/api/canva`**
Calls the Canva API with slide content and brand kit ID. Returns a candidate design, then calls `create-design-from-candidate` to generate an editable, shareable Canva presentation link.

**`/api/compare`**
Accepts two documents. Returns a structured diff: what changed, what was dropped, what new language appeared, and how the overall claim confidence shifted between documents.

---

## Portfolio context

FinanceLens demonstrates AI document intelligence applied to financial services — the same architectural pattern as HealthLiteracy AI (clinical documents) extended to a completely different domain. Together they prove the pattern generalizes across industries and user types.

The Canva integration takes FinanceLens beyond document translation into end-to-end analyst workflow: ingest, analyze, present — replacing three hours of manual work in one product.

---

## Author

Hannah Kraulik Pagade
[hannahkraulikpagade.com](https://hannahkraulikpagade.com)
