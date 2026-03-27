"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function ResultsPage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [docType, setDocType] = useState("");
  const [preview, setPreview] = useState("");
  const [canvaLoading, setCanvaLoading] = useState(false);
  const [canvaModal, setCanvaModal] = useState<{ slides: { headline: string; bullets: string[] }[]; title: string } | null>(null);
  const [canvaError, setCanvaError] = useState("");

  useEffect(() => {
    const a = sessionStorage.getItem("fl_analysis");
    const d = sessionStorage.getItem("fl_doctype");
    const p = sessionStorage.getItem("fl_text_preview");
    if (a) setAnalysis(JSON.parse(a));
    if (d) setDocType(d);
    if (p) setPreview(p);
  }, []);

  const handleCanva = async () => {
    if (!analysis) return;
    setCanvaLoading(true);
    setCanvaError("");
    try {
      const res = await fetch("/api/canva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysis),
      });
      const data = await res.json();
      if (data.slideContent) {
        setCanvaModal(data.slideContent);
      } else {
        setCanvaError("Could not generate slide content. Please try again.");
      }
    } catch {
      setCanvaError("Something went wrong. Please try again.");
    } finally {
      setCanvaLoading(false);
    }
  };

  if (!analysis) {
    return (
      <div style={{ background: "#FAFAF7", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "22px", color: "#1C1C1E", marginBottom: "16px" }}>No analysis found</p>
          <Link href="/analyze" style={{ fontFamily: "monospace", fontSize: "13px", color: "#C0392B", textDecoration: "underline" }}>← Start a new analysis</Link>
        </div>
      </div>
    );
  }

  const docLabel = docType === "earnings" ? "Earnings call" : docType === "tenk" ? "10-K filing" : "Regulatory notice";

  return (
    <div style={{ background: "#FAFAF7", minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{ background: "#1C1C1E", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontFamily: "Georgia, serif", fontSize: "20px", color: "#fff", textDecoration: "none" }}>
          Finance<span style={{ color: "#C0392B" }}>Lens</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/analyze" style={{ fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>New analysis</Link>
          <button
            onClick={handleCanva}
            disabled={canvaLoading}
            style={{ background: canvaLoading ? "#888" : "#C0392B", color: "#fff", fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", padding: "9px 20px", borderRadius: "2px", border: "none", cursor: canvaLoading ? "not-allowed" : "pointer" }}
          >
            {canvaLoading ? "Generating..." : "Generate deck"}
          </button>
        </div>
      </nav>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "calc(100vh - 56px)" }}>

        {/* Sidebar */}
        <div style={{ borderRight: "1px solid #E0DCD4", padding: "36px 24px", background: "#F4F2EE", position: "sticky", top: "56px", height: "calc(100vh - 56px)", overflowY: "auto" }}>

          {/* Doc info */}
          <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", fontWeight: 700, color: "#1C1C1E", lineHeight: 1.4, marginBottom: "6px" }}>
            {preview.slice(0, 55)}{preview.length > 55 ? "..." : ""}
          </p>
          <p style={{ fontFamily: "monospace", fontSize: "10px", color: "#999", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.12em" }}>{docLabel}</p>

          {/* Badges */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
            <span style={{ background: "#1C1C1E", color: "#fff", fontFamily: "monospace", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: "2px" }}>{docLabel}</span>
            {analysis.flagCount > 0 && <span style={{ background: "#FEF0ED", color: "#C0392B", border: "1px solid #F5C6BC", fontFamily: "monospace", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: "2px" }}>Flags {analysis.flagCount}</span>}
            {analysis.driftCount > 0 && <span style={{ background: "#FEF9EC", color: "#9A6B00", border: "1px solid #E8D8A0", fontFamily: "monospace", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: "2px" }}>Drift {analysis.driftCount}</span>}
          </div>

          {/* Confidence */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontFamily: "monospace", fontSize: "10px", color: "#999", textTransform: "uppercase", letterSpacing: "0.12em" }}>Confidence</span>
              <span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 700, color: "#1C1C1E" }}>{analysis.confidenceScore}%</span>
            </div>
            <div style={{ height: "4px", background: "#E0DCD4", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${analysis.confidenceScore}%`, background: "#1C1C1E", borderRadius: "2px" }} />
            </div>
          </div>

          <div style={{ height: "1px", background: "#E0DCD4", marginBottom: "20px" }} />

          {/* Section nav */}
          <p style={{ fontFamily: "monospace", fontSize: "9px", color: "#BBB", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "12px" }}>Sections</p>
          {[
            { id: "s1", label: "What they said", dot: "#CCC" },
            { id: "s2", label: "What it means", dot: "#1C1C1E" },
            { id: "s3", label: "Key numbers", dot: "#1A7A3C" },
            { id: "s4", label: "Language drift", dot: "#9A6B00" },
            { id: "s5", label: "Worth a closer look", dot: "#C0392B" },
          ].map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", fontFamily: "monospace", fontSize: "12px", color: "#666", textDecoration: "none", borderBottom: "1px solid #EAE7E0" }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
              {s.label}
            </a>
          ))}

          <div style={{ height: "1px", background: "#E0DCD4", margin: "20px 0" }} />

          <button
            onClick={handleCanva}
            disabled={canvaLoading}
            style={{ width: "100%", background: "#C0392B", color: "#fff", fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", padding: "12px", borderRadius: "2px", border: "none", cursor: "pointer", marginBottom: "8px" }}
          >
            {canvaLoading ? "Generating..." : "Generate deck →"}
          </button>
          <button style={{ width: "100%", background: "transparent", color: "#666", fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "10px", borderRadius: "2px", border: "1px solid #D5D0C8", cursor: "pointer" }}>
            Share analysis
          </button>

          {canvaError && <p style={{ fontFamily: "monospace", fontSize: "10px", color: "#C0392B", marginTop: "10px", lineHeight: 1.5 }}>{canvaError}</p>}
        </div>

        {/* Main content */}
        <div style={{ padding: "48px", maxWidth: "860px" }}>

          {/* Section 1 */}
          <div id="s1" style={{ marginBottom: "40px" }}>
            <div style={{ borderBottom: "2px solid #1C1C1E", paddingBottom: "12px", marginBottom: "24px", display: "flex", alignItems: "baseline", gap: "16px" }}>
              <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#C0392B", letterSpacing: "0.18em" }}>01</span>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: 700, color: "#1C1C1E" }}>What they said</h2>
            </div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "18px", color: "#444", lineHeight: 1.85 }}>{analysis.whatTheySaid}</p>
          </div>

          {/* Section 2 */}
          <div id="s2" style={{ marginBottom: "40px" }}>
            <div style={{ borderBottom: "2px solid #1C1C1E", paddingBottom: "12px", marginBottom: "24px", display: "flex", alignItems: "baseline", gap: "16px" }}>
              <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#C0392B", letterSpacing: "0.18em" }}>02</span>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: 700, color: "#1C1C1E" }}>What it actually means</h2>
            </div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "18px", color: "#444", lineHeight: 1.85 }}>{analysis.whatItMeans}</p>
          </div>

          {/* Section 3 */}
          <div id="s3" style={{ marginBottom: "40px" }}>
            <div style={{ borderBottom: "2px solid #1C1C1E", paddingBottom: "12px", marginBottom: "24px", display: "flex", alignItems: "baseline", gap: "16px" }}>
              <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#C0392B", letterSpacing: "0.18em" }}>03</span>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: 700, color: "#1C1C1E" }}>Key numbers</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
              {analysis.keyNumbers.map((n, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #E0DCD4", borderRadius: "3px", padding: "24px 20px" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "36px", fontWeight: 700, color: "#1C1C1E", lineHeight: 1, marginBottom: "8px" }}>{n.value}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#999", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }}>{n.label}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 700, color: n.direction.startsWith("+") || n.direction.toLowerCase().includes("up") || n.direction.toLowerCase().includes("strong") || n.direction.toLowerCase().includes("growth") ? "#1A7A3C" : "#C0392B" }}>{n.direction}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4 */}
          <div id="s4" style={{ marginBottom: "40px" }}>
            <div style={{ borderBottom: "2px solid #1C1C1E", paddingBottom: "12px", marginBottom: "24px", display: "flex", alignItems: "baseline", gap: "16px" }}>
              <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#C0392B", letterSpacing: "0.18em" }}>04</span>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: 700, color: "#1C1C1E" }}>Language drift</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {analysis.driftSignals.map((d, i) => (
                <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start", padding: "16px 0", borderBottom: "1px solid #F4F2EE" }}>
                  <span style={{
                    flexShrink: 0,
                    fontFamily: "monospace",
                    fontSize: "9px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "4px 10px",
                    borderRadius: "2px",
                    marginTop: "2px",
                    background: d.type === "hedge" ? "#FEF9EC" : "#F0FBF4",
                    color: d.type === "hedge" ? "#9A6B00" : "#1A7A3C",
                    border: d.type === "hedge" ? "1px solid #E8D8A0" : "1px solid #A8DDB8",
                  }}>{d.type}</span>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: "16px", color: "#555", lineHeight: 1.65, margin: 0 }}>{d.quote}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5 */}
          <div id="s5" style={{ marginBottom: "40px" }}>
            <div style={{ borderBottom: "2px solid #1C1C1E", paddingBottom: "12px", marginBottom: "24px", display: "flex", alignItems: "baseline", gap: "16px" }}>
              <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#C0392B", letterSpacing: "0.18em" }}>05</span>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: 700, color: "#1C1C1E" }}>Worth a closer look</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {analysis.flags.map((f, i) => (
                <div key={i} style={{ background: "#FEF5F5", border: "1px solid #F5C6BC", borderLeft: "4px solid #C0392B", borderRadius: "2px", padding: "20px 24px" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, color: "#C0392B", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>Flag {i + 1}</div>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: "16px", color: "#5A1A1A", lineHeight: 1.7, margin: 0 }}>{f.text}</p>
                </div>
              ))}
            </div>

            {/* Confidence bar */}
            <div style={{ marginTop: "32px", padding: "20px 24px", background: "#F4F2EE", border: "1px solid #E0DCD4", borderRadius: "2px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontFamily: "monospace", fontSize: "10px", color: "#999", textTransform: "uppercase", letterSpacing: "0.14em" }}>Overall confidence score</span>
                <span style={{ fontFamily: "monospace", fontSize: "18px", fontWeight: 700, color: "#1C1C1E" }}>{analysis.confidenceScore}%</span>
              </div>
              <div style={{ height: "6px", background: "#E0DCD4", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${analysis.confidenceScore}%`, background: "#1C1C1E", borderRadius: "3px" }} />
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ padding: "20px 24px", border: "1px solid #E0DCD4", borderRadius: "2px" }}>
            <p style={{ fontFamily: "monospace", fontSize: "11px", color: "#BBB", lineHeight: 1.6 }}>Assistive analysis only. Not financial advice. Do not make investment decisions based solely on this output. FinanceLens AI · hannahkraulikpagade.com</p>
          </div>

        </div>
      </div>

      {/* Canva Modal */}
      {canvaModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "4px", padding: "48px", maxWidth: "640px", width: "100%", maxHeight: "80vh", overflowY: "auto", position: "relative" }}>
            <button onClick={() => setCanvaModal(null)} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#999" }}>×</button>
            <p style={{ fontFamily: "monospace", fontSize: "10px", color: "#C0392B", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "8px" }}>Your presentation outline</p>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: 700, color: "#1C1C1E", marginBottom: "32px" }}>{canvaModal.title}</h2>
            {canvaModal.slides.map((slide, i) => (
              <div key={i} style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid #F4F2EE" }}>
                <p style={{ fontFamily: "monospace", fontSize: "10px", color: "#C0392B", letterSpacing: "0.14em", marginBottom: "6px" }}>Slide {i + 1}</p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#1C1C1E", marginBottom: "10px" }}>{slide.headline}</p>
                <ul style={{ paddingLeft: "20px" }}>
                  {slide.bullets.map((b, j) => (
                    <li key={j} style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: "#555", lineHeight: 1.7, marginBottom: "4px" }}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
            <a href="https://www.canva.com/create/presentations/" target="_blank" rel="noreferrer" style={{ display: "inline-block", background: "#C0392B", color: "#fff", fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", padding: "14px 28px", borderRadius: "2px", textDecoration: "none", marginTop: "8px" }}>
              Open Canva to build →
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
