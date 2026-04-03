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
| Typography (display) | Fraunces | Marketing headings, landing page, editorial display |
| Typography (app) | Georgia | Report surfaces, body content, card headings |
| Typography (data) | IBM Plex Mono | Financial data, tags, wordmark, labels |

The choice to use a light background and serif typography makes FinanceLens immediately visually distinct from every other product in the portfolio and communicates the editorial, research-report register before a word is read.

### Image pipeline: Unsplash + Pollinations

Briefing decks include imagery resolved server-side. The pipeline: `imageSearchQuery` → Unsplash landscape search with attribution and download ping per API guidelines. Fallback: `imagePrompt` → Pollinations URL for abstract imagery when Unsplash returns no usable result. Images are fetched asynchronously during the PPTX generation step and embedded before the blob download triggers.

### Compare mode architecture

Two-document compare loads both transcripts and runs a diff-aware version of the analysis. The system prompt instructs Claude to surface deltas: what was said in document A that was not said in document B, where language changed in tone or specificity, and what the shift may signal. The output renders as an accordion-style expandable section layout. Claim shifts and new language are expanded by default. All other delta sections are collapsible. Each section header shows a summary line and item count when collapsed so reviewers can scan before expanding.

### The pivot story: Canva API to owned presentation layer

The original product spec called for Canva Connect API as the presentation output. An investor would complete an analysis, click one button, and a branded Canva deck would generate at a shareable Canva URL.

During build, Canva's app review process blocked API access pending approval with no stated timeline. The dependency was real: without the Canva API, the core "analysis to shareable artifact" workflow loop could not close.

The architecture was redesigned from the ground up.

Instead of delegating the presentation layer to Canva, FinanceLens owns it entirely. Claude generates a structured JSON deck outline. pptxgenjs renders a downloadable PPTX from that outline. pdf-lib generates a branded PDF for sharing. A custom deck viewer at `/deck/[slug]` renders the full presentation inside the app using the WSJ Editorial design system, at a 30-day Supabase-backed URL.

The result removed a third-party OAuth dependency, gave full control over the branded output format, and shipped faster than waiting for Canva approval would have allowed. The Canva integration remains on the roadmap as an additive output format, not a requirement for the core workflow to function.

**Lesson:** A third-party dependency on a feature that is not yet approved is a schedule risk that will materialize. Owning the layer eliminates the risk and often produces a better product. The custom deck viewer built for this pivot is a stronger portfolio artifact than a Canva embed would have been.

### Pivot B — Hero assets to production media pipeline

The landing page originally used multi-megabyte PNG and SVG exports dropped directly from design tools. These assets hurt LCP, inflated git history, and created fragile favicon behavior across email clients and social crawlers.

The decision: introduce a dedicated optimization path. `scripts/optimize-assets.mjs` uses Sharp to produce `public/hero.webp` for the landing hero, `public/og-image.jpg` for Open Graph and Twitter, and rasterized mark icons at every required size (`public/icon-*.png`, `app/icon.png`, `app/apple-icon.png`). Edge cases including same-file read/write on Windows and regenerating from fallback sources when full-res inputs are absent are handled in the script, not in the UI.

**Lesson:** Shipping design exports as-is confuses design handoff with production delivery. Media is a build artifact with defined outputs, not whatever the design tool exported last.

### Pivot C — Metadata and portfolio attribution as shipping criteria

A live product on Vercel needs correct canonical URLs for social sharing, and a portfolio case study needs a clear attribution thread that does not clutter the analysis UX.

The decision: set `metadataBase` from env (`NEXT_PUBLIC_SITE_URL` with Vercel fallbacks), wire Open Graph and Twitter images to the optimized `og-image.jpg`, use App Router icon files for favicons, and add a reusable `PortfolioSiteCredit` component across landing, shell pages, deck viewer footers, and PDF footer copy, all pointing consistently to `hannahkraulikpagade.com`.

**Lesson:** Shipping is not only features. It is how the product looks when linked on LinkedIn and how clearly ownership and limitations read next to AI output.

### Pivot D — Share URLs as first-class persistence

`sessionStorage` dies with the tab. Demos and "send this read" use cases need something durable enough to present without building authentication.

The decision: on successful analyze, compare, and briefing flows, insert a row into `financelens_sessions` with a nanoid slug and a 30-day `expires_at`. The deck viewer at `/deck/[slug]` resolves the row and renders the stored analysis or comparison. Expired slugs return a clean 410 branded error state. If Supabase env is missing, PPTX and PDF download still work — graceful degradation means the share path fails silently without breaking the core workflow.

**Lesson:** We traded account complexity for time-boxed, link-based persistence. The artifact, not the login, is the unit of sharing.

### Pivot E — Compare accordion for scannable delta output

The compare results page originally rendered all delta sections as stacked, always-visible content. Long comparisons required significant scrolling before a reviewer could assess which sections were worth reading.

The decision: convert all delta sections to an accordion layout. Claim shifts and new language sections expand by default because those carry the most analytical signal. All other sections are collapsed, showing a summary line and item count in the header. The implementation uses React `useState` with CSS `max-height` transition, no external library, 44px touch targets for mobile.

**Lesson:** The order in which information reveals itself is a product decision. Start with what is most likely to matter, let reviewers pull the rest.

---

## SECTION 4 — WHAT SHIPPED

### Single-document analysis (`/analyze` → `/results`)

**Input:** Paste text or upload PDF. Text extraction via `/api/parse-pdf` (not OCR, scanned pages require paste). Document types: Earnings call, 10-K, Regulatory notice. Each type steers a different Claude system prompt.

**Six output sections (actual shipped labels):** What they said, What it actually means, Key numbers, Language drift (hedge/firm tags with quoted phrases), Worth a closer look, Source anchors. Confidence score as a separate toggleable element with a 0-100 LLM-assigned rubric on evidence density. Not a statistical prediction. Not a stock recommendation.

**Speed:** Claude Sonnet 4 (`claude-sonnet-4-20250514`) for all translate and verify calls. Sonnet is used throughout rather than a smaller model because clinical and financial plain-language work requires high-quality structured output. No Haiku routing is implemented.

**Persistence:** Results in sessionStorage for the tab session. Share analysis saves to Supabase and returns a share URL at `/deck/[slug]` with a 30-day TTL. Expiry is displayed in the viewer. Expired slugs return a 410 branded error state.

### Compare mode (`/compare`)

Two documents, same document-type framing. One Claude call returns structured JSON: overview of the period-over-period shift, new language in Document B, language dropped from Document A, claim shifts with direction indicators (firm to hedge or reverse), metrics narrative, dual confidence scores side by side. Six built-in sample pairs for instant demos. Results render as an accordion layout: claim shifts and new language expanded by default, all other sections collapsible with summary line and item count visible in the header. Share comparison saves to Supabase at a 30-day `/deck/[slug]` URL with a compare-specific layout. `maxDuration: 120` on the route prevents Vercel timeout on long paired pastes.

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
| PDF export | pdf-lib, Node runtime, `maxDuration: 60s` | Branded PDF with FinanceLens identity, all sections, disclaimer. WSJ Editorial token colors. Georgia and IBM Plex Mono typography. |
| PPTX export | pptxgenjs, browser, blob download | Slide titles and body use Calibri (Office-safe default). WSJ Editorial brand colors applied to slide chrome. Async image fetch before blob download. |
| Persistence | Supabase `financelens_sessions` table | Columns: `id`, `document_type`, `document_text`, `analysis`, `slides`, `share_slug` (unique), `layout` (`briefing` or `compare`), `created_at`, `expires_at` (30-day TTL). Note: analyze-only rows use `layout: "briefing"` with `slides: null`. Deck viewer branches on whether `slides` exist, not on a distinct `analysis` layout value. Public read by slug. Public insert. No auth. RLS enabled. |
| Session expiry | 30-day TTL, 410 for expired slugs | Expired share links return a branded 410 error state. Expiry date shown in viewer header. Privacy-by-design: no indefinite storage of shared content. |
| Routes | `/`, `/analyze`, `/results`, `/compare`, `/deck/[slug]`, `/methodology`, `/api/analyze`, `/api/compare`, `/api/briefing`, `/api/export-pdf`, `/api/parse-pdf` | |
| Env vars | `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SITE_URL` (canonical base, used in `metadataBase`), `NEXT_PUBLIC_APP_URL` (share link construction), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, optional `UNSPLASH_ACCESS_KEY` | `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_APP_URL` serve different purposes. `.env.example` should document both. |
| Styling | Tailwind CSS v4 (utility base) + custom `.fl-*` CSS classes | Tailwind provides the reset and utility foundation. The majority of UI layout and component styling is implemented as custom `.fl-*` CSS class names, not utility-class-driven layouts. |
| Compare accordion | React useState, CSS max-height transition, no library | Claim shifts and new language expanded by default. All sections independently collapsible. 44px touch targets. Summary line and item count visible in collapsed header. |
| Deploy | Vercel. Analyze and compare routes `maxDuration: 120s` | Prevents timeout on long paired pastes in compare mode. |

---

## SECTION 6 — STATUS MATRIX

### What works

| Area | Status | Notes |
|---|---|---|
| Paste → analyze → results | Working | Six-section typed JSON, guardrail phrasing, drift tags, source anchors where present, confidence meter. Claude Sonnet 4 throughout. |
| PDF upload | Working | Server-side pdf-parse, text-layer only. Scanned PDFs require paste. UI copy reflects this accurately. |
| Compare mode | Working | Two pasted texts, six delta sections, claim shifts and new language expanded by default, all sections independently collapsible, six sample pairs, share URL, `maxDuration` protection. |
| Compare accordion | Working | Accordion layout with CSS max-height transition, 44px touch targets, summary line visible when collapsed. |
| Briefing deck | Working | 7-slide Claude outline, PPTX download, share deck copy-to-clipboard, full-screen deck via `/deck/[slug]`. |
| Deck viewer scroll + full-screen | Working | Both views operational. Keyboard navigation. 30-day TTL shown at top. |
| Branded PDF export | Working | pdf-lib, WSJ Editorial token colors, Georgia + IBM Plex Mono. Calibri in PPTX export (Office-safe). |
| Methodology page | Working | `/methodology` explains AI usage, confidence framing, image sourcing, and assistive-only scope. |
| Validation and retry | Working | `claudeJsonWithRetry` with one repair turn before error state. |
| Session expiry | Working | 30-day TTL, `expires_at` in DB, 410 error state for expired slugs. |
| Graceful degradation | Working | Supabase insert failure does not block PPTX or PDF download. |
| Media pipeline | Working | `scripts/optimize-assets.mjs` produces `hero.webp`, `og-image.jpg`, and rasterized icons. OG/Twitter metadata wired. |
| Portfolio attribution | Working | `PortfolioSiteCredit` component on landing, shell, deck viewer, and PDF footer. `metadataBase` from `NEXT_PUBLIC_SITE_URL`. |
| Iframe embed headers | Working | CSP `frame-ancestors` and `X-Frame-Options` configured for `hannahkraulikpagade.com`. |
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
The shift from "we will deliver" to "we believe we are well positioned to deliver" is not a stylistic choice. It is information. FinanceLens structures financial documents into six sections of analysis, surfaces where the language shifted, ties claims to source passages when present, and closes the loop at a 30-day shareable URL.

### Stats
- 6 structured analysis sections per document
- 2-document compare mode with accordion delta output
- 5 pivot decisions from Canva API to media pipeline to share URL persistence

### Card summary
Earnings calls, 10-Ks, and regulatory filings structured into six sections: plain language translation, key claims, numbers with context, language drift detection, items worth a closer look, and source anchors. Paste or upload. Two-document compare mode with expandable delta sections. Branded PDF, PPTX download, and a 30-day share URL at a custom deck viewer.

### Project description
FinanceLens AI translates financial documents into structured intelligence. Not a summary. Six distinct analytical sections with source anchors, language drift detection with hedge/firm tagging, and a confidence rubric. Compare two documents for delta analysis with an accordion layout that surfaces the most signal-rich sections first. Share output as branded PDF, PPTX deck, or 30-day URL.

### Problem statement
Financial documents are written for lawyers and analysts. Earnings calls, 10-Ks, and regulatory notices are among the most consequential documents a company publishes. They are nearly inaccessible to anyone without a trained framework for reading them. FinanceLens closes part of that gap with structured intelligence: not a shorter version of the document, but a different kind of product built on top of it.

### Process steps
1. **The product thesis** — Summarization is a solved problem. Intelligence is not. The brief was to build a tool that structures financial documents into distinct analytical sections with source anchors where available, Zod-validated, with language drift detection as the most analytically novel capability.
2. **The architecture** — Claude Sonnet 4 (`claude-sonnet-4-20250514`) with a strict typed JSON output contract and `claudeJsonWithRetry` for one structured repair turn on failure. Source anchors are prompt-required and surfaced when present. The compare mode uses a diff-aware system prompt, a distinct architecture from standard analysis.
3. **The pivots** — Five documented decisions: Canva API replaced with an owned presentation layer, multi-megabyte design exports replaced with a Sharp-optimized media pipeline, portfolio attribution wired across landing and deck viewer, share URLs implemented as 30-day Supabase-backed sessions with 410 expiry, and compare results rebuilt as an accordion layout with default-open signal sections.

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
Claude Sonnet 4 (`claude-sonnet-4-20250514`) is used for all translate, verify, compare, and briefing calls. No Haiku routing is implemented. Source anchors are prompt-required and surfaced when the model includes them; `supportingEvidence` is optional in the Zod schema, not a hard validation gate. `claudeJsonWithRetry` fires one structured repair turn before the error state surfaces. The compare mode uses a diff-aware system prompt, architecturally distinct from standard analysis. The presentation layer is fully owned: Claude deck outline, pptxgenjs PPTX (Calibri for Office compatibility), pdf-lib PDF (WSJ Editorial typography), custom Next.js deck viewer at 30-day Supabase URLs with 410 on expiry. Media pipeline: `scripts/optimize-assets.mjs` produces `hero.webp`, `og-image.jpg`, and rasterized icons. The UI is mostly custom `.fl-*` CSS classes; Tailwind provides the reset and utility base.

**Product understanding:**
The product hypothesis is that structured intelligence and summarization are different products. Every architectural decision follows from that hypothesis. The language drift section requires a system prompt specifically designed to produce hedge/firm classification. Five pivot decisions are documented in Section 3: Canva to owned layer, design exports to build pipeline, attribution as shipping criteria, share URLs as the unit of sharing, and compare accordion as information reveal design. The honest gaps: source anchors are optional in schema not required, no streaming on analyze, no rate limiting before public traffic, no observability before monetization.

**Design understanding:**
The WSJ Editorial light design system has three distinct typeface roles: Fraunces for landing and display headings, Georgia for app and report surfaces, IBM Plex Mono for financial data and labels. The compare accordion layout was a product design decision: claim shifts and new language expanded by default because those carry the most analytical signal. All other sections show a summary line and item count in the collapsed header. PPTX uses Calibri because it is the Office-safe default, not the brand choice. The deck viewer scroll and full-screen modes serve different use cases: scroll for reading, full-screen for presenting.

### What this demonstrates
- Structured AI output architecture using typed JSON contracts and Zod validation with repair
- Product-level distinction between summarization and intelligence
- Five documented pivot decisions each with a real constraint, decision, and outcome
- Accordion-style compare UX: information reveal order as a product decision
- Fully owned presentation layer without third-party OAuth dependency
- Media pipeline discipline: design exports treated as build artifacts, not direct deploys
- Financial domain fluency: earnings calls, 10-K structure, language drift in investor communications
- Full-stack build from product definition to deployed, shareable artifact with 30-day share URLs and 410 expiry

---

## SECTION 8 — CITATIONS

[1] Loughran, Tim, and Bill McDonald. "When Is a Liability Not a Liability? Textual Analysis, Dictionaries, and 10-Ks." The Journal of Finance 66.1 (2011): 35-65. doi:10.1111/j.1540-6261.2010.01625.x.

[2] Li, Feng. "Annual Report Readability, Current Earnings, and Earnings Persistence." Journal of Accounting and Economics 45.2-3 (2008): 221-247. doi:10.1016/j.jacceco.2008.02.003.

[3] Frankel, Richard, Marilyn Johnson, and Douglas Skinner. "An Empirical Examination of Conference Calls as a Voluntary Disclosure Medium." Journal of Accounting Research 37.1 (1999): 133-150. doi:10.2307/2491396.

[4] Bloomfield, Robert J. "The 'Incomplete Revelation Hypothesis' and Financial Reporting." Accounting Horizons 16.3 (2002): 233-243. doi:10.2308/acch.2002.16.3.233.

[5] U.S. Securities and Exchange Commission. "A Plain English Handbook: How to Create Clear SEC Disclosure Documents." U.S. Securities and Exchange Commission, 1998. sec.gov/pdf/handbook.pdf.