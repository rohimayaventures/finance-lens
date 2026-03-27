"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Analysis = {
  whatTheySaid: string;
  whatItMeans: string;
  keyNumbers: Array<{ value: string; label: string; direction: string }>;
  driftSignals: Array<{ type: "hedge" | "firm"; quote: string }>;
  flags: Array<{ text: string }>;
  confidenceScore: number;
  driftCount: number;
  flagCount: number;
};

type SlideContent = {
  title: string;
  slides: Array<{ headline: string; bullets: string[] }>;
};

const sectionLinks = [
  { id: "section-1", label: "What they said", color: "var(--gray-4)" },
  { id: "section-2", label: "What it actually means", color: "var(--ink)" },
  { id: "section-3", label: "Key numbers", color: "var(--green)" },
  { id: "section-4", label: "Language drift", color: "var(--amber)" },
  { id: "section-5", label: "Worth a closer look", color: "var(--red)" },
] as const;

function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export default function ResultsPage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [docType, setDocType] = useState("");
  const [preview, setPreview] = useState("");
  const [canvaLoading, setCanvaLoading] = useState(false);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [slideContent, setSlideContent] = useState<SlideContent | null>(null);

  useEffect(() => {
    const rawAnalysis = sessionStorage.getItem("fl_analysis");
    const rawDocType = sessionStorage.getItem("fl_doctype");
    const rawPreview = sessionStorage.getItem("fl_text_preview");

    if (!rawAnalysis || !rawDocType || !rawPreview) {
      setAnalysis(null);
      return;
    }

    try {
      const parsed = JSON.parse(rawAnalysis) as Analysis;
      setAnalysis(parsed);
      setDocType(rawDocType);
      setPreview(rawPreview);
    } catch (_err) {
      setAnalysis(null);
    }
  }, []);

  const safeAnalysis = useMemo(() => {
    if (!analysis) return null;
    return {
      ...analysis,
      confidenceScore: clampPercent(analysis.confidenceScore),
      driftCount: analysis.driftCount ?? analysis.driftSignals.length,
      flagCount: analysis.flagCount ?? analysis.flags.length,
    };
  }, [analysis]);

  const handleGenerateCanva = async () => {
    if (!safeAnalysis) return;

    setCanvaLoading(true);

    try {
      const response = await fetch("/api/canva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safeAnalysis),
      });

      if (!response.ok) throw new Error("Canva request failed");

      const payload = (await response.json()) as { slideContent?: SlideContent; success?: boolean };
      if (!payload.slideContent) throw new Error("No slide content returned");
      setSlideContent(payload.slideContent);
      setIsOutlineOpen(true);
    } catch (_err) {
      setSlideContent({
        title: "FinanceLens AI presentation",
        slides: [
          {
            headline: "Could not generate outline",
            bullets: ["Please try again in a moment.", "If this continues, refresh and retry.", "You can still open Canva manually."],
          },
        ],
      });
      setIsOutlineOpen(true);
    } finally {
      setCanvaLoading(false);
    }
  };

  if (!safeAnalysis) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--cream)] px-4 text-center">
        <div className="max-w-md">
          <h1 className="mb-3 text-[28px] font-bold">No analysis found</h1>
          <p className="mb-5 text-[16px]" style={{ color: "var(--gray-5)" }}>
            Run an analysis first, then come back to view results.
          </p>
          <Link
            href="/analyze"
            className="mono inline-flex rounded-[2px] px-4 py-3 text-[14px] uppercase tracking-[0.12em]"
            style={{ background: "var(--ink)", color: "#fff" }}
          >
            Go to Analyze
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--cream)] text-[var(--ink)]">
      <nav
        className="sticky top-0 z-40 flex min-h-14 items-center justify-between border-b border-black/15 px-4 sm:px-6"
        style={{ background: "var(--ink)" }}
      >
        <Link href="/" className="text-2xl leading-none text-white">
          Finance<span style={{ color: "var(--red)" }}>Lens</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/analyze"
            className="mono inline-flex rounded-[2px] border px-3 py-2 text-[14px] uppercase tracking-[0.12em]"
            style={{ borderColor: "rgba(255,255,255,0.35)", color: "#fff" }}
          >
            New analysis
          </Link>
          <button
            type="button"
            onClick={handleGenerateCanva}
            className="mono rounded-[2px] px-3 py-2 text-[14px] uppercase tracking-[0.12em]"
            style={{ background: "var(--red)", color: "#fff" }}
            disabled={canvaLoading}
          >
            {canvaLoading ? "Generating..." : "Generate Canva deck"}
          </button>
        </div>
      </nav>

      <div className="grid min-h-[calc(100dvh-56px)] grid-cols-1 md:grid-cols-[220px_1fr]">
        <aside
          className="hidden border-b border-r-0 md:sticky md:top-14 md:flex md:h-[calc(100dvh-56px)] md:min-w-[220px] md:flex-col md:overflow-y-auto md:border-b-0 md:border-r md:gap-6"
          style={{ background: "var(--gray-1)", borderColor: "#E0DCD4", padding: "28px 20px" }}
        >
          <p className="text-[14px] leading-relaxed" style={{ color: "var(--gray-5)" }}>
            {preview.slice(0, 60)}...
          </p>

          <div className="flex flex-wrap gap-3">
            <span className="mono rounded-[2px] px-2 py-1 text-[13px]" style={{ background: "var(--ink)", color: "#fff" }}>
              {docType}
            </span>
            <span className="mono rounded-[2px] px-2 py-1 text-[13px]" style={{ background: "var(--red)", color: "#fff" }}>
              Flags {safeAnalysis.flagCount}
            </span>
            <span className="mono rounded-[2px] px-2 py-1 text-[13px]" style={{ background: "var(--amber)", color: "#fff" }}>
              Drift {safeAnalysis.driftCount}
            </span>
          </div>

          <div>
            <p className="mono mb-3 text-[13px] uppercase tracking-[0.12em]" style={{ color: "var(--gray-5)" }}>
              Confidence
            </p>
            <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: "var(--gray-3)" }}>
              <div className="h-full" style={{ width: `${safeAnalysis.confidenceScore}%`, background: "var(--ink)" }} />
            </div>
            <p className="mono mt-3 text-[13px] font-bold" style={{ color: "var(--ink)" }}>
              {safeAnalysis.confidenceScore}%
            </p>
          </div>

          <div className="h-px" style={{ background: "var(--gray-2)" }} />

          <div className="flex flex-col">
            {sectionLinks.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="mono flex items-center gap-2 py-2 text-[13px]"
                style={{ color: "var(--gray-5)" }}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                {item.label}
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={handleGenerateCanva}
            className="mono w-full rounded-[2px] px-3 py-3 text-[14px] uppercase tracking-[0.12em]"
            style={{ background: "var(--red)", color: "#fff" }}
            disabled={canvaLoading}
          >
            {canvaLoading ? "Generating..." : "Generate Canva deck →"}
          </button>
          <button
            type="button"
            className="mono w-full rounded-[2px] border px-3 py-3 text-[14px] uppercase tracking-[0.12em]"
            style={{ borderColor: "var(--gray-3)", color: "var(--gray-5)", background: "#fff" }}
          >
            Share analysis
          </button>
        </aside>

        <main className="max-h-[calc(100dvh-56px)] overflow-y-auto px-5 py-6 md:px-12 md:py-12">
          <div className="mx-auto flex w-full max-w-[860px] flex-col pb-10">
            <section id="section-1" className="mb-8 overflow-hidden rounded-[2px] border last:mb-0" style={{ borderColor: "var(--gray-2)", background: "#fff" }}>
              <header className="px-5 py-4" style={{ background: "var(--gray-1)", borderBottom: "2px solid #1C1C1E" }}>
                <p className="mono text-[13px] tracking-[0.12em]" style={{ color: "var(--red)" }}>01</p>
                <h2 className="text-[28px] font-bold">What they said</h2>
              </header>
              <div className="p-8">
                <p className="text-[18px] leading-[1.9]" style={{ color: "#444", maxWidth: "680px" }}>{safeAnalysis.whatTheySaid}</p>
              </div>
            </section>

            <section id="section-2" className="mb-8 overflow-hidden rounded-[2px] border last:mb-0" style={{ borderColor: "var(--gray-2)", background: "#fff" }}>
              <header className="px-5 py-4" style={{ background: "var(--gray-1)", borderBottom: "2px solid #1C1C1E" }}>
                <p className="mono text-[13px] tracking-[0.12em]" style={{ color: "var(--red)" }}>02</p>
                <h2 className="text-[28px] font-bold">What it actually means</h2>
              </header>
              <div className="p-8">
                <p className="text-[18px] leading-[1.9]" style={{ color: "#444", maxWidth: "680px" }}>{safeAnalysis.whatItMeans}</p>
              </div>
            </section>

            <section id="section-3" className="mb-8 overflow-hidden rounded-[2px] border last:mb-0" style={{ borderColor: "var(--gray-2)", background: "#fff" }}>
              <header className="px-5 py-4" style={{ background: "var(--gray-1)", borderBottom: "2px solid #1C1C1E" }}>
                <p className="mono text-[13px] tracking-[0.12em]" style={{ color: "var(--red)" }}>03</p>
                <h2 className="text-[28px] font-bold">Key numbers</h2>
              </header>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-5 p-8">
                {safeAnalysis.keyNumbers.map((item, idx) => {
                  const directionLower = item.direction.toLowerCase();
                  const isUp = directionLower.startsWith("+") || directionLower.includes("up");
                  const directionColor = isUp ? "var(--green)" : "var(--red)";

                  return (
                    <article key={`${item.label}-${idx}`} className="rounded-[2px] border p-5" style={{ background: "var(--gray-1)", borderColor: "var(--gray-2)", minWidth: "160px" }}>
                      <p className="mono text-[36px] font-bold leading-none" style={{ color: "var(--ink)" }}>{item.value}</p>
                      <p className="mono mt-1 text-[13px] uppercase tracking-[0.1em]" style={{ color: "var(--gray-4)" }}>{item.label}</p>
                      <p className="mono mt-2 text-[13px] font-bold" style={{ color: directionColor }}>{item.direction}</p>
                    </article>
                  );
                })}
              </div>
            </section>

            <section id="section-4" className="mb-8 overflow-hidden rounded-[2px] border last:mb-0" style={{ borderColor: "var(--gray-2)", background: "#fff" }}>
              <header className="px-5 py-4" style={{ background: "var(--gray-1)", borderBottom: "2px solid #1C1C1E" }}>
                <p className="mono text-[13px] tracking-[0.12em]" style={{ color: "var(--red)" }}>04</p>
                <h2 className="text-[28px] font-bold">Language drift</h2>
              </header>
              <div className="p-8">
                {safeAnalysis.driftSignals.map((signal, idx) => {
                  const isHedge = signal.type === "hedge";
                  const pillStyle = isHedge
                    ? { background: "var(--amber-light)", color: "var(--amber)", borderColor: "var(--amber-border)" }
                    : { background: "var(--green-light)", color: "var(--green)", borderColor: "var(--green-border)" };

                  return (
                    <article key={`${signal.quote}-${idx}`} className="flex items-start gap-3 border-b py-3 last:border-b-0" style={{ borderColor: "#F4F2EE" }}>
                      <span className="mono rounded-[99px] border px-2 py-1 text-[13px] uppercase tracking-[0.1em]" style={pillStyle}>
                        {signal.type}
                      </span>
                      <p className="mono pt-2 text-[14px] leading-[1.55]" style={{ color: "var(--gray-5)" }}>{signal.quote}</p>
                    </article>
                  );
                })}
              </div>
            </section>

            <section id="section-5" className="mb-8 overflow-hidden rounded-[2px] border last:mb-0" style={{ borderColor: "var(--gray-2)", background: "#fff" }}>
              <header className="px-5 py-4" style={{ background: "var(--gray-1)", borderBottom: "2px solid #1C1C1E" }}>
                <p className="mono text-[13px] tracking-[0.12em]" style={{ color: "var(--red)" }}>05</p>
                <h2 className="text-[28px] font-bold">Worth a closer look</h2>
              </header>
              <div className="p-8">
                {safeAnalysis.flags.map((flag, idx) => (
                  <article
                    key={`${flag.text}-${idx}`}
                    className="mb-[10px] rounded-[2px] border px-[22px] py-[18px] last:mb-0"
                    style={{
                      borderLeftWidth: "3px",
                      borderColor: "var(--red-border)",
                      borderLeftColor: "var(--red)",
                      background: "var(--red-light)",
                    }}
                  >
                    <p className="mono mb-1 text-[13px] font-bold" style={{ color: "var(--red)" }}>
                      Flag {idx + 1}
                    </p>
                    <p className="mono text-[14px] leading-[1.55]" style={{ color: "#5A1A1A" }}>
                      {flag.text}
                    </p>
                  </article>
                ))}

                <div className="mt-2">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="mono text-[13px] uppercase tracking-[0.12em]" style={{ color: "var(--gray-5)" }}>
                      Overall confidence
                    </span>
                    <span className="mono text-[13px] font-bold" style={{ color: "var(--ink)" }}>
                      {safeAnalysis.confidenceScore}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--gray-3)" }}>
                    <div className="h-full" style={{ width: `${safeAnalysis.confidenceScore}%`, background: "var(--ink)" }} />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {isOutlineOpen && slideContent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0, 0, 0, 0.65)" }}>
          <div className="relative w-full max-w-[600px] rounded-[2px] bg-white p-10 shadow-xl">
            <button
              type="button"
              onClick={() => setIsOutlineOpen(false)}
              className="mono absolute right-4 top-4 text-[14px] uppercase tracking-[0.12em]"
              style={{ color: "var(--gray-5)" }}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="mb-2 text-[24px] font-bold">Your presentation outline</h3>
            <p className="mono mb-6 text-[13px]" style={{ color: "var(--gray-4)" }}>
              {slideContent.title}
            </p>
            <div className="max-h-[55vh] overflow-y-auto pr-1">
              {slideContent.slides.map((slide, index) => (
                <div key={`${slide.headline}-${index}`} className="mb-5 last:mb-0">
                  <h4 className="mb-2 text-[18px] font-bold">{index + 1}. {slide.headline}</h4>
                  <ul className="pl-5">
                    {slide.bullets.map((bullet, bulletIndex) => (
                      <li key={`${bullet}-${bulletIndex}`} className="mono mb-1 text-[13px]" style={{ color: "var(--gray-5)" }}>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => window.open("https://www.canva.com/create/presentations/", "_blank", "noopener,noreferrer")}
              className="mono mt-8 w-full rounded-[2px] px-4 py-3 text-[14px] uppercase tracking-[0.12em]"
              style={{ background: "var(--ink)", color: "#fff" }}
            >
              Open Canva
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
