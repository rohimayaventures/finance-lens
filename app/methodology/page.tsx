import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How FinanceLens uses LLMs, validation, briefing decks, and Unsplash imagery. Assistive analysis only.",
};

export default function MethodologyPage() {
  return (
    <div className="fl-app-shell">
      <a href="#main-content" className="fl-skip-link">
        Skip to content
      </a>
      <header className="fl-app-nav">
        <div className="fl-app-nav-start">
          <Link href="/" className="fl-app-back">
            ← Home
          </Link>
          <Link href="/" className="fl-app-logo">
            Finance<span>Lens</span>
          </Link>
        </div>
        <div className="fl-app-nav-end">
          <Link href="/analyze" className="fl-app-nav-text">
            Analyze
          </Link>
          <Link href="/compare" className="fl-app-nav-text">
            Compare
          </Link>
        </div>
      </header>

      <main className="fl-methodology-main" id="main-content">
        <article className="fl-methodology-article">
          <p className="fl-methodology-eyebrow">Trust and limitations</p>
          <h1 className="fl-methodology-title">How FinanceLens works</h1>
          <p className="fl-methodology-lede">
            FinanceLens uses large language models (Claude) to read text you provide and return structured notes. It is an assistive
            tool, not a substitute for reading primary documents or professional judgment.
          </p>

          <section className="fl-methodology-section">
            <h2>Single-document analysis</h2>
            <p>
              You paste or upload text; the model returns summaries, key numbers, drift signals, flags, optional confidence scoring, and{" "}
              <strong>source anchors</strong>: short excerpts that support the takeaways. Anchors are meant to speed verification—they can
              still mis-align if the paste is imperfect, so always check the original filing or transcript.
            </p>
          </section>

          <section className="fl-methodology-section">
            <h2>Compare mode</h2>
            <p>
              Two documents are compared side by side. Per-document confidence scores reflect how much concrete detail appeared in each
              excerpt (numbers, dates, specific claims), not statistical certainty or any prediction about securities.
            </p>
          </section>

          <section className="fl-methodology-section">
            <h2>Briefing decks and images</h2>
            <p>
              The briefing builder turns your analysis into slide outlines. When <code className="fl-app-code-inline">UNSPLASH_ACCESS_KEY</code>{" "}
              is configured on the server, the app searches Unsplash for landscape photos using keyword prompts authored by the model. We
              attribute photographers per Unsplash guidelines. If that key is absent, optional abstract imagery may be generated from
              text prompts instead. You can also pass verified <code className="fl-app-code-inline">https</code> image URLs when you control
              the full pipeline.
            </p>
          </section>

          <section className="fl-methodology-section">
            <h2>Validation and retries</h2>
            <p>
              Model responses are checked against strict JSON schemas. If parsing or validation fails once, the app asks the model for a
              corrected response automatically. That reduces empty errors but does not guarantee perfection—edge cases still happen.
            </p>
          </section>

          <section className="fl-methodology-section">
            <h2>Data and retention</h2>
            <p>
              Today, results are held in your browser session (for example, <code className="fl-app-code-inline">sessionStorage</code>) until
              you close the tab. The server processes requests for analysis, compare, and decks but is not designed as long-term storage for
              your documents unless you add that separately. Use <strong>Share as PDF</strong> on the results page to download a branded
              snapshot you can keep or send—generation happens on demand and is not stored by us.
            </p>
          </section>

          <section className="fl-methodology-section">
            <h2>Disclaimer</h2>
            <p>
              Output is for informational purposes only. It is not investment, legal, or accounting advice. Do not buy, sell, or hold any
              security based solely on this tool.
            </p>
          </section>

          <p className="fl-methodology-footer">
            <Link href="/analyze" className="fl-methodology-cta">
              Run an analysis
            </Link>
            <span className="fl-methodology-sep">·</span>
            <Link href="/compare" className="fl-methodology-cta">
              Compare documents
            </Link>
          </p>
        </article>
      </main>
    </div>
  );
}
