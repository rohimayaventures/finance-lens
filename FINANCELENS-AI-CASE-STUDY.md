# FinanceLens AI — Portfolio Case Study Documentation
# Hannah Kraulik Pagade
# For use in portfolio at hannahkraulikpagade.com

---

## PROJECT METADATA

**Project name:** FinanceLens AI
**Tagline:** Financial documents, in plain English.
**Status:** Live
**Primary URL:** financelens-ai.vercel.app
**Repo:** github.com/rohimayaventures/financelens-ai
**Tags:** FINTECH · AI-PRODUCT · FULL-STACK · DOCUMENT-INTELLIGENCE
**Role:** Product Design and Prompt Architecture
**Timeline:** 2026
**Key outcome:** Five-section financial analysis with language drift detection, confidence scoring, guardrails, and one-click Canva deck generation
**Stack:** Next.js 15 · TypeScript · Tailwind CSS v4 · Claude API · Canva API · Supabase · Vercel

---

## SECTION 1 — THE PROBLEM

### One-sentence framing

Executives write earnings calls to communicate selectively. The language is deliberate. Most people reading these documents — employees, retail investors, journalists, non-finance professionals — lack the tools to read what the language is actually signaling beneath the surface.

### The problem in detail

**Financial documents are written to obscure as much as they communicate.** A 10-K annual filing averages 40,000 words. An earnings call transcript runs 8,000 to 12,000 words. These documents are produced by teams of lawyers, investor relations professionals, and communications staff whose job is to present information in the most favorable light legally permissible. The result is a document that technically discloses everything and practically communicates very little.

**The signals that matter are in the language, not just the numbers.** "We believe we are well-positioned to deliver" is not the same as "we are confident we will deliver." When a CFO says "we are evaluating our cost structure," that phrase appears in the earnings calls of companies that announce restructurings within two quarters at a statistically significant rate. When guidance range width increases from $100M to $150M while the midpoint holds, management is signaling higher uncertainty than the headline number implies. These are readable signals — if you know what to look for.

**Most people do not know what to look for.** Financial literacy tools either summarize the document and lose the signal, or present it raw and require expertise the user does not have. No tool exists that surfaces drift between definitive and hedging language, scores individual management claims by whether they are backed by metrics or are pure assertion, flags buried disclosures, and compares language shift across two documents — all in plain English, in one interface.

**The analyst workflow is broken.** An analyst or investor who wants to turn a 10-K analysis into a presentation for a board or investment committee currently reads the document, takes notes, writes a summary, and builds slides manually. That is three to four hours of work for every document. None of it needs to be manual.

### Why existing solutions fall short

Financial data platforms such as Bloomberg, FactSet, and Refinitiv are priced for institutional users and focused on structured data, not natural language analysis. AI summarization tools produce a single paragraph that flattens the nuance. No tool combines plain language translation, drift detection, confidence scoring, and presentation generation in a single workflow accessible to a non-institutional user.

---

## SECTION 2 — THE PROCESS

### Step 1 — Discovery and Constraints

**The core insight that shaped the product.**

The difference between FinanceLens and a document summarizer is the difference between translation and intelligence. Translation removes complexity. Intelligence reveals the complexity beneath deliberately simple language. FinanceLens was designed to do the latter.

**Constraint set:**

- The tool must produce more than a summary. A summary tells you what was said. FinanceLens must tell you what it means, what it signals, and what deserves scrutiny.
- Language drift must be surfaced as a discrete signal, not buried in prose. The shift from "we will" to "we believe" must be visible at a glance.
- Confidence scoring must apply to individual claims, not the document as a whole. A document can contain both verifiable metrics and unsubstantiated assertions in the same paragraph.
- The document type must change the analysis logic. An earnings call is analyzed for management tone, guidance language, and selective disclosure. A 10-K is analyzed for auditor changes, revenue concentration risk, forward-looking statement density, and risk factor additions. A regulatory notice is analyzed for compliance obligations and enforcement language. The same prompt cannot serve all three.
- The output must be shareable without friction. One-click Canva deck generation was a product requirement from the start, not a feature added later.
- Guardrails must be explicit and persistent. Financial intelligence in a regulated-adjacent domain carries hallucination risk and real liability surface. The tool must never present itself as a financial advisor and must frame every output as assistive analysis, not authoritative conclusion.

**Technical constraints:**

- Claude API selected for structured JSON output reliability across all five sections simultaneously
- Canva API selected for presentation generation — branded, shareable, editable by the recipient
- Supabase for share URL generation — analysis history accessible without requiring user authentication
- Next.js 15 App Router for the split sidebar and main content layout

### Step 2 — Design and Build

**Prompt architecture — the hardest problem.**

The core technical challenge was building a prompt that produces five structurally distinct sections from a single document input, with the analysis logic varying by document type, without the sections bleeding into each other or losing their distinct purpose.

Key prompt constraints iterated through testing:

- Section 1 (What they said) must not interpret. It must translate. Any interpretive language belongs in Section 2. The test: could a communications team have written Section 1 themselves? If yes, it is clean. If not, it contains interpretation and needs revision.
- Section 2 (What it actually means) must remove hedging from management claims and state what the language implies directly. Not "the company noted challenges" but "revenue in this segment declined and management avoided specifying by how much."
- Section 3 (Key numbers) must return numbers with direction, context, and comparison. Not "$847M" but "$847M, up 12% year-over-year, driven by enterprise — consumer revenue was not disclosed."
- Section 4 (Language drift) must identify specific phrases and their shift from prior language where detectable, or flag them as hedging versus definitive language patterns. Each drift item returns as a tagged object: hedge, firm, or new language.
- Section 5 (Worth a closer look) must flag items that are structurally suspicious — buried disclosures, missing figures, language patterns associated with subsequent negative events — with a claim confidence score at the section level.
- All sections must use attribution language throughout: "this may suggest," "this is consistent with," "this language pattern is typically associated with." The system prompt explicitly prohibits any language a reasonable person could interpret as a buy, sell, or hold recommendation. The model is constrained to observe and interpret, not to advise or predict.

**Document type selector — three separate prompt variants.**

Earnings call analysis focuses on: guidance language, management tone shifts, selective disclosure by segment, question-and-answer evasion patterns, and forward-looking statement confidence.

10-K analysis focuses on: auditor changes, revenue concentration (single customer or geography risk), risk factor additions or deletions versus prior year, going concern language, and related party transaction disclosure.

Regulatory notice analysis focuses on: compliance obligation specificity, enforcement language intensity, timeline requirements, and penalty exposure framing.

**Compare mode — the feature that makes FinanceLens an intelligence tool.**

Two documents are analyzed independently, then Claude performs a third pass comparing the outputs. The comparison surfaces: new language that appeared, language that was dropped, confidence score shifts between periods, and specific claims that changed from firm to hedging or vice versa. For a Q3 versus Q4 comparison, this tells you what management stopped saying.

**Canva deck generation — the workflow completion.**

After analysis, Claude structures the five sections into seven slide outlines: title, executive summary, interpretation, key metrics, language drift signals, flags, and source reference. The Canva API generates a branded presentation from those outlines using the user's brand kit. The result is an editable, shareable Canva link — not a static PDF, but a live presentation the recipient can modify.

**Design system — WSJ Editorial.**

FinanceLens is the only light-background product in the portfolio. The WSJ Editorial system was designed to read like a financial newspaper crossed with an analyst research report.

- Background: warm cream `#FAFAF7`
- Primary text: deep ink `#1C1C1E`
- Signal red for flags and negative indicators: `#C0392B`
- Positive indicators: `#1A7A3C`
- Drift hedge signal: amber `#9A6B00`
- Drift firm signal: forest `#1A7A3C`
- Typography: Georgia (headings and product name), IBM Plex Mono (all financial data, tags, and metadata)

The deliberate choice to use a light background and serif typography makes FinanceLens immediately visually distinct from every other product in the portfolio and communicates the editorial, research-report register of the product before a word is read.

### Step 3 — What Shipped

**Core product:**
- Document input via paste or PDF upload with server-side PDF parsing
- Document type selector with three distinct Claude analysis prompts: earnings call, 10-K, regulatory notice
- Five-section structured analysis output rendered in the WSJ Editorial design system
- Language drift detection with hedge versus firm tagging and specific phrase-level examples
- Claim confidence scoring at the section and document level
- Compare mode: two-document diff showing language changes, dropped content, and confidence shifts
- Generate Canva deck: one-click conversion of analysis to branded, editable presentation via Canva API
- Share URL generation via Supabase for analysis history and collaboration
- Persistent disclaimer on all analysis output: assistive analysis only, not financial advice

**Technical stack:**
- Next.js 15 App Router, TypeScript, Tailwind CSS v4
- Claude API (claude-sonnet-4-20250514) with three document-type-specific system prompts
- Canva API for branded presentation generation
- Supabase for session persistence and share URLs
- Vercel deployment

---

## SECTION 3 — OUTCOMES AND IMPACT

### What this demonstrates as a portfolio project

**Generalist AI product thinking.** FinanceLens applies the same AI document intelligence architecture as HealthLiteracy AI to a completely different domain and user type. The pattern — structured document input, constrained Claude prompt, typed output sections — generalizes. A product builder who can apply a proven architecture to a new domain efficiently is more valuable than one who rebuilds from scratch every time.

**Prompt architecture sophistication.** Five distinct output sections from a single document pass, with analysis logic branching by document type and a separate comparison pass for two-document mode, requires multi-layer prompt design. This is not a summarizer. It is a constrained intelligence pipeline.

**End-to-end workflow thinking.** The Canva integration is not a feature added for novelty. It completes the analyst workflow: ingest a document, analyze it, present it. Most AI tools stop at analysis and leave the presentation problem to the user. FinanceLens closes the loop.

**Design system range.** WSJ Editorial is the only light-background, serif-led design system in the portfolio. It demonstrates range across the full spectrum — from the clinical authority of Meridian Oracle to the accessibility warmth of Candlelight Clarity to the institutional editorial register of WSJ Editorial.

**Domain breadth without domain depth compromise.** FinanceLens works because the core insight — that financial language is structured and its drift patterns are detectable — is accurate. Building a financial intelligence tool requires understanding how earnings calls are constructed, what regulatory language signals, and which 10-K disclosures carry risk. The product reflects that understanding.

### Guardrails and limitations

FinanceLens is an assistive analysis tool, not a financial advisor. This distinction is not a legal footnote — it is a product design decision that shapes every layer of the build.

The system prompt explicitly prohibits any language a reasonable person could interpret as a buy, sell, or hold recommendation. Every section uses attribution framing throughout: "this may suggest," "this is consistent with," "this language pattern is typically associated with." The model is constrained to observe and interpret, not to advise or predict.

Every analysis page carries a persistent disclaimer: outputs are AI-generated interpretations for informational purposes only, not investment advice, and users are responsible for their own financial decisions.

This framing is intentional and mirrors the same safety-first prompt architecture used in OrixLink AI — the attribution language constraint that prevents the tool from being read as authoritative rather than assistive. Building explicit guardrails into the prompt architecture for a regulated-adjacent domain is a product maturity signal. It shows understanding of the liability surface of AI products and the difference between a useful tool and a reckless one. In interviews, the guardrail architecture is a more interesting talking point than the feature list.

---

## SECTION 4 — PORTFOLIO PAGE COPY (READY TO DROP IN)

### Status badge
Live

### Role and timeline
Product Design and Prompt Architecture · 2026

### Key outcome
Five-section financial intelligence with language drift detection, claim confidence scoring, and one-click Canva deck generation

### Card summary
Financial document intelligence. Earnings calls, 10-Ks, regulatory notices. Drift detection, confidence scoring, one-click decks.

### Project description (for case study hero)
FinanceLens AI translates earnings calls, 10-K filings, and regulatory notices into five structured intelligence sections — plain language, interpretation, key numbers, language drift signals, and flags worth a closer look. Compare two documents side by side to see what changed. Generate a Canva presentation deck in one click. Assistive analysis only, not financial advice.

### Problem statement (for case study hero)
Executives write earnings calls to communicate selectively. The language is deliberate. "We believe we are well-positioned" is not the same as "we are confident we will deliver." Most people reading these documents lack the tools to read what the language is actually signaling. FinanceLens surfaces those signals.

### Process Step 1 — Discovery
The core constraint was the difference between translation and intelligence. Translation removes complexity. Intelligence reveals the complexity beneath deliberately simple language. Every design decision — the five-section structure, the drift detection, the document type selector, the explicit guardrails, the Canva integration — follows from that distinction.

### Process Step 2 — Design and Build
The core product work was a multi-layer Claude prompt architecture producing five structurally distinct output sections with analysis logic that varies by document type. An earnings call is analyzed for guidance language and management tone. A 10-K is analyzed for auditor changes, revenue concentration, and risk factor shifts. A regulatory notice is analyzed for compliance obligations and enforcement language. The compare mode runs a third Claude pass that diffs two analyses and surfaces what changed, what was dropped, and how confidence shifted. Every output section uses attribution language throughout — the same constraint architecture that prevents OrixLink from functioning as a diagnostic instrument applies here to prevent FinanceLens from functioning as a financial advisor.

### Process Step 3 — What shipped
A financial document intelligence tool with three document type modes, five structured output sections, language drift detection with phrase-level tagging, claim confidence scoring, two-document compare mode, one-click Canva presentation generation, and persistent assistive-only disclaimers throughout. Deployed on Vercel, sessions persisted in Supabase, built on Next.js 15 and the Claude and Canva APIs.

### Impact line
Three to four hours of analyst work — read the document, take notes, write a summary, build slides — replaced by one workflow. Ingest, analyze, present. That is the product. And it is honest about what it is: an assistive intelligence layer, not a financial advisor.

---

*Case study documentation prepared March 2026.*
*Hannah Kraulik Pagade.*