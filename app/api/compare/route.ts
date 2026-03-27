import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { claudeJsonWithRetry } from "@/lib/claudeJsonWithRetry";
import { compareResultSchema } from "@/lib/schemas/compare";

type CompareBody = {
  textA?: string;
  textB?: string;
  docType?: string;
};

function getDocContext(rawDocType: string): string {
  const normalized = rawDocType.toLowerCase();

  if (normalized.includes("10k") || normalized.includes("tenk")) {
    return "Both documents are 10-K-style filings. Focus on risk-factor deltas, MD&A tone, auditor references, and concentration disclosures.";
  }

  if (normalized.includes("regulatory")) {
    return "Both documents are regulatory or enforcement-style. Focus on obligation changes, penalty framing, timelines, and remediation language.";
  }

  return "Both documents are earnings-call or management commentary style. Focus on guidance wording, segment emphasis, Q&A evasion, and certainty vs hedging.";
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server missing ANTHROPIC_API_KEY." }, { status: 503 });
    }

    const body = (await request.json()) as CompareBody;
    const textA = body.textA?.trim() ?? "";
    const textB = body.textB?.trim() ?? "";

    if (!textA || !textB) {
      return NextResponse.json({ error: "Both documents are required." }, { status: 400 });
    }

    const docType = body.docType ?? "earnings";
    const anthropic = new Anthropic({ apiKey });

    const systemPrompt = [
      "You are FinanceLens AI, a financial document intelligence analyst.",
      getDocContext(docType),
      "",
      "You will receive DOCUMENT A and DOCUMENT B. Treat B as the more recent or successor text unless the user content clearly implies otherwise.",
      "Surface: new language or emphasis in B; language or themes that disappeared or softened from A to B; shifts between firm and hedging claims; metric or guidance framing changes.",
      "",
      "Return ONLY valid JSON — no markdown, no preamble.",
      "Use attribution phrasing throughout string fields: \"this may suggest\", \"this is consistent with\", \"this language pattern is typically associated with\".",
      "Never imply buy, sell, or hold. Assistive analysis only.",
      "",
      "Return this exact JSON shape:",
      "{",
      '  "overview": "string — 2–4 sentences on the main narrative shift A→B",',
      '  "newLanguage": ["string — concrete phrase or theme introduced in B"],',
      '  "droppedLanguage": ["string — phrasing or emphasis present in A that weakens or vanishes in B"],',
      '  "confidenceA": integer 0–100 — your estimate of evidence density in A: specific numbers, dates, named lines of business, and firm assertions score higher; hand-wavy or generic language scores lower. Not statistical confidence or a stock prediction.',
      '  "confidenceB": integer 0–100 — same rubric for B.',
      '  "confidenceNote": "string — one sentence on how the two scores differ, with attribution framing (not certainty)",',
      '  "claimShifts": ["string — e.g. certainty vs hedging, metric backing vs assertion"],',
      '  "metricsNarrative": "string — guidance, KPI, or penalty numbers that change framing between A and B, or state if none materially shifted"',
      "}",
    ].join("\n");

    const userMessage = ["DOCUMENT A:", textA, "", "DOCUMENT B:", textB].join("\n");

    const normalized = await claudeJsonWithRetry(anthropic, {
      model: "claude-sonnet-4-20250514",
      maxTokens: 4096,
      system: systemPrompt,
      user: userMessage,
      schema: compareResultSchema,
    });

    return NextResponse.json(normalized);
  } catch {
    return NextResponse.json({ error: "Compare failed" }, { status: 500 });
  }
}
