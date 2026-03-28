"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { BriefingDeckPayload } from "@/lib/briefingTypes";
import { persistBriefingDeckForViewer } from "@/lib/briefingDeckStorage";
import { downloadBriefingPptx } from "@/lib/briefingExport";

/** Section is “current” once its top crosses this far down the viewport (handles tall sections). */
function tocTriggerPx(): number {
  if (typeof window === "undefined") return 132;
  return Math.max(96, Math.min(240, window.innerHeight * 0.32));
}

type KeyNumber = { value: string; label: string; direction: string };
type DriftSignal = { type: "hedge" | "firm"; quote: string };
type Flag = { text: string };

type SupportingEvidence = { quote: string; context?: string };

type Analysis = {
  whatTheySaid: string;
  whatItMeans: string;
  keyNumbers: KeyNumber[];
  driftSignals: DriftSignal[];
  flags: Flag[];
  supportingEvidence?: SupportingEvidence[];
  confidenceScore: number | null;
  driftCount: number;
  flagCount: number;
};

type TocSection = { id: string; label: string; dotClass: string };

const SECTION_BASE: readonly TocSection[] = [
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
  const [outlineModal, setOutlineModal] = useState<BriefingDeckPayload | null>(null);
  const [outlineError, setOutlineError] = useState("");
  const [shareError, setShareError] = useState("");
  const [pdfExporting, setPdfExporting] = useState(false);
  const [deckExporting, setDeckExporting] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>("s1");

  const tocSections = useMemo((): TocSection[] => {
    if (!analysis) return [...SECTION_BASE];
    const ev = analysis.supportingEvidence?.length ?? 0;
    if (ev > 0) {
      return [
        SECTION_BASE[0],
        { id: "s1e", label: "Source anchors", dotClass: "fl-app-toc-dot fl-app-toc-dot--ink" },
        ...SECTION_BASE.slice(1),
      ];
    }
    return [...SECTION_BASE];
  }, [analysis]);

  useEffect(() => {
    const a = sessionStorage.getItem("fl_analysis");
    const d = sessionStorage.getItem("fl_doctype");
    const p = sessionStorage.getItem("fl_text_preview");
    if (a) {
      const raw = JSON.parse(a) as Partial<Analysis>;
      setAnalysis({
        whatTheySaid: raw.whatTheySaid ?? "",
        whatItMeans: raw.whatItMeans ?? "",
        keyNumbers: raw.keyNumbers ?? [],
        driftSignals: raw.driftSignals ?? [],
        flags: raw.flags ?? [],
        supportingEvidence: raw.supportingEvidence,
        confidenceScore: raw.confidenceScore ?? null,
        driftCount: raw.driftCount ?? raw.driftSignals?.length ?? 0,
        flagCount: raw.flagCount ?? raw.flags?.length ?? 0,
      });
    }
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

    const ids = tocSections.map((s) => s.id);

    const updateActive = () => {
      const line = tocTriggerPx();
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) {
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

    const initial = window.requestAnimationFrame(() => updateActive());

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    return () => {
      window.cancelAnimationFrame(initial);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      cancelAnimationFrame(raf);
    };
  }, [analysis, tocSections]);

  const handleExportPdf = async () => {
    if (!analysis) return;
    setPdfExporting(true);
    setShareError("");
    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis, docType, preview }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setShareError(typeof data.error === "string" ? data.error : "Could not generate PDF. Try again.");
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition");
      const match = cd?.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "FinanceLens-analysis.pdf";
      const url = URL.createObjectURL(blob);
      try {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.rel = "noopener";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch {
      setShareError("Could not download PDF. Try again or allow downloads for this site.");
    } finally {
      setPdfExporting(false);
    }
  };

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
      const data = (await res.json()) as { slideContent?: BriefingDeckPayload; error?: string };
      if (!res.ok) {
        setOutlineError(typeof data.error === "string" ? data.error : "Could not generate briefing outline. Please try again.");
        return;
      }
      if (data.slideContent?.slides?.length) {
        setOutlineModal(data.slideContent);
      } else {
        setOutlineError(typeof data.error === "string" ? data.error : "Could not generate briefing outline. Please try again.");
      }
    } catch {
      setOutlineError("Something went wrong. Please try again.");
    } finally {
      setOutlineLoading(false);
    }
  };

  const openFullScreenDeck = (content: BriefingDeckPayload) => {
    try {
      persistBriefingDeckForViewer(content);
      const w = window.open("/briefing/deck", "_blank", "noopener,noreferrer");
      if (!w) {
        setOutlineError("Pop-up blocked. Allow pop-ups for this site, or use Download PowerPoint below.");
      }
    } catch {
      setOutlineError("Could not open slide view. Check browser storage permissions or try again.");
    }
  };

  const handleDownloadPptx = async (content: BriefingDeckPayload) => {
    setDeckExporting(true);
    setOutlineError("");
    try {
      await downloadBriefingPptx(content);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setOutlineError(
        `Could not build the PowerPoint file (${msg}). If downloads are blocked, allow downloads for this site.`,
      );
    } finally {
      setDeckExporting(false);
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
  const confPct = analysis.confidenceScore;
  const meterStyle = { "--fl-meter": `${confPct ?? 0}%` } as CSSProperties;
  const hasEvidence = (analysis.supportingEvidence?.length ?? 0) > 0;
  const n = (id: string) => {
    const order = hasEvidence ? ["s1", "s1e", "s2", "s3", "s4", "s5"] : ["s1", "s2", "s3", "s4", "s5"];
    const i = order.indexOf(id);
    return i >= 0 ? String(i + 1).padStart(2, "0") : "—";
  };

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
          <Link href="/methodology" className="fl-app-nav-text">
            Methodology
          </Link>
          <Link href="/analyze" className="fl-app-nav-text">
            New analysis
          </Link>
          <button type="button" className="fl-app-nav-btn" onClick={openBriefingOutline} disabled={outlineLoading}>
            {outlineLoading ? "Working…" : "Briefing deck"}
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
              <span className="fl-app-meter-value">{confPct != null ? `${confPct}%` : "—"}</span>
            </div>
            <div className="fl-app-meter-track">
              <div className="fl-app-meter-fill" style={meterStyle} />
            </div>
          </div>
          <p className="fl-app-sidebar-hint">
            How much concrete, checkable detail is in the source text—not statistical certainty or a stock read.
          </p>

          <div className="fl-app-rule" />

          <p className="fl-app-toc-label">Sections</p>
          <nav className="fl-app-toc" aria-label="Report sections">
            {tocSections.map((s) => {
              const isActive = activeSectionId === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={isActive ? "is-active" : undefined}
                  aria-current={isActive ? "location" : undefined}
                  onClick={() => setActiveSectionId(s.id)}
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
            {outlineLoading ? "Working…" : "Build briefing deck →"}
          </button>
          <button
            type="button"
            className="fl-app-sidebar-btn fl-app-sidebar-btn--ghost"
            onClick={handleExportPdf}
            disabled={pdfExporting}
          >
            {pdfExporting ? "Building PDF…" : "Share as PDF →"}
          </button>

          {outlineError || shareError ? (
            <p className="fl-app-sidebar-note">{outlineError || shareError}</p>
          ) : null}
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
                {docLabel} · Model confidence {confPct != null ? `${confPct}%` : "off"} · {analysis.flagCount} flags ·{" "}
                {analysis.driftCount} drift signals
                <span className="fl-print-meta-note"> · Assistive analysis only; not financial advice.</span>
              </p>
            </header>

            <section id="s1" className="fl-app-report-section">
              <div className="fl-app-section-head">
                <span className="fl-app-section-num">{n("s1")}</span>
                <h2 className="fl-app-section-title">What they said</h2>
              </div>
              <p className="fl-app-prose">{analysis.whatTheySaid}</p>
            </section>

            {hasEvidence ? (
              <section id="s1e" className="fl-app-report-section">
                <div className="fl-app-section-head">
                  <span className="fl-app-section-num">{n("s1e")}</span>
                  <h2 className="fl-app-section-title">Source anchors</h2>
                </div>
                <p className="fl-app-prose fl-app-hint-spaced">
                  Short excerpts from your paste that support the analysis. Always cross-check against the original filing or
                  transcript.
                </p>
                <ul className="fl-app-evidence-list">
                  {analysis.supportingEvidence!.map((e, i) => (
                    <li key={i} className="fl-app-evidence-item">
                      <blockquote className="fl-app-evidence-quote">{e.quote}</blockquote>
                      {e.context ? <p className="fl-app-evidence-ctx">{e.context}</p> : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section id="s2" className="fl-app-report-section">
              <div className="fl-app-section-head">
                <span className="fl-app-section-num">{n("s2")}</span>
                <h2 className="fl-app-section-title">What it actually means</h2>
              </div>
              <p className="fl-app-prose">{analysis.whatItMeans}</p>
            </section>

            <section id="s3" className="fl-app-report-section">
              <div className="fl-app-section-head">
                <span className="fl-app-section-num">{n("s3")}</span>
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
                <span className="fl-app-section-num">{n("s4")}</span>
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
                <span className="fl-app-section-num">{n("s5")}</span>
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
                  <span className="fl-app-meter-value">{confPct != null ? `${confPct}%` : "—"}</span>
                </div>
                <div className="fl-app-meter-track">
                  <div className="fl-app-meter-fill" style={meterStyle} />
                </div>
                <p className="fl-app-sidebar-hint" style={{ marginTop: "12px" }}>
                  Model estimate of how well-supported the analysis is by specifics in your excerpt (numbers, names, firm claims)—not a
                  confidence interval or performance prediction.
                </p>
              </div>
            </section>

            <div className="fl-app-disclaimer">
              <p>
                Assistive analysis only. Not financial advice. Do not make investment decisions based solely on this output.{" "}
                <Link href="/methodology">How FinanceLens works</Link>
                <br />
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
            <p className="fl-app-modal-eyebrow">Briefing deck</p>
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
                {slide.imageUrl ? (
                  <figure className="fl-app-modal-figure">
                    <img src={slide.imageUrl} alt={slide.imageAlt ?? ""} className="fl-app-modal-slide-img" loading="lazy" />
                    {slide.imageCaption ? <figcaption className="fl-app-modal-cap">{slide.imageCaption}</figcaption> : null}
                    {slide.imageAttribution ? (
                      <p className="fl-app-modal-attrib">{slide.imageAttribution}</p>
                    ) : null}
                  </figure>
                ) : null}
              </div>
            ))}
            <div className="fl-app-modal-actions">
              <button
                type="button"
                className="fl-app-modal-btn"
                disabled={deckExporting}
                onClick={() => handleDownloadPptx(outlineModal)}
              >
                {deckExporting ? "Building file…" : "Download PowerPoint (.pptx)"}
              </button>
              <button type="button" className="fl-app-modal-btn fl-app-modal-btn--ghost" onClick={() => openFullScreenDeck(outlineModal)}>
                Open full-screen slides
              </button>
              <a
                href="https://www.canva.com/create/presentations/"
                target="_blank"
                rel="noreferrer"
                className="fl-app-modal-btn fl-app-modal-btn--ghost"
              >
                Polish in Canva (optional)
              </a>
              <p className="fl-app-modal-note">
                With <code className="fl-app-code-inline">UNSPLASH_ACCESS_KEY</code> set, slide photos come from Unsplash (attributed).
                Otherwise optional prompts fall back to abstract generated imagery. Export .pptx or present full-screen; Canva is optional.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
