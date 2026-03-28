# FinanceLens AI — Portfolio Case Study Documentation
# Hannah Kraulik Pagade
# For use in portfolio at hannahkraulikpagade.com

**Last updated:** March 2026 (full repo sync)

---

## PROJECT METADATA

| Field | Value |
|--------|--------|
| **Project name** | FinanceLens AI |
| **Tagline** | Financial documents, in plain English. |
| **Status** | Live |
| **Primary URL** | financelens-ai.vercel.app |
| **Repo** | github.com/rohimayaventures/finance-lens |
| **Tags** | FINTECH · AI-PRODUCT · FULL-STACK · DOCUMENT-INTELLIGENCE |
| **Role** | Product design, prompt architecture, implementation |
| **Timeline** | 2026 |
| **Stack (actual)** | Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Claude API · pdf-lib · pptxgenjs · Zod · Vercel |

---

## SECTION 1 — THE PROBLEM

*(Unchanged in intent — still accurate.)*

Executives write earnings calls and filings to communicate selectively. The language is deliberate. Most readers lack tools to see **what the language is signaling**, not just what it says. Analysts also lose hours turning a read-through into something shareable (memo, deck, PDF).

---

## SECTION 2 — WHAT THE APP DOES TODAY (PRODUCT)

### Single-document analysis (`/analyze` → `/results`)

- **Input:** Paste text, or “upload” PDF (see limitations below).
- **Document types:** Earnings call, 10-K, regulatory notice — each steers a **different Claude system prompt** (tone, risks, obligations).
- **Output sections:**
  - **What they said** — plain-language translation, minimal interpretation.
  - **What it actually means** — interpretation with attribution phrasing.
  - **Key numbers** — values with labels and direction.
  - **Language drift** — `hedge` vs `firm` tags with quoted phrases.
  - **Worth a closer look** — flags with evidence-oriented copy.
  - **Source anchors** — `supportingEvidence`: short excerpts tied to the user’s paste (verify against primary docs).
- **Overall confidence score** — LLM-assigned 0–100 rubric on **evidence density in the excerpt** (not statistical confidence, not a stock prediction). Optional toggles: drift on/off, confidence on/off.
- **Faster model (Haiku)** — **On by default** for latency; optional **Sonnet** for deeper passes. Env overrides for model IDs and max output tokens.
- **Persistence:** Analysis lives in **`sessionStorage`** until the tab session ends (no logged-in “history” in-app).

### Compare mode (`/compare`)

- Two documents (A = earlier, B = later), same doc-type framing as analyze.
- **One Claude call** returns structured JSON: overview, new/dropped language, per-doc confidence, claim shifts, metrics narrative.
- **Six sample pairs** (preset buttons + optional `?pair=id`) for instant demos (earnings, 10-K, regulatory, retail Y/Y, cyber 10-K, Wells → settlement).
- **No** briefing deck, PDF export, or persistence — results stay on the page.

### Briefing deck (from **results** only)

- **Not** driven by the Canva Create API. **`/api/canva`** is a misnamed route: Claude builds a **7-slide JSON outline**; the server resolves images:
  - **`UNSPLASH_ACCESS_KEY` set:** `imageSearchQuery` → Unsplash search (landscape), **attribution** + download ping per guidelines.
  - **Else:** optional **`imagePrompt`** → Pollinations URL (abstract imagery).
  - Optional **`https` `imageUrl`** if ever supplied in JSON (no invented URLs).
- **UI:** Modal preview → **Download PowerPoint (.pptx)** (client `pptxgenjs`, blob download after async image fetch) → **Open full-screen slides** (`/briefing/deck`).
- **Cross-tab fix:** Deck payload is written to **`localStorage`** before `window.open`, because **`sessionStorage` is per-tab** (new tab could not see the deck otherwise).
- Optional **“Polish in Canva”** link opens Canva’s generic new-presentation URL — not an automated Canva design.

### Share as PDF (`/api/export-pdf`)

- **Branded PDF** via **pdf-lib** (Node runtime): FinanceLens wordmark, red rule, token colors, all report sections + footers + disclaimer.
- Triggered from results sidebar **“Share as PDF →”**.

### Trust & documentation

- **`/methodology`** — how LLMs are used, confidence meaning, decks/images, JSON validation retries, storage, disclaimer.
- **Zod + retry** — analyze, compare, and briefing routes use **`claudeJsonWithRetry`**: one repair turn if JSON is invalid or fails schema validation.

### Landing & shell

- Premium landing (Fraunces, ambient orbs, `fl-lp-*` tokens).
- App shell (`fl-app-*`): analyze, results, compare — sidebar, TOC / scroll-spy on results, print-oriented styles, accessibility (skip links, focus, modals).

### Server utilities present but not wired to analyze UI

- **`/api/parse-pdf`** — server-side PDF text extraction (`pdf-parse`). The **analyze** page upload path still uses **in-browser** `TextDecoder` on the raw file, which **does not** reliably extract PDF text. The API exists for a future wire-up.

### Dependencies noted in README but not used in code

- **`@supabase/supabase-js`** is listed in `package.json` but **there is no Supabase usage** in the repo (no share URLs, no saved analyses).

---

## SECTION 3 — TECHNICAL ARCHITECTURE (ACCURATE)

| Piece | Implementation |
|--------|----------------|
| Framework | Next.js **16** App Router |
| AI | Anthropic SDK, **`claude-sonnet-4-20250514`** (analyze/compare/briefing when not in fast mode), **`claude-3-5-haiku-20241022`** default for fast analyze |
| Validation | **Zod** schemas; **`lib/claudeJsonWithRetry.ts`** |
| Deck file | **pptxgenjs** (browser) |
| PDF | **pdf-lib** (`/api/export-pdf`, `nodejs`, `maxDuration` 60s) |
| Images | **Unsplash API** + **Pollinations** image URLs |
| Env | `ANTHROPIC_API_KEY`, optional `UNSPLASH_ACCESS_KEY`, optional `ANTHROPIC_ANALYZE_*` tuning |
| Deploy | Vercel; analyze route **`maxDuration` 120s** (requires plan that allows it) |

**Routes (actual):** `/`, `/analyze`, `/results`, `/compare`, `/methodology`, `/briefing/deck`, `/api/analyze`, `/api/compare`, `/api/canva`, `/api/export-pdf`, `/api/parse-pdf`.  
There is **no** `/api/slides` in this repo (README is outdated).

---

## SECTION 4 — STATUS MATRIX: WORKS / DOESN’T / NEEDS IMPROVEMENT

### What works well

- **Paste → analyze → results** with typed JSON, guardrail phrasing, and optional fast model.
- **Compare** for two pasted texts with clear A→B framing and sample pairs.
- **Briefing modal** with slide outline, **PPTX download** (blob path), **full-screen deck** when **localStorage** handoff + pop-ups behave.
- **Branded PDF export** from results with consistent FinanceLens identity.
- **Methodology** page and in-product hints on confidence and evidence.
- **Schema + retry** reduces brittle empty failures from malformed model JSON.
- **Design system** cohesion across landing and app surfaces.

### What doesn’t work reliably (or is misleading)

- **PDF upload on analyze:** Client decodes PDF as UTF-8 text — **not real PDF parsing** for most files; users see garbage or empty content unless wired to **`/api/parse-pdf`** (or drag-drop uses paste).
- **README / old case study claims:** “Canva API” deck generation, **Supabase** session/share URLs, **`/api/slides`**, Next 15 — **do not match** the codebase.
- **Vercel Hobby:** **Short function timeouts** can still kill long Sonnet runs despite `maxDuration` on Pro.
- **Deck images in PPTX:** Remote images require **CORS-friendly** URLs; some providers may fail fetch → text-only slide for that asset.
- **Pollinations / Unsplash:** Third-party availability, rate limits, and changing URLs — **no** SLA in the product layer.

### What works but needs improvement

- **Confidence scores** — useful as a **rough rubric**; not calibrated across models or document types; could use clearer UI copy + optional hiding.
- **Source anchors** — depend on model faithfulness to the paste; no automated fuzzy match to source offsets.
- **Briefing** — seven-slide structure is fixed; no user edit pass before export; Canva link is **manual** polish only.
- **Compare** — no PDF export, no deck, no saved runs; parity with “share” workflow would help.
- **Observability** — no structured logging/metrics for latency, token use, or failure classes in-app.
- **Rate limiting / abuse** — not implemented on API routes.
- **Streaming** — analyze still waits for full JSON; UX could stream status or partial sections later.
- **Rename `/api/canva`** — reduces confusion (e.g. `/api/briefing`).

---

## SECTION 5 — PORTFOLIO COPY (REFRESHED)

### Key outcome (updated)

Structured financial intelligence (plain language, drift, flags, **source anchors**, confidence rubric), **two-document compare**, **branded PDF share**, **LLM-built briefing decks** with **Unsplash/Pollinations imagery** and **PPTX + full-screen presenter view**, **methodology** and **validated JSON pipelines** — assistive-only, not advice.

### Card summary

Earnings calls, 10-Ks, regulatory text → structured analysis, compare, shareable PDF, and exportable slides — with explicit trust framing.

### One honest line for interviews

The product **closes the loop from document to shareable artifact** (PDF + slides) using **Claude + validation + server/client export** — not a thin summarizer — and the case study should match **what’s actually wired**, including PDF upload and README gaps called out as known follow-ups.

---

## SECTION 6 — CHANGE LOG (HIGH LEVEL, REPO-ALIGNED)

- Replaced Canva-native deck generation with **Claude JSON outlines**, **pptxgenjs**, **full-screen deck**, optional **Unsplash** + **Pollinations** images; **localStorage** for new-tab deck.
- Added **`supportingEvidence`**, **methodology** route, **Zod + retry**, **fast Haiku** path, **`maxDuration`** on analyze.
- Added **`/api/export-pdf`** and **Share as PDF** with **pdf-lib** branding.
- Expanded **compare** samples and **confidence** copy; fixed TOC/scroll behavior on results.
- Fixed **PPTX** download via **blob + anchor** after async image fetches.

---

*Case study revised March 2026 to reflect github.com/rohimayaventures/finance-lens.*
