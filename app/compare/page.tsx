"use client";

import Link from "next/link";
import type { CSSProperties, FormEvent } from "react";
import { useEffect, useState } from "react";

type DocType = "earnings" | "tenk" | "regulatory";

type CompareSamplePair = {
  id: string;
  label: string;
  caption: string;
  docType: DocType;
  textA: string;
  textB: string;
};

const SAMPLE_PAIRS: readonly CompareSamplePair[] = [
  {
    id: "apex-earnings-q2-q3",
    label: "Earnings · Q2 → Q3",
    caption: "Same company, consecutive quarters — guidance and tone shift (Apex Technologies).",
    docType: "earnings",
    textA: `Apex Technologies Q2 2024 Earnings Call — Excerpt

CEO Mark Reynolds: Thank you for joining us. Q2 revenue was $798 million, up 14% year over year. We are confident we will deliver on our full year guidance range of $3.4 billion to $3.5 billion. Enterprise strength remains a core driver, and we remain confident in the durability of our platform across segments.

CFO Sandra Kim: Gross margin was 68.5%. Consumer engagement metrics met our internal expectations for the quarter. We see a clear path to the high end of our annual EPS outlook and are not considering material changes to our cost structure at this time.

On consumer: Revenue in the segment grew modestly; we plan to provide segment dashboards on the investor site next quarter.`,

    textB: `Apex Technologies Q3 2024 Earnings Call — Excerpt

CEO Mark Reynolds: Q3 revenue was $847 million, representing 12% growth year over year. Our enterprise segment continues to demonstrate strong momentum and we believe we are well-positioned to deliver on our revised full year guidance range of $3.2 billion to $3.35 billion.

I want to be clear that we remain confident in our core business fundamentals. The enterprise segment grew 34% year over year, which we believe reflects the durability of our platform. Consumer segment performance was softer than expected in the quarter, and we are evaluating how best to address that going forward.

CFO Sandra Kim: Gross margin came in at 68.2%, roughly in line with our expectations. We are taking a careful look at our overall cost structure as we head into Q4, and we believe there are opportunities to optimize.

Regarding guidance, we are revising our full year range to $3.2 to $3.35 billion from our prior range of $3.4 to $3.5 billion. We believe this updated range better reflects current market conditions.

Analyst: Can you give more color on consumer weakness?
CEO: We are not going to provide specific revenue figures for consumer at this time.`,
  },
  {
    id: "meridian-tenk-2022-2023",
    label: "10-K · FY22 → FY23",
    caption: "Same issuer, year-over-year filing — risk and performance language (Meridian Financial).",
    docType: "tenk",
    textA: `Meridian Financial Corp — Form 10-K Excerpt (Fiscal Year Ended December 31, 2022)

MANAGEMENT DISCUSSION AND ANALYSIS

Net revenue for fiscal 2022 was $389 million, an increase of 8% from fiscal 2021, driven by new enterprise contracts and expansion in our core markets. Management is confident that investments in product development will support continued growth.

RISK FACTORS — CONCENTRATION

Our largest ten customers accounted for approximately 52% of revenue; no single customer exceeded 22% of revenue. We maintain diversified channels and believe concentration risk is manageable.

We have not identified conditions that raise substantial doubt about our ability to continue as a going concern.`,

    textB: `Meridian Financial Corp — Form 10-K Excerpt (Fiscal Year Ended December 31, 2023)

MANAGEMENT DISCUSSION AND ANALYSIS

Net revenue for fiscal 2023 was $312 million compared to $389 million in fiscal 2022, a decrease of 19.8%. This decline was primarily attributable to the loss of two significant contracts and continued weakness in our legacy product lines. Management believes that new product initiatives will offset these declines, though we cannot provide assurance that this will occur within any specific timeframe.

RISK FACTORS — CONCENTRATION AND GOING CONCERN

For the fiscal year ended December 31, 2023, our top three customers accounted for approximately 61% of total revenue, with our largest single customer representing 34% of revenue.

Going Concern: As discussed in Note 3, certain conditions raise substantial doubt about our ability to continue as a going concern, including recurring operating losses, negative cash flows, and a working capital deficit of $43 million.

Auditor Change: Effective March 15, 2024, we dismissed Deloitte & Touche LLP and engaged BDO USA as our new auditor.`,
  },
  {
    id: "clearwater-regulatory-draft-final",
    label: "Regulatory · draft → final",
    caption: "Same matter — examination summary language vs. issued consent order (Clearwater Bank).",
    docType: "regulatory",
    textA: `CONSUMER FINANCIAL PROTECTION BUREAU — EXAMINATION SUMMARY (INVESTIGATION STAGE)
In the Matter of Clearwater Bank NA — Docket EXM-2024-0089

Exam staff preliminarily identified compliance gaps in mortgage servicing workflows between 2021 and 2023, including delays in payoff statements and occasional misapplication of payments. The Bank has cooperated with the examination and proposed a remediation plan addressing training, controls, and borrower communications.

No civil money penalty has been determined. The Bureau may pursue a consent order if voluntary remediation milestones are not met within a reasonable period.`,

    textB: `CONSUMER FINANCIAL PROTECTION BUREAU — CONSENT ORDER (FINAL)
In the Matter of Clearwater Bank NA — File No. 2024-CFPB-0012

FINDINGS

Clearwater Bank failed to provide borrowers with accurate payoff statements within seven business days on 847 occasions between January 2021 and December 2023, affecting approximately $234 million in outstanding loan balances.

The Bank failed to timely credit mortgage payments on 1,243 occasions, resulting in improper late fee assessments totaling $892,000.

REMEDIATION

The Bank shall pay a civil money penalty of $8.75 million within 30 days. The Bank shall establish a consumer remediation fund of $2.1 million within 45 days.

Failure to comply may result in additional civil money penalties of up to $1 million per day per violation.`,
  },
  {
    id: "summit-retail-earnings-q3-yoy",
    label: "Earnings · Q3 FY23 → Q3 FY24",
    caption: "Year-over-year same quarter — traffic, margins, and inventory narrative (Summit Retail Group).",
    docType: "earnings",
    textA: `Summit Retail Group Q3 FY2023 Earnings Call — Excerpt

CEO Dana Cho: Comparable sales increased 2.4% in the quarter. We saw resilient demand in core categories and maintained promotional discipline. We continue to expect full year adjusted EPS in the range of $4.10 to $4.25.

CFO Luis Ortega: Gross margin expanded 40 basis points year over year. Inventory levels are appropriate for the peak season; we feel comfortable with our clearance cadence and do not anticipate meaningful margin pressure from markdowns in Q4.

Supply chain: Transit times have normalized versus last year. We have not seen elevated shrink materially affect results to date.`,

    textB: `Summit Retail Group Q3 FY2024 Earnings Call — Excerpt

CEO Dana Cho: Comparable sales declined 1.1% in the quarter, reflecting softer traffic in suburban markets and a delayed start to the cold-weather assortment. We are revising our full year adjusted EPS outlook to a range of $3.55 to $3.70.

CFO Luis Ortega: Gross margin compressed 110 basis points year over year, driven by deeper promotions to move seasonal inventory and incremental shrink primarily in select metro stores.

Inventory: We ended the quarter with inventory up 12% year over year on a comparable store basis. We are accelerating markdowns in underperforming categories and evaluating further reductions in inbound orders for spring.

On shrink: We have engaged a third-party firm to review loss-prevention controls; we do not yet have an estimate of the recurring impact in FY2025.`,
  },
  {
    id: "ironwood-10k-cyber-2021-2022",
    label: "10-K · cyber risk · FY21 → FY22",
    caption: "Risk factor evolution after a disclosed incident (Ironwood Data Systems).",
    docType: "tenk",
    textA: `Ironwood Data Systems Inc. — Form 10-K Excerpt (Year Ended December 31, 2021)

CYBERSECURITY AND DATA PROTECTION

We maintain administrative, technical, and physical safeguards designed to protect customer data and our networks. We periodically test controls and train employees on phishing and access policies.

To date, we have not experienced a material cybersecurity incident. However, industry threats continue to evolve, and we cannot guarantee that future incidents will not occur.`,

    textB: `Ironwood Data Systems Inc. — Form 10-K Excerpt (Year Ended December 31, 2022)

CYBERSECURITY AND DATA PROTECTION

During the fourth quarter of 2022, we identified unauthorized access to a legacy segment of our customer support environment. We engaged external forensic investigators, notified affected customers where required, and offered credit monitoring where applicable. We recorded $14.3 million in remediation and professional services expenses in the period.

We remain subject to litigation and regulatory inquiry related to the incident. Additional costs and reputational harm may arise depending on the outcome of these matters. Our insurance coverage may not fully cover all claims or future incidents.

Going forward, we are implementing network segmentation, expanded logging, and mandatory multi-factor authentication for all remote access.`,
  },
  {
    id: "atlas-sec-wells-settlement",
    label: "Regulatory · Wells → settled action",
    caption: "Staff response to Wells notice vs. final SEC order (Atlas Biologics).",
    docType: "regulatory",
    textA: `UNITED STATES SECURITIES AND EXCHANGE COMMISSION — WELLS NOTICE CORRESPONDENCE (EXCERPT)
In the Matter of Atlas Biologics Corp.

Outside counsel for Atlas Biologics submitted a response to Staff alleging potential violations of Rule 10b-5 in connection with disclosures in the company's Q2 2023 earnings materials regarding a pivotal trial readout.

The response argues that management's characterization of interim results was consistent with company records and that no intent to mislead can be established. Atlas requests that Staff drop the matter or resolve it without a cease-and-desist order.

No settlement has been proposed. The Wells process remains open.`,

    textB: `SECURITIES AND EXCHANGE COMMISSION — ORDER INSTITUTING CEASE-AND-DESIST PROCEEDINGS (FINAL)
In the Matter of Atlas Biologics Corp., Respondent.

FINDINGS

From June through August 2023, Atlas Biologics, through certain officers, made misleading statements in press releases and investor calls suggesting a higher probability of trial success than was supported by blinded interim data available to management at the time.

ORDER

Respondent shall cease and desist from committing violations of Section 10(b) and Rule 10b-5. Respondent shall pay a civil money penalty of $4.2 million. The company shall retain an independent compliance consultant for eighteen months and adopt revised disclosure procedures for clinical-stage programs.

This order constitutes a final judgment as to the matters alleged.`,
  },
] as const;

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
  const [activePairId, setActivePairId] = useState<string | null>(null);

  const loadSamplePair = (pair: CompareSamplePair) => {
    setTextA(pair.textA);
    setTextB(pair.textB);
    setDocType(pair.docType);
    setActivePairId(pair.id);
    setError("");
    setResult(null);
  };

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("pair");
    if (!param) return;
    const pair = SAMPLE_PAIRS.find((p) => p.id === param);
    if (!pair) return;
    setTextA(pair.textA);
    setTextB(pair.textB);
    setDocType(pair.docType);
    setActivePairId(pair.id);
    setError("");
    setResult(null);
  }, []);

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
          <Link href="/methodology" className="fl-app-nav-text">
            Methodology
          </Link>
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

            <div>
              <p className="fl-app-label">Try a sample pair</p>
              <p className="fl-compare-sample-hint">
                Each pair loads <strong>Document A</strong> (earlier / draft) and <strong>Document B</strong> (later / final) so you can run a real comparison instantly.
              </p>
              <div className="fl-compare-pair-grid">
                {SAMPLE_PAIRS.map((pair) => {
                  const isActive = activePairId === pair.id;
                  return (
                    <button
                      key={pair.id}
                      type="button"
                      onClick={() => loadSamplePair(pair)}
                      className={`fl-compare-pair-card${isActive ? " is-active" : ""}`}
                    >
                      <span className="fl-compare-pair-label">{pair.label}</span>
                      <span className="fl-compare-pair-caption">{pair.caption}</span>
                    </button>
                  );
                })}
              </div>
              {activePairId ? (
                <p className="fl-app-hint fl-app-hint-spaced">Sample loaded. Adjust type in the sidebar if needed, then run comparison.</p>
              ) : null}
            </div>

            <div className="fl-compare-docs">
              <div className="fl-compare-panel">
                <label className="fl-app-label fl-app-label--flush" htmlFor="compare-a">
                  Document A
                </label>
                <textarea
                  id="compare-a"
                  value={textA}
                  onChange={(ev) => {
                    setTextA(ev.target.value);
                    setActivePairId(null);
                  }}
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
                  onChange={(ev) => {
                    setTextB(ev.target.value);
                    setActivePairId(null);
                  }}
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
                <p className="fl-compare-confidence-explainer">
                  These percentages are a <strong>model judgment</strong> of how much <strong>concrete, checkable detail</strong> each text
                  contains (specific figures, dates, named segments, firm claims) versus vague or generic wording—not a statistical
                  confidence interval, model certainty, or a read on stock performance. Use them as a rough signal for how much evidence
                  the comparison is working from in each document.
                </p>
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
