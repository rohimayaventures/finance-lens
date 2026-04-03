import Anthropic from "@anthropic-ai/sdk";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { claudeJsonWithRetry } from "@/lib/claudeJsonWithRetry";
import { compareResultSchema } from "@/lib/schemas/compare";
import { deckShareUrl } from "@/lib/publicAppUrl";
import { getSupabase } from "@/lib/supabase";

/** Vercel: allow long Claude runs (align with /api/analyze). */
export const maxDuration = 120;

type CompareBody = {
  textA?: string;
  textB?: string;
  /** Document type for both texts (sidebar selector). */
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
      "For each claimShifts item, set direction: firm = more definitive or assertive in B; hedge = more qualified or cautious; neutral = shift in framing without a clear firm/hedge tilt; mixed = both firming and hedging in the same theme.",
      "",
      "Return this exact JSON shape:",
      "{",
      '  "overview": "string — 2–4 sentences on the main narrative shift A→B",',
      '  "newLanguage": ["string — concrete phrase or theme introduced in B"],',
      '  "droppedLanguage": ["string — phrasing or emphasis present in A that weakens or vanishes in B"],',
      '  "confidenceA": integer 0–100 — your estimate of evidence density in A: specific numbers, dates, named lines of business, and firm assertions score higher; hand-wavy or generic language scores lower. Not statistical confidence or a stock prediction.',
      '  "confidenceB": integer 0–100 — same rubric for B.',
      '  "confidenceNote": "string — one sentence on how the two scores differ, with attribution framing (not certainty)",',
      '  "claimShifts": [',
      '    { "direction": "firm" | "hedge" | "neutral" | "mixed", "text": "string — how certainty, scope, or backing shifted from A to B" }',
      "  ],",
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

    const shareSlug = nanoid(10);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const documentType = docType;
    const aPart = textA.slice(0, 2500);
    const bPart = textB.slice(0, 2500);
    let documentText = `${aPart} | ${bPart}`;
    if (documentText.length > 5000) {
      documentText = documentText.slice(0, 5000);
    }

    let shareSlugOut: string | null = null;
    let shareUrlOut: string | null = null;

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from("financelens_sessions").insert({
          document_type: documentType,
          document_text: documentText,
          analysis: normalized,
          slides: null,
          share_slug: shareSlug,
          layout: "compare",
          expires_at: expiresAt,
        });
        if (error) {
          console.error("financelens_sessions insert (compare):", error);
        } else {
          shareSlugOut = shareSlug;
          shareUrlOut = deckShareUrl(shareSlug);
        }
      } catch (err) {
        console.error("financelens_sessions insert (compare):", err);
      }
    } else {
      console.warn("financelens_sessions insert (compare): Supabase env vars missing; skipping persist.");
    }

    return NextResponse.json({
      ...normalized,
      shareSlug: shareSlugOut,
      shareUrl: shareUrlOut,
    });
  } catch {
    return NextResponse.json({ error: "Compare failed" }, { status: 500 });
  }
}
