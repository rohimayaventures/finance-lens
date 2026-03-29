"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type DocType = "earnings" | "tenk" | "regulatory";
type InputTab = "paste" | "upload";
type SampleId = "earnings" | "tenk" | "regulatory";

const PDF_PARSE_FALLBACK =
  "Could not extract text from this PDF. Please paste the document text directly.";

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
  const [pdfExtracting, setPdfExtracting] = useState(false);
  const [pdfExtractNotice, setPdfExtractNotice] = useState<string | null>(null);
  const [pdfTruncated, setPdfTruncated] = useState(false);
  const [pdfParseError, setPdfParseError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSampleId, setActiveSampleId] = useState<SampleId | null>(null);
  /** Haiku by default — much faster than Sonnet for typical pastes. */
  const [fastAnalysis, setFastAnalysis] = useState(true);
  const [elapsedSec, setElapsedSec] = useState(0);

  const finalText = useMemo(() => {
    if (activeTab === "upload") {
      return uploadText;
    }
    return text;
  }, [activeTab, text, uploadText]);

  const isDisabled = isLoading || pdfExtracting || finalText.trim().length === 0;
  const charCount = finalText.trim().length;
  const longDoc = charCount > 18_000;

  useEffect(() => {
    if (!isLoading) return;
    setElapsedSec(0);
    const id = window.setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [isLoading]);

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
    setPdfExtractNotice(null);
    setPdfTruncated(false);
    setPdfParseError(null);
  };

  const loadedSample = activeSampleId ? SAMPLES.find((sample) => sample.id === activeSampleId) : null;

  const handlePdfUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const input = event.target;
    if (!file) return;

    setPdfParseError(null);
    setPdfExtractNotice(null);
    setPdfTruncated(false);
    setError("");
    setUploadName(file.name);
    setPdfExtracting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse-pdf", { method: "POST", body: formData });
      const data = (await res.json()) as {
        text?: string;
        pageCount?: number;
        truncated?: boolean;
        error?: string;
      };

      if (!res.ok || typeof data.text !== "string") {
        setPdfParseError(typeof data.error === "string" ? data.error : PDF_PARSE_FALLBACK);
        return;
      }

      setText(data.text);
      setUploadText("");
      setActiveTab("paste");
      setActiveSampleId(null);
      const pages = typeof data.pageCount === "number" ? data.pageCount : 0;
      setPdfExtractNotice(`Text extracted from PDF (${pages} pages). Review below before analyzing.`);
      setPdfTruncated(data.truncated === true);
    } catch {
      setPdfParseError(PDF_PARSE_FALLBACK);
    } finally {
      setPdfExtracting(false);
      input.value = "";
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
          fastAnalysis,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis request failed");
      }

      const result = (await response.json()) as Record<string, unknown>;
      const shareSlug = result.shareSlug;
      const analysisPayload = { ...result };
      delete analysisPayload.shareSlug;
      sessionStorage.setItem("fl_analysis", JSON.stringify(analysisPayload));
      sessionStorage.setItem("fl_doctype", docType);
      sessionStorage.setItem("fl_text_preview", finalText.slice(0, 120));
      sessionStorage.setItem("fl_document_text", finalText.slice(0, 5000));
      if (typeof shareSlug === "string" && shareSlug.length > 0) {
        sessionStorage.setItem("fl_share_slug", shareSlug);
      } else {
        sessionStorage.removeItem("fl_share_slug");
      }
      router.push("/results");
    } catch (_err) {
      setError("Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fl-app-shell">
      <a href="#main-content" className="fl-skip-link">
        Skip to content
      </a>
      <header className="fl-app-nav">
        <div className="fl-app-nav-start">
          <Link href="/" className="fl-app-back">
            ← Back
          </Link>
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

          <p className="fl-app-label">Options</p>
          <label className="fl-app-check">
            <input
              type="checkbox"
              checked={driftEnabled}
              onChange={(event) => setDriftEnabled(event.target.checked)}
            />
            Drift detection
          </label>
          <label className="fl-app-check">
            <input
              type="checkbox"
              checked={confidenceEnabled}
              onChange={(event) => setConfidenceEnabled(event.target.checked)}
            />
            Confidence scoring
          </label>
          <label className="fl-app-check fl-app-check--last">
            <input
              type="checkbox"
              checked={fastAnalysis}
              onChange={(event) => setFastAnalysis(event.target.checked)}
            />
            Faster model (Haiku)
          </label>
          <p className="fl-app-sidebar-hint fl-app-hint-below-checks">
            Turn off for Sonnet when you want maximum depth—usually slower, especially on long documents.
          </p>
        </aside>

        <main className="fl-app-main" id="main-content">
          <form onSubmit={handleSubmit} className="fl-app-form">
            <p className="fl-app-label fl-app-label--flush">Document</p>

            <div className="fl-app-tabs">
              <button
                type="button"
                onClick={() => setActiveTab("paste")}
                className={`fl-app-tab${activeTab === "paste" ? " is-active" : ""}`}
              >
                Paste text
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`fl-app-tab${activeTab === "upload" ? " is-active" : ""}`}
                style={{
                  textTransform: "none",
                  letterSpacing: "0.06em",
                  lineHeight: 1.35,
                  maxWidth: "min(100%, 20rem)",
                  textAlign: "left",
                  whiteSpace: "normal",
                }}
              >
                Upload PDF (text extraction, not scanned pages)
              </button>
            </div>

            <div>
              <p className="fl-app-label">Try a sample document</p>
              <div className="fl-app-chip-row">
                {SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSampleSelect(sample.id)}
                    className={`fl-app-chip${activeSampleId === sample.id ? " is-active" : ""}`}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
              {loadedSample ? <p className="fl-app-hint fl-app-hint-spaced">Loaded: {loadedSample.company}</p> : null}
            </div>

            {activeTab === "paste" ? (
              <>
                <textarea
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value);
                    if (activeSampleId) setActiveSampleId(null);
                  }}
                  placeholder="Paste your earnings call transcript, 10-K filing, or regulatory notice here..."
                  className="fl-app-textarea"
                />
                {pdfExtractNotice ? (
                  <p className="fl-app-hint fl-app-hint-spaced" role="status">
                    {pdfExtractNotice}
                  </p>
                ) : null}
                {pdfTruncated ? (
                  <p className="fl-app-hint fl-app-hint-spaced" role="status">
                    Document truncated to 15,000 characters for analysis.
                  </p>
                ) : null}
              </>
            ) : (
              <div className="fl-app-drop">
                <span className="fl-app-drop-label">
                  Choose a PDF file — text extraction, not scanned pages
                </span>
                {pdfExtracting ? (
                  <p className="fl-app-hint fl-app-hint-spaced" aria-live="polite">
                    Extracting text…
                  </p>
                ) : null}
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfUpload}
                  className="fl-app-file"
                  disabled={pdfExtracting}
                />
                {uploadName ? <p className="fl-app-hint fl-app-hint-spaced">File: {uploadName}</p> : null}
                {pdfParseError ? (
                  <p className="fl-app-error fl-app-hint-spaced" role="alert">
                    {pdfParseError}
                  </p>
                ) : null}
              </div>
            )}

            {longDoc ? (
              <p className="fl-app-hint fl-app-hint-spaced">
                Long paste ({charCount.toLocaleString()} characters)—first run can take a bit while the model reads the full text. Use{" "}
                <strong>Faster model (Haiku)</strong> on the left for shorter waits.
              </p>
            ) : null}

            <button type="submit" disabled={isDisabled} className="fl-app-submit">
              {isLoading ? `Analyzing… ${elapsedSec}s` : "Run analysis"}
            </button>

            <Link href="/compare" className="fl-app-link-quiet">
              + Compare two documents
            </Link>

            {error ? <p className="fl-app-error">{error}</p> : null}
          </form>
        </main>
      </div>
    </div>
  );
}
