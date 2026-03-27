"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false);

  const closeSectionMenu = () => setIsSectionMenuOpen(false);

  return (
    <div className="fl-page">
      <nav className="fl-nav" aria-label="Primary">
        <Link href="/" className="fl-logo">
          Finance<span>Lens</span>
        </Link>
        <div className="fl-nav-links">
          <Link href="/compare" className="fl-nav-link">
            Compare
          </Link>
          <Link href="/analyze" className="fl-nav-cta">
            Analyze a document
          </Link>
        </div>
      </nav>

      <nav className="fl-section-nav" aria-label="Section navigation">
        <div className="fl-section-nav-inner">
          <button
            type="button"
            className="fl-section-toggle"
            aria-expanded={isSectionMenuOpen}
            aria-controls="section-menu"
            onClick={() => setIsSectionMenuOpen((prev) => !prev)}
          >
            <span className="fl-section-toggle-label">Sections</span>
            <span className={`fl-hamburger ${isSectionMenuOpen ? "is-open" : ""}`} aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </button>
          <div id="section-menu" className={`fl-section-links ${isSectionMenuOpen ? "is-open" : ""}`}>
            <a href="#overview" className="fl-section-link" onClick={closeSectionMenu}>
            Overview
            </a>
            <a href="#problem" className="fl-section-link" onClick={closeSectionMenu}>
            Problem
            </a>
            <a href="#differentiators" className="fl-section-link" onClick={closeSectionMenu}>
            Why it wins
            </a>
            <a href="#outputs" className="fl-section-link" onClick={closeSectionMenu}>
            Outputs
            </a>
            <a href="#workflow" className="fl-section-link" onClick={closeSectionMenu}>
            Workflow
            </a>
            <a href="#start" className="fl-section-link" onClick={closeSectionMenu}>
            Start
            </a>
          </div>
        </div>
      </nav>

      {/* Masthead */}
      <header className="fl-masthead" id="overview">
        <div className="fl-masthead-bg" aria-hidden />
        <div className="fl-masthead-inner">
          <div className="fl-masthead-copy">
            <p className="fl-dateline">Financial document intelligence</p>
            <h1 className="fl-hero-hed">
              Read what they
              <br />
              <em>actually</em> said.
            </h1>
            <p className="fl-lede">
              Earnings calls, 10-Ks, and regulatory filings are written to disclose everything—and communicate only what
              management wants heard. FinanceLens is built for the gap between the words and the signal:{" "}
              <strong>translation plus intelligence</strong>, not a one-paragraph AI summary.
            </p>
            <p className="fl-lede-secondary">
              Paste text or upload a PDF. Get five structured sections—plain language, interpretation, key numbers, language
              drift, and flags—plus compare mode and one-click Canva decks when you need to brief someone else.
            </p>
            <div className="fl-hero-actions">
              <Link href="/analyze" className="fl-btn-primary">
                Try it free →
              </Link>
              <Link href="/analyze" className="fl-btn-ghost">
                See an example
              </Link>
              <span className="fl-hero-note">No login required</span>
            </div>
          </div>

          <aside className="fl-masthead-aside" aria-label="Example signals">
            <p className="fl-aside-label">Signal preview</p>
            <div className="fl-demo-cards">
              <div className="fl-demo-card">
                <span className="fl-demo-tag source">Source</span>
                <p className="fl-demo-text">
                  &ldquo;We believe we are well-positioned to deliver on our revised guidance range...&rdquo;
                </p>
              </div>
              <div className="fl-demo-card drift">
                <span className="fl-demo-tag drift">Drift detected</span>
                <p className="fl-demo-text strong">
                  Q2: &ldquo;confident we will deliver&rdquo; → Q3: &ldquo;believe we are positioned&rdquo;
                </p>
              </div>
              <div className="fl-demo-card flag">
                <span className="fl-demo-tag flag">Flag</span>
                <p className="fl-demo-text strong">
                  Consumer revenue — no figure disclosed. 40 sec airtime vs 8 min for enterprise.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </header>

      {/* Problem / thesis */}
      <section className="fl-thesis" aria-labelledby="thesis-heading" id="problem">
        <div className="fl-thesis-inner">
          <div className="fl-thesis-rule" aria-hidden />
          <div>
            <h2 id="thesis-heading" className="fl-section-eyebrow">
              I · The problem
            </h2>
            <p className="fl-pullquote">
              The signals that matter are in the <em>language</em>, not just the numbers.
            </p>
            <p className="fl-thesis-body">
              A summarizer flattens nuance. A data terminal gives you tables, not tone. FinanceLens is for people who need to
              see <strong>hedging vs. certainty</strong>, <strong>what disappeared quarter over quarter</strong>, and{" "}
              <strong>which claims rest on metrics vs. assertion</strong>—in plain English, with evidence attached.
            </p>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="fl-pillars" aria-labelledby="pillars-heading" id="differentiators">
        <div className="fl-pillars-inner">
          <h2 id="pillars-heading" className="fl-section-title">
            Built for scrutiny—not skimming
          </h2>
          <p className="fl-section-sub">
            Three ideas that separate FinanceLens from &ldquo;drop in a PDF and get a paragraph.&rdquo;
          </p>
          <ul className="fl-pillar-grid">
            <li className="fl-pillar">
              <span className="fl-pillar-num">01</span>
              <h3 className="fl-pillar-title">Intelligence, not compression</h3>
              <p className="fl-pillar-desc">
                Five distinct outputs—each with a job. Translation stays clean; interpretation lives where it belongs. Drift
                and flags surface as <strong>discrete signals</strong>, not buried in generic prose.
              </p>
            </li>
            <li className="fl-pillar">
              <span className="fl-pillar-num">02</span>
              <h3 className="fl-pillar-title">Document-aware analysis</h3>
              <p className="fl-pillar-desc">
                Earnings calls, 10-Ks, and regulatory notices follow different rules. The product switches analytical logic by
                type—guidance tone, risk-factor deltas, enforcement language—instead of one-size-fits-all prompting.
              </p>
            </li>
            <li className="fl-pillar">
              <span className="fl-pillar-num">03</span>
              <h3 className="fl-pillar-title">From document to deck</h3>
              <p className="fl-pillar-desc">
                Analysis is only half the workflow. Generate a <strong>branded, editable Canva presentation</strong> in one
                step—so you can brief a board, a newsroom, or a team without rebuilding slides by hand.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* Five outputs */}
      <section className="fl-features-wrap" aria-labelledby="features-heading" id="outputs">
        <div className="fl-features-head">
          <h2 id="features-heading" className="fl-section-eyebrow fl-section-eyebrow--on-light">
            II · What you get
          </h2>
          <p className="fl-features-hed">Five intelligence sections—structured, attributable, scannable.</p>
        </div>
        <div className="fl-features">
          <div className="fl-features-grid">
            {[
              {
                n: "01",
                title: "Plain language",
                desc: "What they said and what it means—without IR jargon or euphemism.",
              },
              {
                n: "02",
                title: "Interpretation",
                desc: "Direct read on what management is implying, with attribution framing throughout.",
              },
              {
                n: "03",
                title: "Key numbers",
                desc: "Figures with direction, context, and comparison—not isolated metrics floating in space.",
              },
              {
                n: "04",
                title: "Language drift",
                desc: "Phrase-level shifts: hedging vs. definitive, firm vs. new language—tagged and visible.",
              },
              {
                n: "05",
                title: "Flags",
                desc: "Buried disclosures, missing figures, and claims that deserve a second pass.",
              },
              {
                n: "06",
                title: "Compare & export",
                desc: "Two documents: what changed, what vanished, how confidence moved. Then export to Canva.",
              },
            ].map((f) => (
              <div key={f.n} className="fl-feature">
                <p className="fl-feature-num">{f.n}</p>
                <p className="fl-feature-title">{f.title}</p>
                <p className="fl-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="fl-workflow" aria-labelledby="workflow-heading" id="workflow">
        <div className="fl-workflow-inner">
          <h2 id="workflow-heading" className="fl-section-title fl-section-title--light">
            One pipeline from document to decision-ready output
          </h2>
          <ol className="fl-workflow-steps">
            <li className="fl-workflow-step">
              <span className="fl-workflow-label">Ingest</span>
              <span className="fl-workflow-detail">Paste or PDF · pick document type</span>
            </li>
            <li className="fl-workflow-step">
              <span className="fl-workflow-label">Analyze</span>
              <span className="fl-workflow-detail">Five sections · drift tags · confidence</span>
            </li>
            <li className="fl-workflow-step">
              <span className="fl-workflow-label">Present</span>
              <span className="fl-workflow-detail">Share link · Canva deck · compare mode</span>
            </li>
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="fl-cta-band" aria-labelledby="cta-heading" id="start">
        <div className="fl-cta-inner">
          <div>
            <h2 id="cta-heading" className="fl-cta-title">
              Stop reading filings on faith.
            </h2>
            <p className="fl-cta-sub">
              Assistive analysis only—not financial advice. Built for clarity, scrutiny, and defensible read-throughs.
            </p>
          </div>
          <Link href="/analyze" className="fl-btn-primary fl-btn-primary--on-dark">
            Open FinanceLens
          </Link>
        </div>
      </section>

      <footer className="fl-footer">
        <span className="fl-footer-left">FinanceLens AI · hannahkraulikpagade.com</span>
        <span className="fl-footer-disc">
          Assistive analysis only. Not financial advice. Do not make investment decisions based solely on this output.
        </span>
      </footer>
    </div>
  );
}
