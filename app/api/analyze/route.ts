import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { claudeJsonWithRetry } from "@/lib/claudeJsonWithRetry";
import { analysisResultSchema } from "@/lib/schemas/analysis";

type AnalyzeBody = {
  text?: string;
  docType?: string;
  driftEnabled?: boolean;
  confidenceEnabled?: boolean;
};

function getDocSpecificPrompt(rawDocType: string): string {
  const normalized = rawDocType.toLowerCase();

  if (normalized.includes("10k") || normalized.includes("tenk")) {
    return [
      "Document type: 10-K annual filing.",
      "Analyze specifically for:",
      "- auditor changes",
      "- revenue concentration risk",
      "- risk factor additions vs prior year",
      "- going concern language",
      "- related party transactions",
    ].join("\n");
  }

  if (normalized.includes("regulatory")) {
    return [
      "Document type: regulatory notice.",
      "Analyze specifically for:",
      "- compliance obligation specificity",
      "- enforcement language intensity",
      "- timeline requirements",
      "- penalty exposure framing",
    ].join("\n");
  }

  return [
    "Document type: earnings call.",
    "Analyze specifically for:",
    "- management tone",
    "- guidance language",
    "- selective disclosure by segment",
    "- Q&A evasion",
    "- forward-looking statement confidence",
  ].join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server missing ANTHROPIC_API_KEY." }, { status: 503 });
    }

    const body = (await request.json()) as AnalyzeBody;
    const text = body.text?.trim() ?? "";

    if (!text) {
      return NextResponse.json({ error: "Document text is required." }, { status: 400 });
    }

    const docType = body.docType ?? "earnings";
    const driftEnabled = body.driftEnabled !== false;
    const confidenceEnabled = body.confidenceEnabled !== false;

    const anthropic = new Anthropic({ apiKey });

    const systemPrompt = [
      "You are FinanceLens AI, a financial document intelligence analyst.",
      getDocSpecificPrompt(docType),
      "",
      "Return ONLY valid JSON, no markdown, no explanation, no preamble.",
      "Use attribution language throughout: \"this may suggest\", \"this is consistent with\", \"this language pattern is typically associated with\".",
      "Never use language that could be interpreted as a buy, sell, or hold recommendation.",
      "Frame all outputs as assistive analysis, not financial advice.",
      "",
      "supportingEvidence: 2–6 objects. Each quote must be a short verbatim or near-verbatim excerpt from the user's document (max ~240 characters per quote).",
      "context is optional (e.g. speaker, section name). If the excerpt has no strong anchor phrases, include fewer items.",
      "",
      "Return this exact JSON shape:",
      "{",
      '  "whatTheySaid": "string — plain language translation, no interpretation",',
      '  "whatItMeans": "string — interpretation with spin removed, direct language",',
      '  "keyNumbers": [',
      '    { "value": "string e.g. $847M", "label": "string e.g. Q3 Revenue", "direction": "string e.g. +12% YoY or -5% from prior" }',
      "  ],",
      '  "driftSignals": [',
      '    { "type": "hedge" or "firm", "quote": "string — specific phrase with context" }',
      "  ],",
      '  "flags": [',
      '    { "text": "string — specific flag with evidence" }',
      "  ],",
      '  "supportingEvidence": [',
      '    { "quote": "string — anchored to source text", "context": "optional string" }',
      "  ],",
      '  "confidenceScore": integer 0–100 or null — your estimate of how well-supported this analysis is by concrete detail in the source excerpt: richer numbers, named entities, specific claims => higher; sparse or ambiguous text => lower. Not a statistical confidence interval and not a performance prediction.',
      "}",
    ].join("\n");

    const userMessage = `Analyze this document:\n\n${text}`;

    let normalized = await claudeJsonWithRetry(anthropic, {
      model: "claude-sonnet-4-20250514",
      maxTokens: 4096,
      system: systemPrompt,
      user: userMessage,
      schema: analysisResultSchema,
    });

    if (!driftEnabled) {
      normalized = {
        ...normalized,
        driftSignals: [],
        driftCount: 0,
      };
    }

    if (!confidenceEnabled) {
      normalized = { ...normalized, confidenceScore: null };
    }

    normalized.flagCount = normalized.flags.length;

    return NextResponse.json(normalized);
  } catch {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
