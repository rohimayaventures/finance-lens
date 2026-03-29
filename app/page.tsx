"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PortfolioSiteCredit } from "@/components/PortfolioSiteCredit";

export default function Home() {
  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false);
  const closeSectionMenu = () => setIsSectionMenuOpen(false);

  return (
    <div className="fl-page">
      <a href="#main-content" className="fl-skip-link">
        Skip to content
      </a>
      <div className="fl-ambient" aria-hidden>
        <div className="fl-ambient-orb fl-ambient-orb--ruby" />
        <div className="fl-ambient-orb fl-ambient-orb--forest" />
        <div className="fl-ambient-orb fl-ambient-orb--cream" />
      </div>

      <nav className="fl-nav" aria-label="Primary">
        <Link href="/" className="fl-logo fl-logo--display fl-logo--with-mark">
          <Image
            src="/finance-lens-mark.png"
            alt=""
            width={40}
            height={40}
            className="fl-logo-mark"
            priority
            aria-hidden
          />
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

      <main className="fl-lp-main" id="main-content">
        <header className="fl-lp-hero" id="overview">
          <div className="fl-lp-hero-grid">
            <div className="fl-lp-hero-copy">
              <div className="fl-lp-kicker-row">
                <span className="fl-lp-kicker-line" aria-hidden />
                <p className="fl-lp-kicker">Financial document intelligence</p>
              </div>
              <h1 className="fl-lp-title">
                Read what they
                <br />
                <span className="fl-lp-title-accent">actually</span> said.
              </h1>
              <p className="fl-lp-lede">
                Filings and calls are engineered to disclose—and steer. FinanceLens closes the gap between the page and the
                signal: <strong>translation plus intelligence</strong>, not a flattening summary.
              </p>
              <p className="fl-lp-lede-mono">
                Paste text or upload PDF (text extraction, not scanned pages). Five structured sections—plain language,
                interpretation, key metrics, drift, and flags—plus compare mode and export-ready briefing layouts.
              </p>
              <div className="fl-hero-actions fl-lp-actions">
                <Link href="/analyze" className="fl-btn-primary">
                  Try it free →
                </Link>
                <Link href="/analyze?sample=earnings" className="fl-btn-ghost fl-btn-ghost--cream">
                  See an example
                </Link>
                <span className="fl-hero-note">No login required</span>
              </div>
            </div>

            <div className="fl-lp-hero-right">
              <div className="fl-lp-hero-visual">
                <Image
                  src="/hero.webp"
                  alt="FinanceLens AI — structured analysis of filings and earnings calls"
                  width={1200}
                  height={630}
                  className="fl-lp-hero-img"
                  priority
                  sizes="(max-width: 900px) 100vw, min(480px, 42vw)"
                />
              </div>
              <aside className="fl-lp-aside" aria-label="Example signals">
                <div className="fl-lp-aside-frame">
                <p className="fl-lp-aside-label">Live signal stack</p>
                <div className="fl-lp-signals">
                  <div className="fl-lp-signal">
                    <span className="fl-lp-tag fl-lp-tag--source">Source</span>
                    <p className="fl-lp-signal-quote">
                      &ldquo;We believe we are well-positioned to deliver on our revised guidance range...&rdquo;
                    </p>
                  </div>
                  <div className="fl-lp-signal fl-lp-signal--drift">
                    <span className="fl-lp-tag fl-lp-tag--drift">Drift</span>
                    <p className="fl-lp-signal-strong">
                      Q2: &ldquo;confident we will deliver&rdquo; → Q3: &ldquo;believe we are positioned&rdquo;
                    </p>
                  </div>
                  <div className="fl-lp-signal fl-lp-signal--flag">
                    <span className="fl-lp-tag fl-lp-tag--flag">Flag</span>
                    <p className="fl-lp-signal-strong">
                      Consumer revenue—no figure disclosed. Uneven airtime vs. enterprise narrative.
                    </p>
                  </div>
                </div>
                <div className="fl-lp-aside-corner fl-lp-aside-corner--tl" aria-hidden />
                <div className="fl-lp-aside-corner fl-lp-aside-corner--br" aria-hidden />
                </div>
              </aside>
            </div>
          </div>
        </header>

        <section className="fl-lp-thesis" aria-labelledby="thesis-heading" id="problem">
          <div className="fl-lp-thesis-inner">
            <div className="fl-lp-thesis-mark" aria-hidden />
            <div>
              <h2 id="thesis-heading" className="fl-lp-eyebrow">
                I · The problem
              </h2>
              <p className="fl-lp-pullquote">
                The signals that matter are in the <em>language</em>, not just the numbers.
              </p>
              <p className="fl-lp-prose">
                A summarizer erases tone. A terminal shows tables, not evasion. FinanceLens is for readers who need{" "}
                <strong>hedging versus certainty</strong>, <strong>what vanished quarter over quarter</strong>, and{" "}
                <strong>claims backed by metrics versus pure assertion</strong>—in plain English, with receipts.
              </p>
            </div>
          </div>
        </section>

        <section className="fl-lp-pillars" aria-labelledby="pillars-heading" id="differentiators">
          <div className="fl-lp-pillars-inner">
            <h2 id="pillars-heading" className="fl-lp-section-title">
              Built for scrutiny—not skimming
            </h2>
            <p className="fl-lp-section-sub">
              Three ideas that separate FinanceLens from &ldquo;drop in a PDF and get a paragraph.&rdquo;
            </p>
            <ul className="fl-lp-bento">
              <li className="fl-lp-bento-card">
                <span className="fl-lp-bento-num">01</span>
                <h3 className="fl-lp-bento-title">Intelligence, not compression</h3>
                <p className="fl-lp-bento-desc">
                  Five distinct outputs—each with a job. Translation stays clean; interpretation lives where it belongs. Drift
                  and flags surface as <strong>discrete signals</strong>, not prose graffiti.
                </p>
              </li>
              <li className="fl-lp-bento-card">
                <span className="fl-lp-bento-num">02</span>
                <h3 className="fl-lp-bento-title">Document-aware analysis</h3>
                <p className="fl-lp-bento-desc">
                  Earnings calls, 10-Ks, and regulatory notices follow different rules. Logic switches by type—guidance tone,
                  risk-factor deltas, enforcement language—never one lazy prompt.
                </p>
              </li>
              <li className="fl-lp-bento-card fl-lp-bento-card--wide">
                <span className="fl-lp-bento-num">03</span>
                <h3 className="fl-lp-bento-title">From document to deliverable</h3>
                <p className="fl-lp-bento-desc">
                  Analysis is half the workflow. Export a <strong>briefing-ready layout</strong>—structured sections,
                  scannable metrics, drift callouts—so you can brief a board or newsroom without rebuilding the narrative by
                  hand.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section className="fl-lp-features" aria-labelledby="features-heading" id="outputs">
          <div className="fl-lp-features-head">
            <h2 id="features-heading" className="fl-lp-eyebrow">
              II · What you get
            </h2>
            <p className="fl-lp-features-hed">Five intelligence sections—structured, attributable, scannable.</p>
          </div>
          <div className="fl-lp-features-grid-wrap">
            <div className="fl-lp-features-grid">
              {[
                { n: "01", title: "Plain language", desc: "The official narrative, stripped of IR fog—without smuggling in interpretation." },
                { n: "02", title: "Interpretation", desc: "What the language implies, framed with consistent attribution—not advice." },
                { n: "03", title: "Key numbers", desc: "Figures with direction, context, and comparison—not orphans on a slide." },
                { n: "04", title: "Language drift", desc: "Phrase-level shifts: hedging versus definitive—tagged and visible." },
                { n: "05", title: "Flags", desc: "Buried disclosures, missing figures, claims that earn a second pass." },
                { n: "06", title: "Compare & export", desc: "Two documents: what changed, what disappeared, how confidence moved—then take it with you." },
              ].map((f) => (
                <div key={f.n} className="fl-lp-feature-cell">
                  <p className="fl-lp-feature-num">{f.n}</p>
                  <p className="fl-lp-feature-title">{f.title}</p>
                  <p className="fl-lp-feature-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="fl-lp-workflow" aria-labelledby="workflow-heading" id="workflow">
          <div className="fl-lp-workflow-inner">
            <h2 id="workflow-heading" className="fl-lp-workflow-title">
              One pipeline from document to decision-ready output
            </h2>
            <ol className="fl-lp-workflow-steps">
              <li className="fl-lp-workflow-step">
                <span className="fl-lp-workflow-label">Ingest</span>
                <span className="fl-lp-workflow-detail">
                  Paste text or upload PDF (text extraction, not scanned pages) · pick document type
                </span>
              </li>
              <li className="fl-lp-workflow-step">
                <span className="fl-lp-workflow-label">Analyze</span>
                <span className="fl-lp-workflow-detail">Five sections · drift tags · confidence</span>
              </li>
              <li className="fl-lp-workflow-step">
                <span className="fl-lp-workflow-label">Deliver</span>
                <span className="fl-lp-workflow-detail">Share link · export · compare mode</span>
              </li>
            </ol>
          </div>
        </section>

        <section className="fl-lp-cta" aria-labelledby="cta-heading" id="start">
          <div className="fl-lp-cta-inner">
            <div>
              <h2 id="cta-heading" className="fl-lp-cta-title">
                Stop reading filings on faith.
              </h2>
              <p className="fl-lp-cta-sub">
                Assistive analysis only—not financial advice. Built for clarity, scrutiny, and defensible read-throughs.
              </p>
            </div>
            <Link href="/analyze" className="fl-btn-primary fl-btn-primary--on-dark">
              Open FinanceLens
            </Link>
          </div>
        </section>

        <footer className="fl-lp-footer">
          <span className="fl-lp-footer-left">
            FinanceLens AI · <PortfolioSiteCredit className="fl-footer-portfolio-link" />
          </span>
          <span className="fl-lp-footer-disc">
            <Link href="/methodology">Methodology</Link>
            <span aria-hidden className="fl-lp-footer-sep">
              {" · "}
            </span>
            Assistive analysis only. Not financial advice. Do not make investment decisions based solely on this output.
          </span>
        </footer>
      </main>
    </div>
  );
}
