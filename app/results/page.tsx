"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";

const TOC_NAV_OFFSET_PX = 100;

type KeyNumber = { value: string; label: string; direction: string };
type DriftSignal = { type: "hedge" | "firm"; quote: string };
type Flag = { text: string };

type Analysis = {
  whatTheySaid: string;
  whatItMeans: string;
  keyNumbers: KeyNumber[];
  driftSignals: DriftSignal[];
  flags: Flag[];
  confidenceScore: number;
  driftCount: number;
  flagCount: number;
};

const SECTIONS = [
  { id: "s1", label: "What they said", dotClass: "fl-app-toc-dot fl-app-toc-dot--muted" },
  { id: "s2", label: "What it means", dotClass: "fl-app-toc-dot fl-app-toc-dot--ink" },
  { id: "s3", label: "Key numbers", dotClass: "fl-app-toc-dot fl-app-toc-dot--green" },
  { id: "s4", label: "Language drift", dotClass: "fl-app-toc-dot fl-app-toc-dot--amber" },
  { id: "s5", label: "Worth a closer look", dotClass: "fl-app-toc-dot fl-app-toc-dot--red" },
] as const;

function statTrendClass(direction: string): string {
  const d = direction.toLowerCase();
  const up = d.startsWith("+") || d.includes("up") || d.includes("strong") || d.includes("growth");
  return up ? "fl-app-stat-dir fl-app-stat-dir--up" : "fl-app-stat-dir fl-app-stat-dir--down";
}

export default function ResultsPage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [docType, setDocType] = useState("");
  const [preview, setPreview] = useState("");
  const [outlineLoading, setOutlineLoading] = useState(false);
  const [outlineModal, setOutlineModal] = useState<{ slides: { headline: string; bullets: string[] }[]; title: string } | null>(null);
  const [outlineError, setOutlineError] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<(typeof SECTIONS)[number]["id"]>("s1");

  useEffect(() => {
    const a = sessionStorage.getItem("fl_analysis");
    const d = sessionStorage.getItem("fl_doctype");
    const p = sessionStorage.getItem("fl_text_preview");
    if (a) setAnalysis(JSON.parse(a));
    if (d) setDocType(d);
    if (p) setPreview(p);
  }, []);

  useEffect(() => {
    if (!outlineModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOutlineModal(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [outlineModal]);

  useEffect(() => {
    if (!analysis) return;

    const ids = SECTIONS.map((s) => s.id);

    const updateActive = () => {
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= TOC_NAV_OFFSET_PX) {
          current = id;
        }
      }
      setActiveSectionId((prev) => (prev === current ? prev : current));
    };

    let raf = 0;
    const onScrollOrResize = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        updateActive();
      });
    };

    const t = window.requestAnimationFrame(() => updateActive());
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    return () => {
      window.cancelAnimationFrame(t);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      cancelAnimationFrame(raf);
    };
  }, [analysis]);

  const openBriefingOutline = async () => {
    if (!analysis) return;
    setOutlineLoading(true);
    setOutlineError("");
    try {
      const res = await fetch("/api/canva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysis),
      });
      const data = await res.json();
      if (data.slideContent) {
        setOutlineModal(data.slideContent);
      } else {
        setOutlineError("Could not generate briefing outline. Please try again.");
      }
    } catch {
      setOutlineError("Something went wrong. Please try again.");
    } finally {
      setOutlineLoading(false);
    }
  };

  if (!analysis) {
    return (
      <div className="fl-app-empty">
        <a href="#fl-empty-main" className="fl-skip-link">
          Skip to content
        </a>
        <div className="fl-app-empty-inner" id="fl-empty-main">
          <p className="fl-app-empty-title">No analysis found</p>
          <Link href="/analyze" className="fl-app-empty-link">
            ← Start a new analysis
          </Link>
        </div>
      </div>
    );
  }

  const docLabel = docType === "earnings" ? "Earnings call" : docType === "tenk" ? "10-K filing" : "Regulatory notice";
  const meterStyle = { "--fl-meter": `${analysis.confidenceScore}%` } as CSSProperties;

  return (
    <div className="fl-app-shell">
      <a href="#main-content" className="fl-skip-link">
        Skip to content
      </a>
      <header className="fl-app-nav">
        <div className="fl-app-nav-start">
          <Link href="/" className="fl-app-logo">
            Finance<span>Lens</span>
          </Link>
        </div>
        <div className="fl-app-nav-end">
          <Link href="/compare" className="fl-app-nav-text">
            Compare
          </Link>
          <Link href="/analyze" className="fl-app-nav-text">
            New analysis
          </Link>
          <button type="button" className="fl-app-nav-btn" onClick={openBriefingOutline} disabled={outlineLoading}>
            {outlineLoading ? "Working…" : "Briefing outline"}
          </button>
        </div>
      </header>

      <div className="fl-app-layout">
        <aside className="fl-app-sidebar">
          <p className="fl-app-doc-title">
            {preview.slice(0, 55)}
            {preview.length > 55 ? "…" : ""}
          </p>
          <p className="fl-app-doc-meta">{docLabel}</p>

          <div className="fl-app-badges">
            <span className="fl-app-badge fl-app-badge--ink">{docLabel}</span>
            {analysis.flagCount > 0 ? (
              <span className="fl-app-badge fl-app-badge--flag">Flags {analysis.flagCount}</span>
            ) : null}
            {analysis.driftCount > 0 ? (
              <span className="fl-app-badge fl-app-badge--drift">Drift {analysis.driftCount}</span>
            ) : null}
          </div>

          <div className="fl-app-sidebar-meter">
            <div className="fl-app-meter-head">
              <span className="fl-app-meter-label">Confidence</span>
              <span className="fl-app-meter-value">{analysis.confidenceScore}%</span>
            </div>
            <div className="fl-app-meter-track">
              <div className="fl-app-meter-fill" style={meterStyle} />
            </div>
          </div>

          <div className="fl-app-rule" />

          <p className="fl-app-toc-label">Sections</p>
          <nav className="fl-app-toc" aria-label="Report sections">
            {SECTIONS.map((s) => {
              const isActive = activeSectionId === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={isActive ? "is-active" : undefined}
                  aria-current={isActive ? "location" : undefined}
                >
                  <span className={s.dotClass} aria-hidden />
                  {s.label}
                </a>
              );
            })}
          </nav>

          <div className="fl-app-rule" />

          <button
            type="button"
            className="fl-app-sidebar-btn fl-app-sidebar-btn--primary"
            onClick={openBriefingOutline}
            disabled={outlineLoading}
          >
            {outlineLoading ? "Working…" : "Briefing outline →"}
          </button>
          <button type="button" className="fl-app-sidebar-btn fl-app-sidebar-btn--ghost" disabled title="Coming soon">
            Share analysis
          </button>

          {outlineError ? <p className="fl-app-sidebar-note">{outlineError}</p> : null}
        </aside>

        <main className="fl-app-main" id="main-content">
          <article className="fl-app-report">
            <header className="fl-print-header">
              <p className="fl-print-kicker">FinanceLens AI — Analysis report</p>
              <h1 className="fl-print-title">
                {preview}
                {preview.length === 120 ? "…" : ""}
              </h1>
              <p className="fl-print-meta">
                {docLabel} · Model confidence {analysis.confidenceScore}% · {analysis.flagCount} flags · {analysis.driftCount}{" "}
                drift signals
                <span className="fl-print-meta-note"> · Assistive analysis only; not financial advice.</span>
              </p>
            </header>

            <section id="s1" className="fl-app-report-section">
              <div className="fl-app-section-head">
                <span className="fl-app-section-num">01</span>
                <h2 className="fl-app-section-title">What they said</h2>
              </div>
              <p className="fl-app-prose">{analysis.whatTheySaid}</p>
            </section>

            <section id="s2" className="fl-app-report-section">
              <div className="fl-app-section-head">
                <span className="fl-app-section-num">02</span>
                <h2 className="fl-app-section-title">What it actually means</h2>
              </div>
              <p className="fl-app-prose">{analysis.whatItMeans}</p>
            </section>

            <section id="s3" className="fl-app-report-section">
              <div className="fl-app-section-head">
                <span className="fl-app-section-num">03</span>
                <h2 className="fl-app-section-title">Key numbers</h2>
              </div>
              <div className="fl-app-stat-grid">
                {analysis.keyNumbers.map((n, i) => (
                  <div key={i} className="fl-app-stat-card">
                    <div className="fl-app-stat-value">{n.value}</div>
                    <div className="fl-app-stat-label">{n.label}</div>
                    <div className={statTrendClass(n.direction)}>{n.direction}</div>
                  </div>
                ))}
              </div>
            </section>

            <section id="s4" className="fl-app-report-section">
              <div className="fl-app-section-head">
                <span className="fl-app-section-num">04</span>
                <h2 className="fl-app-section-title">Language drift</h2>
              </div>
              <div className="fl-app-drift-list">
                {analysis.driftSignals.map((d, i) => (
                  <div key={i} className="fl-app-drift-row">
                    <span
                      className={`fl-app-drift-tag ${d.type === "hedge" ? "fl-app-drift-tag--hedge" : "fl-app-drift-tag--firm"}`}
                    >
                      {d.type}
                    </span>
                    <p className="fl-app-drift-quote">{d.quote}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="s5" className="fl-app-report-section">
              <div className="fl-app-section-head">
                <span className="fl-app-section-num">05</span>
                <h2 className="fl-app-section-title">Worth a closer look</h2>
              </div>
              <div className="fl-app-flags">
                {analysis.flags.map((f, i) => (
                  <div key={i} className="fl-app-flag">
                    <div className="fl-app-flag-label">Flag {i + 1}</div>
                    <p className="fl-app-flag-text">{f.text}</p>
                  </div>
                ))}
              </div>

              <div className="fl-app-confidence">
                <div className="fl-app-meter-head">
                  <span className="fl-app-meter-label">Overall confidence score</span>
                  <span className="fl-app-meter-value">{analysis.confidenceScore}%</span>
                </div>
                <div className="fl-app-meter-track">
                  <div className="fl-app-meter-fill" style={meterStyle} />
                </div>
              </div>
            </section>

            <div className="fl-app-disclaimer">
              <p>
                Assistive analysis only. Not financial advice. Do not make investment decisions based solely on this output.
                FinanceLens AI · hannahkraulikpagade.com
              </p>
            </div>
          </article>
        </main>
      </div>

      {outlineModal ? (
        <div
          className="fl-app-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="outline-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOutlineModal(null);
          }}
        >
          <div className="fl-app-modal">
            <button type="button" className="fl-app-modal-close" onClick={() => setOutlineModal(null)} aria-label="Close">
              ×
            </button>
            <p className="fl-app-modal-eyebrow">Briefing outline</p>
            <h2 id="outline-modal-title" className="fl-app-modal-title">
              {outlineModal.title}
            </h2>
            {outlineModal.slides.map((slide, i) => (
              <div key={i} className="fl-app-modal-block">
                <p className="fl-app-modal-slide-num">Slide {i + 1}</p>
                <p className="fl-app-modal-slide-hed">{slide.headline}</p>
                <ul className="fl-app-modal-list">
                  {slide.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
            <a
              href="https://www.canva.com/create/presentations/"
              target="_blank"
              rel="noreferrer"
              className="fl-app-modal-cta"
            >
              Open Canva to build →
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
