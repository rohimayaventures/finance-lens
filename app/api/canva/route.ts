import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

/** Payload from /results — same shape as analysis JSON */
type AnalysisInput = {
  whatTheySaid?: string;
  whatItMeans?: string;
  keyNumbers?: Array<{ value: string; label: string; direction: string }>;
  driftSignals?: Array<{ type: string; quote: string }>;
  flags?: Array<{ text: string }>;
  confidenceScore?: number;
};

type Slide = { headline: string; bullets: string[] };

type BriefingOutline = {
  title: string;
  slides: Slide[];
};

function extractTextContent(content: Anthropic.Messages.Message["content"]): string {
  const chunks: string[] = [];
  for (const block of content) {
    if (block.type === "text") {
      chunks.push(block.text);
    }
  }
  return chunks.join("\n").trim();
}

function parseOutlineJson(raw: string): BriefingOutline {
  try {
    return JSON.parse(raw) as BriefingOutline;
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(raw.slice(start, end + 1)) as BriefingOutline;
    }
    throw new Error("Could not parse briefing JSON");
  }
}

function normalizeOutline(parsed: BriefingOutline): BriefingOutline {
  const title = typeof parsed.title === "string" ? parsed.title.trim() : "Briefing outline";
  const rawSlides = Array.isArray(parsed.slides) ? parsed.slides : [];
  const slides: Slide[] = rawSlides
    .map((s) => ({
      headline: typeof s.headline === "string" ? s.headline.trim() : "Slide",
      bullets: Array.isArray(s.bullets)
        ? s.bullets.map((b) => (typeof b === "string" ? b.trim() : "")).filter(Boolean)
        : [],
    }))
    .filter((s) => s.headline.length > 0);

  if (slides.length === 0) {
    return {
      title,
      slides: [{ headline: "Summary", bullets: ["No slide content returned. Try again."] }],
    };
  }

  return { title, slides };
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server missing ANTHROPIC_API_KEY. Add it in Vercel env vars." },
        { status: 503 },
      );
    }

    const analysis = (await req.json()) as AnalysisInput;
    if (!analysis.whatTheySaid && !analysis.whatItMeans) {
      return NextResponse.json({ error: "Invalid analysis payload." }, { status: 400 });
    }

    const anthropic = new Anthropic({ apiKey });

    const systemPrompt = [
      "You turn a structured financial document analysis into a briefing deck OUTLINE (text only).",
      "Return ONLY valid JSON. No markdown fences. No preamble. No Canva URLs.",
      "",
      "Assistive analysis only — no buy/sell/hold. Use attribution phrasing in bullets where appropriate.",
      "",
      "Exact JSON shape:",
      "{",
      '  "title": "string — deck title, concise",',
      '  "slides": [',
      '    { "headline": "string", "bullets": ["string", "..."] }',
      "  ]",
      "}",
      "",
      "You MUST output exactly 7 slides in this order:",
      "1) Title / context — bullets: company or document context, date if implied, one-line purpose.",
      "2) Executive snapshot — bullets: 3–4 highest-signal takeaways.",
      "3) What it means — bullets: interpretation, no fluff.",
      "4) Key metrics — bullets: figures with direction from keyNumbers; cite labels.",
      "5) Language drift — bullets: from driftSignals; if empty say none noted.",
      "6) Flags & watchlist — bullets: from flags; if empty say none noted.",
      "7) Source & disclaimer — bullets: assistive AI only; not financial advice; verify against primary documents.",
    ].join("\n");

    const userPayload = [
      `whatTheySaid: ${analysis.whatTheySaid ?? ""}`,
      `whatItMeans: ${analysis.whatItMeans ?? ""}`,
      `keyNumbers: ${JSON.stringify(analysis.keyNumbers ?? [])}`,
      `driftSignals: ${JSON.stringify(analysis.driftSignals ?? [])}`,
      `flags: ${JSON.stringify(analysis.flags ?? [])}`,
      `confidenceScore: ${analysis.confidenceScore ?? ""}`,
    ].join("\n\n");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: `Build the briefing outline from this analysis:\n\n${userPayload}` }],
    });

    const rawText = extractTextContent(response.content);
    const parsed = parseOutlineJson(rawText);
    const slideContent = normalizeOutline(parsed);

    return NextResponse.json({ slideContent });
  } catch (err) {
    console.error("Briefing outline error:", err);
    return NextResponse.json(
      { error: "Could not generate briefing outline. Check API key and try again." },
      { status: 500 },
    );
  }
}
