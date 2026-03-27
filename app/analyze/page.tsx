"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type DocType = "earnings" | "tenk" | "regulatory";
type InputTab = "paste" | "upload";
type SampleId = "earnings" | "tenk" | "regulatory";

const SAMPLES = [
  {
    id: "earnings",
    docType: "earnings",
    label: "Earnings call",
    company: "Apex Technologies Q3 2024",
    text: `Apex Technologies Q3 2024 Earnings Call Transcript

CEO Mark Reynolds: Good afternoon everyone and thank you for joining us. We are pleased to report Q3 revenue of $847 million, representing 12% growth year over year. Our enterprise segment continues to demonstrate strong momentum and we believe we are well-positioned to deliver on our revised full year guidance range of $3.2 billion to $3.35 billion.

I want to be clear that we remain confident in our core business fundamentals. The enterprise segment grew 34% year over year, which we believe reflects the durability of our platform. Consumer segment performance was softer than expected in the quarter, and we are evaluating how best to address that going forward.

CFO Sandra Kim: Thank you Mark. On the financial side, gross margin came in at 68.2%, roughly in line with our expectations. We are also taking a careful look at our overall cost structure as we head into Q4, and we believe there are opportunities to optimize. Our cash position remains strong at $2.1 billion.

Regarding guidance, we are revising our full year range to $3.2 to $3.35 billion from our prior range of $3.4 to $3.5 billion. We believe this updated range better reflects current market conditions while still demonstrating our confidence in the underlying business.

Analyst Question: Can you give us more color on the consumer segment weakness?

CEO: We are not going to provide specific revenue figures for consumer at this time. What I will say is that we saw some headwinds in the back half of the quarter that we did not anticipate. We are working through those and expect to have more to share next quarter.`,
  },
  {
    id: "tenk",
    docType: "tenk",
    label: "10-K filing",
    company: "Meridian Financial Corp 2023",
    text: `Meridian Financial Corp — Annual Report on Form 10-K
Fiscal Year Ended December 31, 2023

RISK FACTORS

Customer Concentration Risk: For the fiscal year ended December 31, 2023, our top three customers accounted for approximately 61% of total revenue, with our largest single customer representing 34% of revenue. The loss of any one of these customers could have a material adverse effect on our results of operations.

Going Concern Considerations: As discussed in Note 3 to the consolidated financial statements, certain conditions raise substantial doubt about our ability to continue as a going concern. These conditions include recurring operating losses, negative cash flows from operations, and a working capital deficit of $43 million as of December 31, 2023.

Auditor Change: Effective March 15, 2024, we dismissed Deloitte & Touche LLP as our independent registered public accounting firm and engaged BDO USA as our new auditor. The change was approved by our Audit Committee.

MANAGEMENT DISCUSSION AND ANALYSIS

Net revenue for fiscal 2023 was $312 million compared to $389 million in fiscal 2022, a decrease of 19.8%. This decline was primarily attributable to the loss of two significant contracts and continued weakness in our legacy product lines. Management believes that our new product initiatives will offset these declines, though we cannot provide assurance that this will occur within any specific timeframe.

Operating expenses increased to $98 million from $71 million in the prior year, driven primarily by restructuring charges of $18 million related to our workforce reduction announced in September 2023.

RELATED PARTY TRANSACTIONS

During fiscal 2023, we entered into a consulting agreement with Meridian Advisory Partners LLC, a firm controlled by our Chairman of the Board, for strategic advisory services totaling $2.4 million.`,
  },
  {
    id: "regulatory",
    docType: "regulatory",
    label: "Regulatory notice",
    company: "Clearwater Bank CFPB Order 2024",
    text: `CONSUMER FINANCIAL PROTECTION BUREAU
CONSENT ORDER

In the Matter of Clearwater Bank NA
File No. 2024-CFPB-0012

FINDINGS

Clearwater Bank failed to provide borrowers with accurate payoff statements within the required seven business day period on 847 separate occasions between January 2021 and December 2023, affecting approximately $234 million in outstanding loan balances.

The Bank failed to timely credit mortgage payments received on 1,243 occasions, resulting in improper late fee assessments totaling $892,000.

The Bank's loss mitigation procedures did not comply with Regulation X requirements, specifically 12 CFR 1024.41, resulting in improper denial of 312 loan modification applications without required written notice.

REMEDIATION REQUIREMENTS

Clearwater Bank shall pay a civil money penalty of $8.75 million to the Bureau within 30 days of the effective date of this Order. The Bank shall establish a consumer remediation fund of $2.1 million within 45 days to compensate affected borrowers. The Bank shall submit a comprehensive compliance plan to the Bureau within 60 days addressing all identified deficiencies.

ONGOING OBLIGATIONS

The Bank shall provide quarterly compliance reports to the Bureau for a period of 24 months. Failure to comply with any provision of this Order may result in additional civil money penalties of up to $1 million per day per violation.`,
  },
] as const;

const DOC_TYPE_OPTIONS: Array<{ value: DocType; label: string }> = [
  { value: "earnings", label: "Earnings call" },
  { value: "tenk", label: "10-K filing" },
  { value: "regulatory", label: "Regulatory notice" },
];

export default function AnalyzePage() {
  const router = useRouter();
  const [docType, setDocType] = useState<DocType>("earnings");
  const [driftEnabled, setDriftEnabled] = useState(true);
  const [confidenceEnabled, setConfidenceEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<InputTab>("paste");
  const [text, setText] = useState("");
  const [uploadText, setUploadText] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [parsedCharCount, setParsedCharCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSampleId, setActiveSampleId] = useState<SampleId | null>(null);

  const finalText = useMemo(() => {
    if (activeTab === "upload") {
      return uploadText;
    }
    return text;
  }, [activeTab, text, uploadText]);

  const isDisabled = isLoading || finalText.trim().length === 0;

  useEffect(() => {
    const sampleParam = new URLSearchParams(window.location.search).get("sample");
    if (!sampleParam) return;

    const sample = SAMPLES.find((item) => item.id === sampleParam);
    if (!sample) return;

    setText(sample.text);
    setDocType(sample.docType);
    setActiveTab("paste");
    setActiveSampleId(sample.id);
  }, []);

  const handleSampleSelect = (sampleId: SampleId) => {
    const sample = SAMPLES.find((item) => item.id === sampleId);
    if (!sample) return;

    setText(sample.text);
    setDocType(sample.docType);
    setActiveTab("paste");
    setActiveSampleId(sample.id);
    setError("");
  };

  const loadedSample = activeSampleId ? SAMPLES.find((sample) => sample.id === activeSampleId) : null;

  const handlePdfUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setUploadName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const decoded = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
      const normalized = decoded.replace(/\s+/g, " ").trim();
      setUploadText(normalized);
      setParsedCharCount(normalized.length);
    } catch (_err) {
      setUploadText("");
      setParsedCharCount(null);
      setError("Unable to parse this PDF in-browser. Try paste mode or a different file.");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isDisabled) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: finalText,
          docType,
          driftEnabled,
          confidenceEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis request failed");
      }

      const result = (await response.json()) as unknown;
      sessionStorage.setItem("fl_analysis", JSON.stringify(result));
      sessionStorage.setItem("fl_doctype", docType);
      sessionStorage.setItem("fl_text_preview", finalText.slice(0, 120));
      router.push("/results");
    } catch (_err) {
      setError("Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[var(--cream)] text-[var(--ink)]">
      <nav
        className="sticky top-0 z-40 flex min-h-14 items-center justify-between border-b border-black/15 px-4 sm:px-6"
        style={{ background: "var(--ink)" }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="mono inline-flex items-center gap-1 text-sm tracking-[0.08em] text-white/80 transition-colors hover:text-white"
          >
            <span aria-hidden>←</span>
            <span>Back</span>
          </Link>
          <Link href="/" className="text-2xl leading-none text-white">
            Finance<span style={{ color: "var(--red)" }}>Lens</span>
          </Link>
        </div>
      </nav>

      <div className="grid min-h-[calc(100dvh-56px)] grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-r-0 p-6 lg:border-b-0 lg:border-r" style={{ background: "var(--gray-1)", borderColor: "var(--gray-2)" }}>
          <p className="mono mb-3 text-[13px] uppercase tracking-[0.14em]" style={{ color: "var(--gray-4)" }}>
            Document type
          </p>
          <div className="flex flex-col gap-2">
            {DOC_TYPE_OPTIONS.map((option) => {
              const isActive = option.value === docType;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDocType(option.value)}
                  className="w-full rounded-[2px] border px-3 py-3 text-left text-[14px] transition-colors"
                  style={
                    isActive
                      ? { background: "var(--ink)", color: "#fff", borderColor: "var(--ink)" }
                      : { background: "#fff", color: "var(--gray-5)", borderColor: "var(--gray-3)" }
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="my-5 h-px" style={{ background: "var(--gray-2)" }} />

          <p className="mono mb-3 text-[13px] uppercase tracking-[0.14em]" style={{ color: "var(--gray-4)" }}>
            Options
          </p>

          <label className="mono mb-3 flex items-center gap-2 text-[13px]" style={{ color: "var(--gray-5)" }}>
            <input
              type="checkbox"
              checked={driftEnabled}
              onChange={(event) => setDriftEnabled(event.target.checked)}
              className="h-4 w-4 rounded border"
            />
            Drift detection
          </label>
          <label className="mono flex items-center gap-2 text-[13px]" style={{ color: "var(--gray-5)" }}>
            <input
              type="checkbox"
              checked={confidenceEnabled}
              onChange={(event) => setConfidenceEnabled(event.target.checked)}
              className="h-4 w-4 rounded border"
            />
            Confidence scoring
          </label>
        </aside>

        <main className="p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="flex max-w-4xl flex-col gap-6">
            <p className="mono text-[13px] uppercase tracking-[0.14em]" style={{ color: "var(--gray-4)" }}>
              Document
            </p>

            <div className="flex items-end gap-6 border-b" style={{ borderColor: "var(--gray-2)" }}>
              <button
                type="button"
                onClick={() => setActiveTab("paste")}
                className="mono pb-2 text-[13px] uppercase tracking-[0.12em]"
                style={
                  activeTab === "paste"
                    ? { color: "var(--ink)", borderBottom: "2px solid var(--red)" }
                    : { color: "var(--gray-4)", borderBottom: "2px solid transparent" }
                }
              >
                Paste text
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className="mono pb-2 text-[13px] uppercase tracking-[0.12em]"
                style={
                  activeTab === "upload"
                    ? { color: "var(--ink)", borderBottom: "2px solid var(--red)" }
                    : { color: "var(--gray-4)", borderBottom: "2px solid transparent" }
                }
              >
                Upload PDF
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <p className="mono text-[13px] uppercase tracking-[0.14em]" style={{ color: "var(--gray-4)" }}>
                Try a sample document
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {SAMPLES.map((sample) => {
                  const isActive = activeSampleId === sample.id;
                  return (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSampleSelect(sample.id)}
                      className="mono rounded-[2px] border px-[14px] py-[6px] text-[13px] transition-colors"
                      style={
                        isActive
                          ? { background: "var(--ink)", color: "#fff", borderColor: "var(--ink)" }
                          : { background: "#fff", color: "var(--gray-5)", borderColor: "var(--gray-3)" }
                      }
                    >
                      {sample.label}
                    </button>
                  );
                })}
              </div>
              {loadedSample ? (
                <p className="mono text-[13px]" style={{ color: "var(--gray-4)" }}>
                  Loaded: {loadedSample.company}
                </p>
              ) : null}
            </div>

            {activeTab === "paste" ? (
              <textarea
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  if (activeSampleId) setActiveSampleId(null);
                }}
                placeholder="Paste your earnings call transcript, 10-K filing, or regulatory notice here..."
                className="w-full rounded-[2px] border p-4 text-[15px] leading-relaxed outline-none focus:ring-2"
                style={{
                  minHeight: "240px",
                  background: "#fff",
                  borderColor: "var(--gray-3)",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                }}
              />
            ) : (
              <div
                className="rounded-[2px] border border-dashed p-5"
                style={{ borderColor: "var(--gray-3)", background: "#fff" }}
              >
                <label className="mono mb-3 block text-[13px]" style={{ color: "var(--gray-5)" }}>
                  Upload PDF file
                </label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfUpload}
                  className="mono block w-full text-[13px]"
                />
                {uploadName ? (
                  <p className="mono mt-3 text-[13px]" style={{ color: "var(--gray-5)" }}>
                    File: {uploadName}
                  </p>
                ) : null}
                {parsedCharCount !== null ? (
                  <p className="mono mt-2 text-[13px]" style={{ color: "var(--gray-4)" }}>
                    Parsed characters: {parsedCharCount.toLocaleString()}
                  </p>
                ) : null}
              </div>
            )}

            <button
              type="submit"
              disabled={isDisabled}
              className="mono w-full rounded-[2px] px-4 py-4 text-[14px] uppercase tracking-[0.12em] transition-colors"
              style={
                isDisabled
                  ? { background: "var(--gray-3)", color: "var(--gray-5)", cursor: "not-allowed" }
                  : { background: "var(--ink)", color: "#fff" }
              }
            >
              {isLoading ? "Analyzing..." : "Run analysis"}
            </button>

            <Link href="/compare" className="mono text-[13px]" style={{ color: "var(--gray-4)" }}>
              + Compare two documents
            </Link>

            {error ? (
              <p className="mono text-[13px]" style={{ color: "var(--red)" }}>
                {error}
              </p>
            ) : null}
          </form>
        </main>
      </div>
    </div>
  );
}
