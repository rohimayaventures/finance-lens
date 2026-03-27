"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type DocType = "earnings-call" | "10k-filing" | "regulatory-notice";
type InputTab = "paste" | "upload";

const DOC_TYPE_OPTIONS: Array<{ value: DocType; label: string }> = [
  { value: "earnings-call", label: "Earnings call" },
  { value: "10k-filing", label: "10-K filing" },
  { value: "regulatory-notice", label: "Regulatory notice" },
];

export default function AnalyzePage() {
  const router = useRouter();
  const [docType, setDocType] = useState<DocType>("earnings-call");
  const [driftEnabled, setDriftEnabled] = useState(true);
  const [confidenceEnabled, setConfidenceEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<InputTab>("paste");
  const [text, setText] = useState("");
  const [uploadText, setUploadText] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [parsedCharCount, setParsedCharCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const finalText = useMemo(() => {
    if (activeTab === "upload") {
      return uploadText;
    }
    return text;
  }, [activeTab, text, uploadText]);

  const isDisabled = isLoading || finalText.trim().length === 0;

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

            {activeTab === "paste" ? (
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
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
