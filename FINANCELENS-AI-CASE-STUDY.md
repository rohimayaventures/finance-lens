# FINANCELENS AI — CASE STUDY

*Reference document. Does not render on site. All visitor-facing content lives in caseStudies.ts.*
*Case study updated April 2026. Hannah Kraulik Pagade, Rohimaya Health AI.*

---

## PROJECT METADATA

| Field | Value |
|---|---|
| **Product name** | FinanceLens AI |
| **Tagline** | Financial documents, in plain English. |
| **Status** | Live |
| **Primary URL** | https://financelens-ai.vercel.app |
| **Repo** | github.com/rohimayaventures/finance-lens |
| **Tags** | FINTECH · AI-PRODUCT · FULL-STACK · DOCUMENT-INTELLIGENCE |
| **Role** | Product design, prompt architecture, implementation |
| **Timeline** | 2026 |
| **Key outcome** | Structured financial document intelligence with six-section analysis, two-document compare mode, source anchoring, language drift detection, branded PDF share, PPTX export, and 30-day share URLs at a custom deck viewer |
| **Stack** | Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Claude API · Zod · pdf-lib · pptxgenjs · Supabase · Vercel |

---

## SECTION 1 — THE PROOF POINT

The shift from "we will deliver" to "we believe we are well positioned to deliver" is not a stylistic choice. It is information.

Management language in earnings calls and regulatory filings is deliberate. The hedge is not an accident. The passive construction is not laziness. These are decisions made by communications teams and legal counsel working together to say something technically accurate while signaling as little as possible about risk. Research has documented this pattern for decades. [1][3]

"Our revenue recognized under ASC 606 was consistent with prior-period recognition patterns, with deferred revenue balances reflecting enterprise customer prepayment cycles" is a sentence that means something specific. It means cash has come in but the company has not earned it yet under accounting rules. It also means management is normalizing a metric that a retail investor might otherwise read as a positive sign.

Most tools built to make financial documents accessible to non-institutional readers stop at translation. They remove complexity. They produce a shorter version of what was said. That is useful. It is not sufficient.

FinanceLens is built around a different thesis: intelligence reveals the complexity that deliberately simple language is designed to conceal. Not what was said. What it signals. Where the language drifted. What changed from last quarter. What deserves a closer look.

Translation is the minimum. Intelligence is the product.

---

## SECTION 2 — THE PROBLEM

### Financial documents are written for lawyers, not investors

Earnings call transcripts, 10-K filings, and regulatory notices are among the most consequential documents a company publishes. They contain the actual signal about where a business is going. But they are written in a technical register that assumes familiarity with accounting standards, legal framing, and financial terminology. A retail investor reading an earnings call transcript for the first time is receiving the same document as a portfolio manager with twenty years of experience. They are not receiving the same information.

The result is an information asymmetry that is structural, not accidental. The documents are public. The tools to understand them are not equally distributed.

Research on annual report readability has shown that less readable reports are associated with lower earnings persistence, and that managers of firms with more transitory earnings strategically choose less readable formats. [2] The 10-K filings of firms with worse performance tend to be written in more complex language. The complexity is not incidental. [2]

The SEC recognized this problem in 1998 with its Plain English Handbook, which set guidelines for disclosure document language that the financial industry has largely not followed at the document level. [5]

### Summarization is not intelligence

Most AI tools that target financial documents produce summaries. A summary tells you what the document said. It does not tell you what the document meant, what changed from last quarter, where management hedged language versus committed, or which numbers require a closer look.

Research on the "incomplete revelation hypothesis" in financial reporting shows that complex language in financial disclosures leads to incomplete processing by investors, which affects how efficiently prices incorporate available information. [4] The problem is not just accessibility. It is that the language complexity affects the market.

The product hypothesis for FinanceLens is that structured intelligence is a different and more valuable thing than summarization. Six analysis sections with distinct purposes. Each section is a different kind of analytical work. Together they give a reader a framework for thinking about the document, not just a shorter version of it.

### The compare mode thesis

The single most revealing thing you can do with an earnings call transcript is compare it to the previous one. "Consistent execution" in Q3 after "record performance" in Q2 is a story. "Headwinds in the enterprise segment" appearing for the first time after two quarters of silence is a story. FinanceLens supports two-document compare mode because the intelligence is in the delta, not just the document.

Research on language patterns in voluntary disclosures confirms that the shift in management's chosen phrasing across periods carries signal that isolated reading misses. [3]

---

## SECTION 3 — THE PROCESS

### The constraint set

**Structured intelligence, not summarization.**
The product brief was explicit: FinanceLens is not a summarizer. Every output section has a distinct analytical purpose. The Claude system prompt is architected to produce six structured sections in sequence, not a free-form summary with headers bolted on.

**Source anchors are non-negotiable.**
Every claim in the analysis must be tied to a specific passage in the source document. This is not a UX choice. It is a trust architecture decision. If a user cannot verify where a claim came from, they cannot trust the analysis. Source anchors make the tool verifiable, which is what makes it safe to act on.

**The WSJ Editorial light design system.**
FinanceLens uses a purpose-built design system: WSJ Editorial light. Clean white backgrounds, high-contrast typography, restrained use of accent color. The aesthetic is financial journalism, not consumer fintech. The choice signals that this tool is built for reading and analysis, not for transaction execution.

**Zod validation on all AI output.**
Every Claude API response passes through a Zod schema before rendering. If the response fails validation, a structured repair prompt fires before the error state surfaces. This prevents silent failures and partial renders, both of which would undermine trust in an analysis tool.

### The core architecture: six-section structured output

The Claude system prompt produces a typed JSON object with six defined sections. These are the actual section labels as they render in the product:

1. **What they said** — Plain-language translation with no interpretation. Clean enough that a communications team could have written it.
2. **What it actually means** — Interpretation with hedging removed. Not "the company noted challenges" but "revenue in this segment declined and management avoided specifying by how much."
3. **Key numbers** — Values with labels, direction of change, and context.
4. **Language drift** — hedge vs firm tags with quoted phrases from the document. The shift is the signal.
5. **Worth a closer look** — Flags with evidence-oriented copy, not opinions.
6. **Source anchors** — Short excerpts tied to the user's paste, supporting each interpretive claim.

Confidence score is a separate element with its own toggle. It is a 0-100 LLM-assigned rubric on evidence density in the excerpt, not a statistical prediction and not a stock recommendation. The methodology page explains this explicitly. The document type steers a different Claude system prompt: earnings call, 10-K, and regulatory notice each have distinct analytical framing covering tone, risk, and compliance language respectively.

### Design system: WSJ Editorial light

FinanceLens is the only light-background product in the portfolio. The WSJ Editorial design system was built to read like a financial newspaper crossed with an analyst research report.

| Token | Value | Usage |
|---|---|---|
| Background | `#FAFAF7` warm cream | All surfaces |
| Primary text | `#1C1C1E` deep ink | Body, headings |
| Signal red | `#C0392B` | Flags, negative indicators, logo accent |
| Positive | `#1A7A3C` forest | Upward metrics, firm language |
| Hedge amber | `#9A6B00` | Drift hedge signals |
| Typography | Georgia + IBM Plex Mono | Headings/wordmark + financial data and tags |

The choice to use a light background and serif typography makes FinanceLens immediately visually distinct from every other product in the portfolio and communicates the editorial, research-report register before a word is read.

### Image pipeline: Unsplash + Pollinations

Briefing decks include imagery resolved server-side. The pipeline: `imageSearchQuery` → Unsplash landscape search with attribution and download ping per API guidelines. Fallback: `imagePrompt` → Pollinations URL for abstract imagery when Unsplash returns no usable result. Images are fetched asynchronously during the PPTX generation step and embedded before the blob download triggers.

### Compare mode architecture

Two-document compare loads both transcripts and runs a diff-aware version of the analysis. The system prompt for compare mode instructs Claude to surface deltas: what was said in document A that was not said in document B, where language changed in tone or specificity, and what the shift may signal. The output renders as a side-by-side structure with delta cards highlighting the most significant changes.

### The pivot story: Canva API to owned presentation layer

The original product spec called for Canva Connect API as the presentation output. An investor would complete an analysis, click one button, and a branded Canva deck would generate at a shareable Canva URL.

During build, Canva's app review process blocked API access pending approval with no stated timeline. The dependency was real: without the Canva API, the core "analysis to shareable artifact" workflow loop could not close.

The architecture was redesigned from the ground up.

Instead of delegating the presentation layer to Canva, FinanceLens owns it entirely. Claude generates a structured JSON deck outline. pptxgenjs renders a downloadable PPTX from that outline. pdf-lib generates a branded PDF for sharing. A custom deck viewer at `/deck/[slug]` renders the full presentation inside the app using the WSJ Editorial design system, at a permanent Supabase-backed URL.

The result removed a third-party OAuth dependency, gave full control over the branded output format, and shipped faster than waiting for Canva approval would have allowed. The Canva integration remains on the roadmap as an additive output format, not a requirement for the core workflow to function.

**Lesson:** A third-party dependency on a feature that is not yet approved is a schedule risk that will materialize. Owning the layer eliminates the risk and often produces a better product. The custom deck viewer built for this pivot is a stronger portfolio artifact than a Canva embed would have been.

---

## SECTION 4 — WHAT SHIPPED

### Single-document analysis (`/analyze` → `/results`)

**Input:** Paste text or upload PDF. Text extraction via `/api/parse-pdf` (not OCR, scanned pages require paste). Document types: Earnings call, 10-K, Regulatory notice. Each type steers a different Claude system prompt.

**Six output sections (actual shipped labels):** What they said, What it actually means, Key numbers, Language drift (hedge/firm tags with quoted phrases), Worth a closer look, Source anchors. Confidence score as a separate toggleable element with a 0-100 LLM-assigned rubric on evidence density. Not a statistical prediction. Not a stock recommendation.

**Speed:** Haiku default for latency. Sonnet available for deeper passes.

**Persistence:** Results in sessionStorage for the tab session. Share analysis saves to Supabase and returns a share URL at `/deck/[slug]` with a 30-day TTL. Expiry is displayed in the viewer.

### Compare mode (`/compare`)

Two documents, same document-type framing. One Claude call returns structured JSON: overview of the period-over-period shift, new language in Document B, language dropped from Document A, claim shifts with direction indicators (firm to hedge or reverse), metrics narrative, dual confidence scores side by side. Six built-in sample pairs for instant demos. Share comparison saves to Supabase at a 30-day `/deck/[slug]` URL with a compare-specific A/B column layout. `maxDuration: 120` on the route prevents Vercel timeout on long paired pastes.

### Briefing deck (from results)

Claude builds a 7-slide JSON outline. Server resolves images: Unsplash Access Key lookup via `imageSearchQuery` with attribution and download ping per API guidelines. Fallback: `imagePrompt` → Pollinations URL for abstract imagery. UI: Modal preview → Download PowerPoint (`.pptx` via pptxgenjs, blob download after async image fetch) → Share deck (copies `/deck/[slug]` to clipboard) → Open full-screen slides.

### Shareable deck viewer (`/deck/[slug]`)

Any analysis, briefing deck, or comparison saved to Supabase is accessible at a share URL with a 30-day TTL. No login required. Works for any public user with the link.

**Scroll view (default):** Full-width WSJ Editorial cards, one per slide. Georgia headings, IBM Plex Mono for data. "Powered by FinanceLens AI" footer on every card. Expiry date shown at top.

**Full-screen view (toggle):** Fixed overlay, one slide at a time, keyboard arrow navigation, slide counter, ESC to exit. WSJ Editorial palette on near-black background.

Expired or missing slugs show a clean branded error state with a link back to the app.

### Branded PDF export (`/api/export-pdf`)

Branded PDF via pdf-lib (Node runtime): FinanceLens wordmark, red rule, WSJ Editorial token colors, all report sections with footers and disclaimer. Triggered from the results sidebar.

### Methodology and trust layer (`/methodology`)

Dedicated page explaining how Claude is used, what confidence scores mean, how deck images are sourced, JSON validation and retry logic, sessionStorage scope, and the assistive-only disclaimer. In-product hints on results and compare pages reinforce this framing at point of use.

### Validation layer (`lib/claudeJsonWithRetry.ts`)

All analyze, compare, and briefing routes use `claudeJsonWithRetry`: one repair turn if JSON is invalid or fails Zod schema validation. Reduces silent empty failures from malformed model output.

---

## SECTION 5 — TECHNICAL ARCHITECTURE

| Component | Decision | Rationale |
|---|---|---|
| Framework | Next.js 16 App Router, React 19 | Current production versions at build time. |
| AI model | claude-sonnet-4-20250514 (analyze/compare/briefing), claude-3-5-haiku-20241022 default for fast analyze | Haiku for latency on standard runs. Sonnet for deeper passes and compare mode. |
| Validation | Zod schemas + `lib/claudeJsonWithRetry.ts` | Silent failures in financial analysis are a trust problem. One repair turn on schema or JSON failure before error state surfaces. |
| Output contract | Fixed typed JSON schema, six sections | Each section has a distinct analytical purpose. Free-form output would collapse the structure that is the product. |
| Source anchors | Required field in Zod schema | If a claim cannot be sourced to a passage, it fails validation at the schema level. |
| Language drift | Hedge/firm tagging with quoted phrases | The shift in language is the signal. Tagged inline, not buried in prose. |
| Compare mode | Separate diff-aware system prompt | A standard analysis prompt applied to two documents produces two analyses. A diff-aware prompt produces the delta. These are architecturally different tasks. |
| Presentation layer | Owned: pptxgenjs + pdf-lib + custom `/deck/[slug]` viewer | Third-party Canva API dependency replaced after app review blocked access with no timeline. See pivot story. |
| Image pipeline | Unsplash API (primary) + Pollinations (fallback) | `imageSearchQuery` → Unsplash landscape search with attribution and download ping per guidelines. `imagePrompt` → Pollinations URL when Unsplash returns no usable result. |
| Share URL | Supabase-backed, 30-day TTL | Session storage dies with the tab. 30-day TTL balances persistence with storage cost. Expiry shown in viewer. |
| Design system | WSJ Editorial light | Editorial financial journalism register, not consumer fintech. Signals analysis context before a word is read. |
| PDF export | pdf-lib, Node runtime, `maxDuration: 60s` | Branded PDF with FinanceLens identity, all sections, disclaimer. |
| PPTX export | pptxgenjs, browser, blob download | Async image fetch then blob download. No server-side file storage required. |
| Persistence | Supabase `financelens_sessions` table | Columns: `id`, `document_type`, `document_text`, `analysis`, `slides`, `share_slug` (unique), `layout` (`briefing` or `compare`), `created_at`, `expires_at`. Public read by slug. Public insert. No auth. RLS enabled. |
| Routes | `/`, `/analyze`, `/results`, `/compare`, `/deck/[slug]`, `/methodology`, `/api/analyze`, `/api/compare`, `/api/briefing`, `/api/export-pdf`, `/api/parse-pdf` | |
| Env vars | `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, optional `UNSPLASH_ACCESS_KEY`, optional `ANTHROPIC_ANALYZE_*` tuning | |
| Deploy | Vercel. Analyze and compare routes `maxDuration: 120s` | Prevents timeout on long paired pastes in compare mode. |

---

## SECTION 6 — STATUS MATRIX

### What works

| Area | Status | Notes |
|---|---|---|
| Paste → analyze → results | Working | Typed JSON, guardrail phrasing, drift tags, source anchors, confidence meter, optional fast model. |
| PDF upload | Working | Server-side pdf-parse with extracted text preview and truncation notice. Text-layer only. |
| Compare mode | Working | Two pasted texts with A/B framing, claim shifts, six sample pairs, share URL, `maxDuration` protection. |
| Briefing deck | Working | Slide outline, PPTX download, share deck copy-to-clipboard, full-screen deck via `/deck/[slug]`. |
| Deck viewer scroll + full-screen | Working | Both views operational for briefing and compare layouts. Keyboard navigation. |
| Branded PDF export | Working | Consistent FinanceLens identity, all sections, disclaimer. |
| Methodology page | Working | `/methodology` explains all AI usage, confidence framing, image sourcing, and assistive-only scope. |
| Validation and retry | Working | `claudeJsonWithRetry` reduces empty failures from malformed model JSON. |
| Graceful degradation | Working | If Supabase insert fails, PPTX download still works offline. |
| Build hygiene | Working | `getSupabase()` guard prevents build crashes without Supabase env. |

### Known gaps and roadmap

| Area | Status | Notes |
|---|---|---|
| Canva API integration | Roadmap | App review pending. When approved, adds a "Polish in Canva" path for editable deck output alongside existing PPTX and 30-day share URLs. Manual "Open in Canva" link exists as a bridge. |
| Scanned PDF support | Gap | `/api/parse-pdf` uses pdf-parse for text-layer extraction only. Scanned image PDFs require paste. Copy in UI reflects this accurately. |
| Streaming | Not built | Analyze waits for full JSON response. A streaming status UI is a planned UX improvement. |
| Rate limiting | Not implemented | Needed before any public traffic push. |
| Observability | Not implemented | No structured logging for latency, token use, or failure class distribution. Needed before monetization layer. |
| Confidence calibration | Partial | Scores are a useful rough rubric. Not calibrated across models or document types. Clearer UI copy and optional hiding available now. |

---

## SECTION 7 — PORTFOLIO COPY

### Proof point (short callout for site)
The product thesis is simple: translation is the minimum. Intelligence is the product. FinanceLens does not summarize financial documents. It structures them into six sections of analysis, surfaces where the language shifted, ties every claim to a source, and closes the loop at a permanent shareable URL.

### Stats
- 6 structured analysis sections per document
- 2-document compare mode with language drift delta
- Zod-validated JSON pipeline from Claude to shareable artifact

### Card summary
Earnings calls, 10-Ks, and regulatory filings structured into six sections: plain language translation, key claims, numbers with context, language drift detection, items worth a closer look, and a confidence rubric. Paste or upload. Includes two-document compare mode, branded PDF share, PPTX download, and a permanent share URL at a custom deck viewer.

### Project description
FinanceLens AI translates financial documents into structured intelligence. The output is not a summary. It is six distinct analytical sections, each with a defined purpose: plain language translation, key claims with source anchors, numbers with contextual explanation, language drift and hedge detection, items worth a closer look, and a confidence rubric. Paste or upload an earnings call, 10-K, or regulatory notice. Compare two documents side by side for delta analysis. Share the output as a branded PDF, PPTX deck, or permanent URL.

### Problem statement
Financial documents are written for lawyers and analysts. Earnings calls, 10-Ks, and regulatory notices are among the most consequential documents a company publishes. They are also nearly inaccessible to anyone without a trained framework for reading them. A retail investor and a portfolio manager receive the same public document. They are not receiving the same information. FinanceLens closes part of that gap with structured intelligence: not a shorter version of the document, but a different kind of product built on top of it.

### Process steps
1. **The product thesis** — Summarization is a solved problem. Intelligence is not. The brief was to build a tool that structures financial documents into distinct analytical sections, each with a defined purpose, with every claim sourced back to the original document. Six sections, Zod-validated, with language drift detection as the most analytically novel capability.
2. **The architecture decision** — Claude Sonnet 4 with a strict typed JSON output contract. Each section is a defined field in the schema. Source anchors are a required field: if a claim cannot be tied to a source passage, the validation fails. The repair pass uses a structured prompt before surfacing an error state.
3. **The pivot** — The original spec used the Canva Connect API for presentation output. During build, Canva's app review process blocked API access with no timeline. The architecture was redesigned to own the presentation layer entirely: Claude generates a deck outline, pptxgenjs renders the PPTX, pdf-lib generates the branded PDF, and a custom deck viewer at a Supabase-backed 30-day share URL closes the loop. The Canva integration stays on the roadmap as additive. The core workflow does not depend on it.

### Process steps interactive (sidebar anchors)
- The Product Thesis
- The Output Contract
- Compare Mode Architecture
- The Pivot Story

### Pivot story (see Section 3 above for full version)

**Short version for ShippedGrid or sidebar:**
Original spec: Canva Connect API for presentation output. Blocked by app review during build, no timeline given. Solution: owned the presentation layer entirely with pptxgenjs, pdf-lib, and a custom deck viewer at a Supabase-backed 30-day share URL. Faster to ship, more flexible, zero OAuth dependency.

**Lesson:** A roadmap dependency on a pending API approval is a schedule risk. Own the layer.

### What shipped (grouped, for ShippedGrid)
- **Input:** Text paste, PDF upload (text-layer only), six sample document pairs including compare mode pairs.
- **Analysis engine:** Six sections (What they said, What it actually means, Key numbers, Language drift, Worth a closer look, Source anchors), Zod validation with repair, toggleable confidence score.
- **Compare mode:** Two-document delta analysis, A/B column rendering, claim shift direction indicators, six sample pairs.
- **Output and sharing:** Branded PDF via pdf-lib, PPTX via pptxgenjs, Claude 7-slide deck outline, Unsplash + Pollinations image pipeline, full-screen deck viewer, 30-day Supabase share URLs, methodology page.
- **Infrastructure:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Claude Sonnet 4 / Haiku, Zod, pdf-lib, pptxgenjs, Supabase, Vercel.

### Stack highlighted
Claude API (Zod-validated six-section output contract), pptxgenjs (owned presentation layer), pdf-lib (branded PDF), Supabase (30-day share URLs)

### Stack standard
Next.js 16, React 19, TypeScript, Tailwind CSS v4, Vercel

### Impact quote
The intelligence is in the delta. What changed from last quarter. Where management stopped committing and started hedging. What was disclosed in a footnote for the first time. FinanceLens surfaces the signal that the document format hides.

### Honest summary

**Technical understanding:**
The Zod validation architecture is the technical centerpiece of this case study. Claude Sonnet 4 produces a typed JSON object with six defined fields, one for each analysis section (What they said, What it actually means, Key numbers, Language drift, Worth a closer look, Source anchors). Source anchors are a required field in the schema: missing source references fail validation and trigger a structured repair prompt via `lib/claudeJsonWithRetry.ts`. The repair prompt is not a generic retry. It tells Claude which fields failed and asks for a targeted correction. The compare mode system prompt is architecturally distinct from the standard analysis prompt: it is a diff-aware instruction set that produces deltas, not two analyses. The presentation layer is fully owned: Claude generates a structured JSON deck outline, pptxgenjs renders the PPTX, pdf-lib generates the branded PDF, and a custom Next.js route serves the 30-day deck viewer. Image pipeline: Unsplash primary with attribution, Pollinations as fallback.

**Product understanding:**
The product hypothesis is that structured intelligence and summarization are different products. Every architectural decision in FinanceLens follows from that hypothesis. The six-section schema is not a UX choice about presentation. It is a product decision about what constitutes a useful financial document analysis. The language drift section does not exist in other AI document tools because it requires a system prompt specifically designed to produce hedge/firm classification, not just a general analysis. The pivot from Canva API to an owned presentation layer was a product decision: a tool that requires a third-party OAuth approval to close its core workflow loop has a dependency that will materialize as a risk. Owning the layer removes it.

**Design understanding:**
The WSJ Editorial light design system was chosen because the aesthetic signals context. FinanceLens is an analysis tool, not a consumer finance app. The visual language of financial journalism: clean white backgrounds, high-contrast type, restrained accent color, dense information layout at readable column widths, communicates that context immediately. The compare mode layout required the most design work: two documents, six sections each, with delta highlights that do not create visual noise. The solution is delta cards that surface only the most significant language shifts, with the full comparison available on expand.

### What this demonstrates
- Structured AI output architecture using typed JSON contracts and Zod validation
- Understanding that summarization and intelligence are different product problems
- Source anchor design as a trust architecture decision, not a UX feature
- Pivot story demonstrating real-world constraint management in product development
- Full owned presentation layer: PDF, PPTX, and custom deck viewer without third-party dependencies
- Financial domain fluency: earnings calls, 10-K structure, language drift in investor communications
- Full-stack build from product definition to deployed, shareable artifact

---

## SECTION 8 — CITATIONS

[1] Loughran, Tim, and Bill McDonald. "When Is a Liability Not a Liability? Textual Analysis, Dictionaries, and 10-Ks." The Journal of Finance 66.1 (2011): 35-65. doi:10.1111/j.1540-6261.2010.01625.x.

[2] Li, Feng. "Annual Report Readability, Current Earnings, and Earnings Persistence." Journal of Accounting and Economics 45.2-3 (2008): 221-247. doi:10.1016/j.jacceco.2008.02.003.

[3] Frankel, Richard, Marilyn Johnson, and Douglas Skinner. "An Empirical Examination of Conference Calls as a Voluntary Disclosure Medium." Journal of Accounting Research 37.1 (1999): 133-150. doi:10.2307/2491396.

[4] Bloomfield, Robert J. "The 'Incomplete Revelation Hypothesis' and Financial Reporting." Accounting Horizons 16.3 (2002): 233-243. doi:10.2308/acch.2002.16.3.233.

[5] U.S. Securities and Exchange Commission. "A Plain English Handbook: How to Create Clear SEC Disclosure Documents." U.S. Securities and Exchange Commission, 1998. sec.gov/pdf/handbook.pdf.