import Anthropic from "@anthropic-ai/sdk";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { claudeJsonWithRetry } from "@/lib/claudeJsonWithRetry";
import { deckShareUrl } from "@/lib/publicAppUrl";
import { resolveBriefingImages } from "@/lib/briefingResolveSlides";
import { briefingOutlineRawSchema } from "@/lib/schemas/briefingOutline";
import { getSupabase } from "@/lib/supabase";

/** Payload from /results — same shape as analysis JSON */
type AnalysisInput = {
  whatTheySaid?: string;
  whatItMeans?: string;
  keyNumbers?: Array<{ value: string; label: string; direction: string }>;
  driftSignals?: Array<{ type: string; quote: string }>;
  flags?: Array<{ text: string }>;
  confidenceScore?: number;
};

type BriefingBody = AnalysisInput & {
  document_type?: string;
  document_text?: string;
};

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server missing ANTHROPIC_API_KEY. Add it in Vercel env vars." },
        { status: 503 },
      );
    }

    const body = (await req.json()) as BriefingBody;
    const analysis = body;
    if (!analysis.whatTheySaid && !analysis.whatItMeans) {
      return NextResponse.json({ error: "Invalid analysis payload." }, { status: 400 });
    }

    const anthropic = new Anthropic({ apiKey });

    const unsplashOn = Boolean(process.env.UNSPLASH_ACCESS_KEY?.trim());
    const imageInstructions = unsplashOn
      ? [
          "Slide visuals:",
          "- imageSearchQuery: OPTIONAL — 2–6 English keywords for a stock photograph (abstract ideas: boardroom light, data charts blurred, city skyline soft focus). No company names, no tickers, no real executives. Use on slides 2–5 where helpful (about 3 slides).",
          "- If imageSearchQuery is set, also set imageAlt (short accessibility phrase). imageCaption optional.",
          "- imagePrompt: OPTIONAL — only if you would add a visual but imageSearchQuery is not ideal; used as fallback for abstract generated art when Unsplash is unavailable.",
          "- imageUrl: OPTIONAL — only a verified https URL from the user's materials; otherwise OMIT.",
        ]
      : [
          "Slide visuals:",
          "- imagePrompt: OPTIONAL — short English description for an abstract editorial illustration (no readable words, no logos, no tickers). Use on slides 2–5 (about 3 slides).",
          "- imageSearchQuery: OPTIONAL — same as Unsplash keywords; used when UNSPLASH_ACCESS_KEY is configured on the server.",
          "- imageUrl: OPTIONAL — verified https only; never invent.",
        ];

    const systemPrompt = [
      "You turn a structured financial document analysis into a briefing deck with text and optional slide visuals.",
      "Return ONLY valid JSON. No markdown fences. No preamble. No Canva URLs.",
      "",
      "Assistive analysis only — no buy/sell/hold. Use attribution phrasing in bullets where appropriate.",
      "",
      ...imageInstructions,
      "",
      "Exact JSON shape:",
      "{",
      '  "title": "string — deck title, concise",',
      '  "slides": [',
      "    {",
      '      "headline": "string",',
      '      "bullets": ["string", "..."],',
      '      "imageUrl": "optional string — https only or omit",',
      '      "imageSearchQuery": "optional string — stock photo keywords for Unsplash when unknown brands",',
      '      "imagePrompt": "optional string — abstract illustration fallback",',
      '      "imageAlt": "optional string — required when any image field is set",',
      '      "imageCaption": "optional string"',
      "    }",
      "  ]",
      "}",
      "",
      "You MUST output exactly 7 slides in this order:",
      "1) Title / context — no imageSearchQuery or imagePrompt.",
      "2) Executive snapshot — visual welcome.",
      "3) What it means — visual welcome.",
      "4) Key metrics — visual welcome.",
      "5) Language drift — visual optional.",
      "6) Flags & watchlist — usually no visual.",
      "7) Source & disclaimer — no visual.",
    ].join("\n");

    const userPayload = [
      `whatTheySaid: ${analysis.whatTheySaid ?? ""}`,
      `whatItMeans: ${analysis.whatItMeans ?? ""}`,
      `keyNumbers: ${JSON.stringify(analysis.keyNumbers ?? [])}`,
      `driftSignals: ${JSON.stringify(analysis.driftSignals ?? [])}`,
      `flags: ${JSON.stringify(analysis.flags ?? [])}`,
      `confidenceScore: ${analysis.confidenceScore ?? ""}`,
    ].join("\n\n");

    const rawOutline = await claudeJsonWithRetry(anthropic, {
      model: "claude-sonnet-4-20250514",
      maxTokens: 4096,
      system: systemPrompt,
      user: `Build the briefing outline from this analysis:\n\n${userPayload}`,
      schema: briefingOutlineRawSchema,
    });

    const slideContent = await resolveBriefingImages(rawOutline);

    const documentType = typeof body.document_type === "string" && body.document_type.trim() ? body.document_type.trim() : "earnings";
    const documentText =
      typeof body.document_text === "string" ? body.document_text.slice(0, 5000) : "";

    const shareSlug = nanoid(10);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    let shareUrl: string | null = null;
    let persistedSlug: string | null = null;

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from("financelens_sessions").insert({
          document_type: documentType,
          document_text: documentText,
          analysis: null,
          slides: slideContent.slides,
          share_slug: shareSlug,
          layout: "briefing",
          expires_at: expiresAt,
        });
        if (error) {
          console.error("financelens_sessions insert (briefing):", error);
        } else {
          shareUrl = deckShareUrl(shareSlug);
          persistedSlug = shareSlug;
        }
      } catch (err) {
        console.error("financelens_sessions insert (briefing):", err);
      }
    } else {
      console.warn("financelens_sessions insert (briefing): Supabase env vars missing; skipping persist.");
    }

    return NextResponse.json({
      title: slideContent.title,
      slides: slideContent.slides,
      shareUrl,
      shareSlug: persistedSlug,
    });
  } catch (err) {
    console.error("Briefing outline error:", err);
    return NextResponse.json(
      { error: "Could not generate briefing outline. Check API key and try again." },
      { status: 500 },
    );
  }
}
