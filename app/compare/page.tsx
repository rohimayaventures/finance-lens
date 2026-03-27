"use client";

import Link from "next/link";
import type { CSSProperties, FormEvent } from "react";
import { useState } from "react";

type DocType = "earnings" | "tenk" | "regulatory";

type CompareResult = {
  overview: string;
  newLanguage: string[];
  droppedLanguage: string[];
  confidenceA: number;
  confidenceB: number;
  confidenceNote: string;
  claimShifts: string[];
  metricsNarrative: string;
};

const DOC_TYPE_OPTIONS: Array<{ value: DocType; label: string }> = [
  { value: "earnings", label: "Earnings call" },
  { value: "tenk", label: "10-K filing" },
  { value: "regulatory", label: "Regulatory notice" },
];

function ListBlock({ title, items, id }: { title: string; items: string[]; id: string }) {
  if (!items.length) return null;
  return (
    <section id={id} className="fl-app-report-section fl-compare-result-block">
      <div className="fl-app-section-head">
        <span className="fl-app-section-num">◇</span>
        <h2 className="fl-app-section-title">{title}</h2>
      </div>
      <ul className="fl-compare-list">
        {items.map((item, i) => (
          <li key={i} className="fl-app-prose fl-compare-list-item">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ComparePage() {
  const [docType, setDocType] = useState<DocType>("earnings");
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CompareResult | null>(null);

  const canSubmit = textA.trim().length > 0 && textB.trim().length > 0 && !loading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textA, textB, docType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Compare failed. Please try again.");
        return;
      }
      setResult(data as CompareResult);
    } catch {
      setError("Compare failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const docLabel = DOC_TYPE_OPTIONS.find((o) => o.value === docType)?.label ?? "Document";

  return (
    <div className="fl-app-shell fl-app-shell--compare">
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
            Single document
          </Link>
        </div>
      </header>

      <div className="fl-app-layout">
        <aside className="fl-app-sidebar">
          <p className="fl-app-label">Document type</p>
          <div className="fl-app-stack">
            {DOC_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDocType(option.value)}
                className={`fl-app-choice${option.value === docType ? " is-active" : ""}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="fl-app-rule" />
          <p className="fl-compare-sidebar-note">
            Place the <strong>earlier</strong> period or version in <strong>Document A</strong> and the <strong>later</strong> one in{" "}
            <strong>Document B</strong> for clearest drift readouts.
          </p>
        </aside>

        <main className="fl-app-main" id="main-content">
          <form onSubmit={handleSubmit} className="fl-app-form fl-compare-form">
            <div className="fl-compare-form-header">
              <h1 className="fl-compare-page-title">Compare documents</h1>
              <p className="fl-compare-page-lede">
                Two filings side by side—new language, dropped emphasis, and confidence shift between texts.
              </p>
            </div>

            <div className="fl-compare-docs">
              <div className="fl-compare-panel">
                <label className="fl-app-label fl-app-label--flush" htmlFor="compare-a">
                  Document A
                </label>
                <textarea
                  id="compare-a"
                  value={textA}
                  onChange={(ev) => setTextA(ev.target.value)}
                  className="fl-app-textarea fl-compare-textarea"
                  placeholder="Earlier quarter, prior 10-K, or first regulatory draft..."
                  aria-label="Document A text"
                />
              </div>
              <div className="fl-compare-panel">
                <label className="fl-app-label fl-app-label--flush" htmlFor="compare-b">
                  Document B
                </label>
                <textarea
                  id="compare-b"
                  value={textB}
                  onChange={(ev) => setTextB(ev.target.value)}
                  className="fl-app-textarea fl-compare-textarea"
                  placeholder="Later quarter, current 10-K, or revised order..."
                  aria-label="Document B text"
                />
              </div>
            </div>

            <button type="submit" disabled={!canSubmit} className="fl-app-submit">
              {loading ? "Comparing…" : "Run comparison"}
            </button>

            {error ? <p className="fl-app-error">{error}</p> : null}
          </form>

          {result ? (
            <article className="fl-app-report fl-compare-results" aria-label="Comparison results">
              <header className="fl-compare-print-head">
                <p className="fl-compare-print-kicker">FinanceLens AI — Document comparison</p>
                <h1 className="fl-compare-print-title">{docLabel}</h1>
                <p className="fl-compare-print-meta">
                  Confidence A {result.confidenceA}% · Confidence B {result.confidenceB}%
                  <span className="fl-print-meta-note"> · Assistive analysis only; not financial advice.</span>
                </p>
              </header>

              <section className="fl-app-report-section">
                <div className="fl-app-section-head">
                  <span className="fl-app-section-num">↔</span>
                  <h2 className="fl-app-section-title">Overview</h2>
                </div>
                <p className="fl-app-prose">{result.overview}</p>
              </section>

              <section className="fl-app-report-section">
                <div className="fl-app-section-head">
                  <span className="fl-app-section-num">01</span>
                  <h2 className="fl-app-section-title">Confidence</h2>
                </div>
                <div className="fl-compare-confidence-row">
                  <div>
                    <p className="fl-app-label fl-app-label--flush fl-compare-meter-cap">Document A</p>
                    <div className="fl-app-meter-track">
                      <div className="fl-app-meter-fill" style={{ "--fl-meter": `${result.confidenceA}%` } as CSSProperties} />
                    </div>
                    <p className="fl-compare-confidence-pct">{result.confidenceA}%</p>
                  </div>
                  <div>
                    <p className="fl-app-label fl-app-label--flush fl-compare-meter-cap">Document B</p>
                    <div className="fl-app-meter-track">
                      <div className="fl-app-meter-fill" style={{ "--fl-meter": `${result.confidenceB}%` } as CSSProperties} />
                    </div>
                    <p className="fl-compare-confidence-pct">{result.confidenceB}%</p>
                  </div>
                </div>
                {result.confidenceNote ? <p className="fl-app-prose fl-app-hint-spaced">{result.confidenceNote}</p> : null}
              </section>

              {result.metricsNarrative ? (
                <section className="fl-app-report-section">
                  <div className="fl-app-section-head">
                    <span className="fl-app-section-num">02</span>
                    <h2 className="fl-app-section-title">Metrics & guidance</h2>
                  </div>
                  <p className="fl-app-prose">{result.metricsNarrative}</p>
                </section>
              ) : null}

              <ListBlock id="compare-new" title="New or stronger language in B" items={result.newLanguage} />
              <ListBlock id="compare-dropped" title="Softened or absent vs. A" items={result.droppedLanguage} />
              <ListBlock id="compare-claims" title="Claim & tone shifts" items={result.claimShifts} />

              <div className="fl-app-disclaimer">
                <p>
                  Assistive analysis only. Not financial advice. Do not make investment decisions based solely on this output.
                  FinanceLens AI · hannahkraulikpagade.com
                </p>
              </div>
            </article>
          ) : null}
        </main>
      </div>
    </div>
  );
}
