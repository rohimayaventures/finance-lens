import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import type { BriefingDeckPayload, BriefingSlide } from "@/lib/briefingTypes";
import { pollinationsImageUrl, sanitizeBriefingImageUrl } from "@/lib/briefingImageUrl";

/** Payload from /results — same shape as analysis JSON */
type AnalysisInput = {
  whatTheySaid?: string;
  whatItMeans?: string;
  keyNumbers?: Array<{ value: string; label: string; direction: string }>;
  driftSignals?: Array<{ type: string; quote: string }>;
  flags?: Array<{ text: string }>;
  confidenceScore?: number;
};

type RawSlide = {
  headline?: string;
  bullets?: unknown;
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  imagePrompt?: string;
};

type RawOutline = {
  title?: string;
  slides?: RawSlide[];
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

function parseOutlineJson(raw: string): RawOutline {
  try {
    return JSON.parse(raw) as RawOutline;
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(raw.slice(start, end + 1)) as RawOutline;
    }
    throw new Error("Could not parse briefing JSON");
  }
}

function normalizeOutline(parsed: RawOutline): BriefingDeckPayload {
  const title = typeof parsed.title === "string" ? parsed.title.trim() : "Briefing outline";
  const rawSlides = Array.isArray(parsed.slides) ? parsed.slides : [];
  const slides: BriefingSlide[] = rawSlides
    .map((s, idx) => {
      const headline = typeof s.headline === "string" ? s.headline.trim() : "Slide";
      const bullets = Array.isArray(s.bullets)
        ? s.bullets.map((b) => (typeof b === "string" ? b.trim() : "")).filter(Boolean)
        : [];
      const imageAlt =
        typeof s.imageAlt === "string" && s.imageAlt.trim() ? s.imageAlt.trim().slice(0, 280) : undefined;
      const imageCaption =
        typeof s.imageCaption === "string" && s.imageCaption.trim()
          ? s.imageCaption.trim().slice(0, 220)
          : undefined;

      let imageUrl = sanitizeBriefingImageUrl(s.imageUrl);
      const imagePrompt =
        typeof s.imagePrompt === "string" && s.imagePrompt.trim()
          ? s.imagePrompt.trim().slice(0, 320)
          : "";
      if (!imageUrl && imagePrompt) {
        imageUrl = pollinationsImageUrl(imagePrompt, `${idx}-${headline}`);
      }

      const slide: BriefingSlide = { headline, bullets };
      if (imageUrl) slide.imageUrl = imageUrl;
      if (imageUrl) {
        slide.imageAlt =
          imageAlt ?? `Concept illustration supporting the slide: ${headline}`.slice(0, 280);
      }
      if (imageCaption) slide.imageCaption = imageCaption;
      return slide;
    })
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
      "You turn a structured financial document analysis into a briefing deck with text and optional slide visuals.",
      "Return ONLY valid JSON. No markdown fences. No preamble. No Canva URLs.",
      "",
      "Assistive analysis only — no buy/sell/hold. Use attribution phrasing in bullets where appropriate.",
      "",
      "Each slide may include an optional visual:",
      "- imageUrl: OPTIONAL. Only if you have a real https image URL from trusted documentation (usually OMIT). Never invent URLs.",
      "- imagePrompt: OPTIONAL. English description for an abstract editorial or conceptual illustration (think: clean business graphic, charts as shapes, metaphor — no readable words, no logos, no ticker symbols, no specific person's face).",
      "  Use imagePrompt on slides 2–5 where a simple visual would help (aim for 3 slides with imagePrompt; skip on slide 1 title/context and slide 7 disclaimer).",
      "- imageAlt: REQUIRED whenever imageUrl or imagePrompt is set — one short accessibility phrase.",
      "- imageCaption: OPTIONAL — one line caption under the image (not legal advice).",
      "",
      "Exact JSON shape:",
      "{",
      '  "title": "string — deck title, concise",',
      '  "slides": [',
      "    {",
      '      "headline": "string",',
      '      "bullets": ["string", "..."],',
      '      "imageUrl": "optional string — https only or omit",',
      '      "imagePrompt": "optional string — for generated imagery; omit on title/disclaimer slides",',
      '      "imageAlt": "optional string — required if any image field set",',
      '      "imageCaption": "optional string"',
      "    }",
      "  ]",
      "}",
      "",
      "You MUST output exactly 7 slides in this order:",
      "1) Title / context — bullets: company or document context, date if implied, one-line purpose. No imagePrompt.",
      "2) Executive snapshot — bullets: 3–4 highest-signal takeaways. imagePrompt welcome.",
      "3) What it means — bullets: interpretation, no fluff. imagePrompt welcome.",
      "4) Key metrics — bullets: figures with direction from keyNumbers; cite labels. imagePrompt welcome.",
      "5) Language drift — bullets: from driftSignals; if empty say none noted. imagePrompt optional.",
      "6) Flags & watchlist — bullets: from flags; if empty say none noted. Usually omit imagePrompt.",
      "7) Source & disclaimer — bullets: assistive AI only; not financial advice; verify against primary documents. No imagePrompt.",
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
