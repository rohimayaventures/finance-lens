import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const analysis = await req.json();

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: `You are a presentation content writer. Return ONLY valid JSON, no markdown, no explanation.`,
      messages: [{
        role: "user",
        content: `Create a 7-slide presentation outline from this financial analysis. Return JSON in this exact shape:
{
  "title": "string — company name and doc type",
  "slides": [
    { "headline": "string — short punchy headline max 8 words", "bullets": ["string", "string", "string"] }
  ]
}

Make slide 1 a title slide, slides 2-6 cover the 5 analysis sections, slide 7 is the disclaimer.
Keep each bullet under 12 words. Be direct, not corporate.

Analysis: ${JSON.stringify(analysis)}`
      }]
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const clean = text.replace(/```json|```/g, "").trim();
    const slideContent = JSON.parse(clean);

    return NextResponse.json({ 
      success: true, 
      slideContent,
      message: "Slide content generated. Open Canva to create your deck.",
      canvaUrl: "https://www.canva.com/create/presentations/"
    });

  } catch (error) {
    console.error("Canva route error:", error);
    return NextResponse.json({ error: "Could not generate slide content" }, { status: 500 });
  }
}
