import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

type AnalyzeBody = {
  text?: string;
  docType?: string;
  driftEnabled?: boolean;
  confidenceEnabled?: boolean;
};

type AnalysisResult = {
  whatTheySaid: string;
  whatItMeans: string;
  keyNumbers: Array<{ value: string; label: string; direction: string }>;
  driftSignals: Array<{ type: "hedge" | "firm"; quote: string }>;
  flags: Array<{ text: string }>;
  confidenceScore: number | null;
  driftCount: number;
  flagCount: number;
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

function extractTextContent(content: Anthropic.Messages.Message["content"]): string {
  const chunks: string[] = [];
  for (const block of content) {
    if (block.type === "text") {
      chunks.push(block.text);
    }
  }
  return chunks.join("\n").trim();
}

function parseJsonResponse(raw: string): AnalysisResult {
  try {
    return JSON.parse(raw) as AnalysisResult;
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(raw.slice(start, end + 1)) as AnalysisResult;
    }
    throw new Error("Could not parse model JSON response");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyzeBody;
    const text = body.text?.trim() ?? "";

    if (!text) {
      return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
    }

    const docType = body.docType ?? "earnings";
    const driftEnabled = body.driftEnabled !== false;
    const confidenceEnabled = body.confidenceEnabled !== false;

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const systemPrompt = [
      "You are FinanceLens AI, a financial document intelligence analyst.",
      getDocSpecificPrompt(docType),
      "",
      "Return ONLY valid JSON, no markdown, no explanation, no preamble.",
      "Use attribution language throughout: \"this may suggest\", \"this is consistent with\", \"this language pattern is typically associated with\".",
      "Never use language that could be interpreted as a buy, sell, or hold recommendation.",
      "Frame all outputs as assistive analysis, not financial advice.",
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
      '  "confidenceScore": number between 0 and 100,',
      '  "driftCount": number,',
      '  "flagCount": number',
      "}",
    ].join("\n");

    const userMessage = `Analyze this document:\n\n${text}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawText = extractTextContent(response.content);
    const parsed = parseJsonResponse(rawText);

    const normalized: AnalysisResult = {
      whatTheySaid: parsed.whatTheySaid ?? "",
      whatItMeans: parsed.whatItMeans ?? "",
      keyNumbers: Array.isArray(parsed.keyNumbers) ? parsed.keyNumbers : [],
      driftSignals: Array.isArray(parsed.driftSignals) ? parsed.driftSignals : [],
      flags: Array.isArray(parsed.flags) ? parsed.flags : [],
      confidenceScore: typeof parsed.confidenceScore === "number" ? Math.max(0, Math.min(100, parsed.confidenceScore)) : null,
      driftCount: typeof parsed.driftCount === "number" ? parsed.driftCount : 0,
      flagCount: typeof parsed.flagCount === "number" ? parsed.flagCount : 0,
    };

    if (!driftEnabled) {
      normalized.driftSignals = [];
      normalized.driftCount = 0;
    } else {
      normalized.driftCount = normalized.driftSignals.length;
    }

    if (!confidenceEnabled) {
      normalized.confidenceScore = null;
    }

    normalized.flagCount = normalized.flags.length;

    return NextResponse.json(normalized);
  } catch {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
