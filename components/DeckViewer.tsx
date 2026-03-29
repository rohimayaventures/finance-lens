"use client";

import Link from "next/link";
import { PortfolioSiteCredit } from "@/components/PortfolioSiteCredit";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import type { BriefingSlide } from "@/lib/briefingTypes";
import type { CompareResultValidated } from "@/lib/schemas/compare";

type KeyNumber = { value: string; label: string; direction: string };
type DriftSignal = { type: string; quote: string };
type Flag = { text: string };
type SupportingEvidence = { quote: string; context?: string };

export type SharedAnalysis = {
  whatTheySaid?: string;
  whatItMeans?: string;
  keyNumbers?: KeyNumber[];
  driftSignals?: DriftSignal[];
  flags?: Flag[];
  supportingEvidence?: SupportingEvidence[];
  confidenceScore?: number | null;
  driftCount?: number;
  flagCount?: number;
};

export type DeckViewerProps = {
  layout: "briefing" | "analysis" | "compare";
  slides: BriefingSlide[] | null;
  analysis: SharedAnalysis | null;
  /** Validated compare payload when `layout === "compare"`. */
  compareResult?: CompareResultValidated | null;
  /** Stored JSON failed validation — show a clean error. */
  compareInvalid?: boolean;
  expiresAtIso: string;
  homeUrl: string;
};

type PanelKind =
  | "briefing"
  | "analysis-prose"
  | "analysis-evidence"
  | "analysis-stats"
  | "analysis-drift"
  | "analysis-flags"
  | "compare-overview"
  | "compare-columns"
  | "compare-claims"
  | "compare-confidence"
  | "compare-metrics";

type Panel = {
  key: string;
  title: string;
  kind: PanelKind;
  slide?: BriefingSlide;
  analysis?: SharedAnalysis;
  compare?: CompareResultValidated;
};

function statTrendClass(direction: string): string {
  const d = direction.toLowerCase();
  const up = d.startsWith("+") || d.includes("up") || d.includes("strong") || d.includes("growth");
  return up ? "fl-viewer-stat-dir fl-viewer-stat-dir--up" : "fl-viewer-stat-dir fl-viewer-stat-dir--down";
}

function formatExpires(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function sectionLabel(layout: DeckViewerProps["layout"]): string {
  return layout === "briefing" ? "Slide" : "Section";
}

export function DeckViewer({
  layout,
  slides,
  analysis,
  compareResult,
  compareInvalid,
  expiresAtIso,
  homeUrl,
}: DeckViewerProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [fsIndex, setFsIndex] = useState(0);
  const [imgBroken, setImgBroken] = useState<Record<number, boolean>>({});

  const panels: Panel[] = useMemo(() => {
    if (layout === "briefing" && slides?.length) {
      return slides.map((slide, i) => ({
        key: `s-${i}`,
        title: slide.headline,
        kind: "briefing" as const,
        slide,
      }));
    }
    if (layout === "analysis" && analysis) {
      const out: Panel[] = [];
      out.push({
        key: "a1",
        title: "What they said",
        kind: "analysis-prose",
        analysis,
      });
      const ev = analysis.supportingEvidence?.filter((e) => e.quote?.trim()) ?? [];
      if (ev.length > 0) {
        out.push({ key: "a1e", title: "Source anchors", kind: "analysis-evidence", analysis });
      }
      out.push({
        key: "a2",
        title: "What it actually means",
        kind: "analysis-prose",
        analysis,
      });
      out.push({ key: "a3", title: "Key numbers", kind: "analysis-stats", analysis });
      out.push({ key: "a4", title: "Language drift", kind: "analysis-drift", analysis });
      out.push({ key: "a5", title: "Worth a closer look", kind: "analysis-flags", analysis });
      return out;
    }
    if (layout === "compare" && compareResult) {
      const c = compareResult;
      const out: Panel[] = [
        { key: "c0", title: "Overview", kind: "compare-overview", compare: c },
        { key: "c1", title: "New in B · Softened vs A", kind: "compare-columns", compare: c },
        { key: "c2", title: "Claim & tone shifts", kind: "compare-claims", compare: c },
        { key: "c3", title: "Confidence by document", kind: "compare-confidence", compare: c },
      ];
      if (c.metricsNarrative?.trim()) {
        out.push({ key: "c4", title: "Metrics & guidance", kind: "compare-metrics", compare: c });
      }
      return out;
    }
    return [];
  }, [layout, slides, analysis, compareResult]);

  const total = panels.length;
  const safeIndex = total > 0 ? Math.min(Math.max(0, fsIndex), total - 1) : 0;
  const current = total > 0 ? panels[safeIndex] : null;

  const goFs = useCallback(
    (delta: number) => {
      if (total <= 0) return;
      setFsIndex((i) => Math.max(0, Math.min(total - 1, i + delta)));
    },
    [total],
  );

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setFullscreen(false);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goFs(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goFs(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, goFs]);

  const deckTitle =
    layout === "briefing" && slides?.length
      ? slides[0]?.headline?.trim() || "Briefing deck"
      : layout === "compare"
        ? "Document comparison"
        : "Analysis report";

  if (compareInvalid) {
    return (
      <div className="fl-viewer-missing">
        <p className="fl-viewer-missing-title">This comparison could not be displayed.</p>
        <Link href={homeUrl} className="fl-app-nav-btn">
          Back to FinanceLens AI
        </Link>
      </div>
    );
  }

  const renderPanelBody = (p: Panel, mode: "scroll" | "fs", panelIndex: number) => {
    const a = p.analysis;
    const c = p.compare;
    const monoClass = mode === "fs" ? "fl-viewer-fs-mono" : "fl-viewer-scroll-mono";

    if (p.kind === "briefing" && p.slide) {
      const broken = imgBroken[panelIndex] === true;
      return (
        <div className={mode === "fs" ? "fl-viewer-fs-slide-inner" : "fl-viewer-scroll-slide-inner"}>
          {p.slide.bullets.length > 0 ? (
            <ul className={mode === "fs" ? "fl-viewer-fs-list" : "fl-viewer-scroll-list"}>
              {p.slide.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : null}
          {p.slide.imageUrl && !broken ? (
            <figure className={mode === "fs" ? "fl-viewer-fs-fig" : "fl-viewer-scroll-fig"}>
              <img
                src={p.slide.imageUrl}
                alt={p.slide.imageAlt ?? ""}
                className={mode === "fs" ? "fl-viewer-fs-img" : "fl-viewer-scroll-img"}
                onError={() => setImgBroken((m) => ({ ...m, [panelIndex]: true }))}
              />
              {p.slide.imageCaption ? (
                <figcaption className={`${monoClass} fl-viewer-cap`}>{p.slide.imageCaption}</figcaption>
              ) : null}
              {p.slide.imageAttribution ? (
                <p className={`${monoClass} fl-viewer-attrib`}>{p.slide.imageAttribution}</p>
              ) : null}
            </figure>
          ) : null}
        </div>
      );
    }

    if (p.kind === "compare-overview" && c) {
      return <p className={mode === "fs" ? "fl-viewer-fs-prose" : "fl-viewer-scroll-prose"}>{c.overview}</p>;
    }

    if (p.kind === "compare-columns" && c) {
      const colClass = mode === "fs" ? "fl-viewer-compare-col fl-viewer-compare-col--fs" : "fl-viewer-compare-col";
      return (
        <div className={mode === "fs" ? "fl-viewer-compare-cols fl-viewer-compare-cols--fs" : "fl-viewer-compare-cols"}>
          <div className={colClass}>
            <p className={`${monoClass} fl-viewer-compare-col-label`}>New or stronger in B</p>
            <ul className="fl-viewer-scroll-list">
              {c.newLanguage.length ? (
                c.newLanguage.map((item, i) => (
                  <li key={i} className="fl-viewer-compare-li">
                    {item}
                  </li>
                ))
              ) : (
                <li className="fl-viewer-compare-li fl-viewer-compare-li--muted">None listed</li>
              )}
            </ul>
          </div>
          <div className={colClass}>
            <p className={`${monoClass} fl-viewer-compare-col-label`}>Softened or absent vs A</p>
            <ul className="fl-viewer-scroll-list">
              {c.droppedLanguage.length ? (
                c.droppedLanguage.map((item, i) => (
                  <li key={i} className="fl-viewer-compare-li">
                    {item}
                  </li>
                ))
              ) : (
                <li className="fl-viewer-compare-li fl-viewer-compare-li--muted">None listed</li>
              )}
            </ul>
          </div>
        </div>
      );
    }

    if (p.kind === "compare-claims" && c) {
      return (
        <ul className={mode === "fs" ? "fl-viewer-fs-list fl-viewer-compare-shifts" : "fl-viewer-scroll-list fl-viewer-compare-shifts"}>
          {c.claimShifts.length ? (
            c.claimShifts.map((item, i) => (
              <li key={i} className="fl-viewer-compare-shift-row">
                <span className="fl-viewer-compare-shift-badge" aria-hidden>
                  A→B
                </span>
                <span className="fl-viewer-compare-shift-text">{item}</span>
              </li>
            ))
          ) : (
            <li className="fl-viewer-compare-li--muted">None listed</li>
          )}
        </ul>
      );
    }

    if (p.kind === "compare-confidence" && c) {
      const meterStyleA = { "--fl-meter": `${c.confidenceA}%` } as CSSProperties;
      const meterStyleB = { "--fl-meter": `${c.confidenceB}%` } as CSSProperties;
      return (
        <div className={mode === "fs" ? "fl-viewer-compare-confidence fl-viewer-compare-confidence--fs" : "fl-viewer-compare-confidence"}>
          <div className="fl-viewer-compare-confidence-col">
            <p className={`${monoClass} fl-viewer-compare-col-label`}>Document A</p>
            <div className="fl-app-meter-track fl-viewer-compare-meter">
              <div className="fl-app-meter-fill" style={meterStyleA} />
            </div>
            <p className="fl-viewer-compare-pct">{c.confidenceA}%</p>
          </div>
          <div className="fl-viewer-compare-confidence-col">
            <p className={`${monoClass} fl-viewer-compare-col-label`}>Document B</p>
            <div className="fl-app-meter-track fl-viewer-compare-meter">
              <div className="fl-app-meter-fill" style={meterStyleB} />
            </div>
            <p className="fl-viewer-compare-pct">{c.confidenceB}%</p>
          </div>
          {c.confidenceNote?.trim() ? (
            <p className={mode === "fs" ? "fl-viewer-fs-prose fl-viewer-compare-note-full" : "fl-viewer-scroll-prose fl-viewer-compare-note-full"}>
              {c.confidenceNote}
            </p>
          ) : null}
        </div>
      );
    }

    if (p.kind === "compare-metrics" && c) {
      return <p className={mode === "fs" ? "fl-viewer-fs-prose" : "fl-viewer-scroll-prose"}>{c.metricsNarrative}</p>;
    }

    if (!a) return null;

    if (p.kind === "analysis-prose") {
      const prose =
        p.key === "a1" ? (a.whatTheySaid ?? "") : p.key === "a2" ? (a.whatItMeans ?? "") : "";
      return <p className={mode === "fs" ? "fl-viewer-fs-prose" : "fl-viewer-scroll-prose"}>{prose}</p>;
    }

    if (p.kind === "analysis-evidence") {
      const ev = a.supportingEvidence?.filter((e) => e.quote?.trim()) ?? [];
      return (
        <ul className={mode === "fs" ? "fl-viewer-fs-evidence" : "fl-viewer-scroll-evidence"}>
          {ev.map((e, i) => (
            <li key={i}>
              <blockquote className="fl-viewer-quote">{e.quote}</blockquote>
              {e.context ? <p className={monoClass}>{e.context}</p> : null}
            </li>
          ))}
        </ul>
      );
    }

    if (p.kind === "analysis-stats") {
      const kn = a.keyNumbers ?? [];
      return (
        <div className={mode === "fs" ? "fl-viewer-fs-stats" : "fl-viewer-scroll-stats"}>
          {kn.map((n, i) => (
            <div key={i} className="fl-viewer-stat-card">
              <div className="fl-viewer-stat-value">{n.value}</div>
              <div className={`${monoClass} fl-viewer-stat-label`}>{n.label}</div>
              <div className={statTrendClass(n.direction)}>{n.direction}</div>
            </div>
          ))}
        </div>
      );
    }

    if (p.kind === "analysis-drift") {
      const dr = a.driftSignals ?? [];
      return (
        <div className={mode === "fs" ? "fl-viewer-fs-drift" : "fl-viewer-scroll-drift"}>
          {dr.map((d, i) => (
            <div key={i} className="fl-viewer-drift-row">
              <span
                className={`fl-viewer-drift-tag ${d.type === "hedge" ? "fl-viewer-drift-tag--hedge" : "fl-viewer-drift-tag--firm"}`}
              >
                {d.type}
              </span>
              <p className="fl-viewer-drift-quote">{d.quote}</p>
            </div>
          ))}
        </div>
      );
    }

    if (p.kind === "analysis-flags") {
      const flags = a.flags ?? [];
      const conf = a.confidenceScore;
      return (
        <div className={mode === "fs" ? "fl-viewer-fs-flags" : "fl-viewer-scroll-flags"}>
          {flags.map((f, i) => (
            <div key={i} className="fl-viewer-flag">
              <div className={`${monoClass} fl-viewer-flag-label`}>Flag {i + 1}</div>
              <p className="fl-viewer-flag-text">{f.text}</p>
            </div>
          ))}
          <div className="fl-viewer-confidence">
            <div className="fl-viewer-meter-head">
              <span className={monoClass}>Overall confidence</span>
              <span className="fl-viewer-meter-value">{conf != null ? `${conf}%` : "—"}</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (layout === "compare" && (!compareResult || total === 0)) {
    return (
      <div className="fl-viewer-missing">
        <p className="fl-viewer-missing-title">This comparison could not be displayed.</p>
        <Link href={homeUrl} className="fl-app-nav-btn">
          Back to FinanceLens AI
        </Link>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="fl-viewer-missing">
        <p className="fl-viewer-missing-title">This deck has expired or does not exist</p>
        <Link href={homeUrl} className="fl-app-nav-btn">
          Back to FinanceLens AI
        </Link>
      </div>
    );
  }

  return (
    <div className="fl-viewer-root">
      <header className="fl-viewer-topbar">
        <div className="fl-viewer-topbar-text">
          <p className="fl-viewer-expires">This deck expires on {formatExpires(expiresAtIso)}</p>
          <p className="fl-viewer-deck-title">{deckTitle}</p>
        </div>
        <button
          type="button"
          className="fl-app-nav-btn fl-viewer-fs-toggle"
          onClick={() => setFullscreen((v) => !v)}
        >
          {fullscreen ? "Exit full screen" : "Full screen"}
        </button>
      </header>

      <main className="fl-viewer-scroll">
        {panels.map((p, i) => (
          <article key={p.key} className="fl-viewer-card">
            <p className="fl-viewer-card-num">{sectionLabel(layout) + " " + (i + 1)}</p>
            <h2 className="fl-viewer-card-title">{p.title}</h2>
            <div className="fl-viewer-card-body">{renderPanelBody(p, "scroll", i)}</div>
            <footer className="fl-viewer-card-footer">
              <span className="fl-viewer-powered">Powered by FinanceLens AI</span>
              <Link href={homeUrl} className="fl-viewer-home-link">
                {homeUrl.replace(/^https?:\/\//, "")}
              </Link>
            </footer>
          </article>
        ))}
      </main>

      <footer className="fl-viewer-page-foot">
        <p className="fl-viewer-disclaimer">
          Assistive analysis only; not financial advice.{" "}
          <Link href={`${homeUrl}/methodology`}>How FinanceLens works</Link>
        </p>
        <p className="fl-viewer-portfolio">
          <PortfolioSiteCredit className="fl-footer-portfolio-link" />
        </p>
      </footer>

      {fullscreen && current ? (
        <div className="fl-viewer-fs-overlay" role="presentation">
          <button type="button" className="fl-viewer-fs-close" onClick={() => setFullscreen(false)} aria-label="Exit full screen">
            ×
          </button>
          <p className="fl-viewer-fs-counter">
            {safeIndex + 1} / {total}
          </p>
          <button
            type="button"
            className="fl-viewer-fs-arrow fl-viewer-fs-arrow--left"
            onClick={() => goFs(-1)}
            disabled={safeIndex <= 0}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            type="button"
            className="fl-viewer-fs-arrow fl-viewer-fs-arrow--right"
            onClick={() => goFs(1)}
            disabled={safeIndex >= total - 1}
            aria-label="Next slide"
          >
            ›
          </button>
          <div className="fl-viewer-fs-stage">
            <p className="fl-viewer-fs-kicker">{sectionLabel(layout) + " " + (safeIndex + 1)}</p>
            <h2 className="fl-viewer-fs-headline">{current.title}</h2>
            <div className="fl-viewer-fs-content">{renderPanelBody(current, "fs", safeIndex)}</div>
            <p className="fl-viewer-fs-powered">Powered by FinanceLens AI</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
