import { NextRequest, NextResponse } from "next/server";

type CanvaRequestBody = {
  analysis?: unknown;
};

type AnthropicMessageResponse = {
  content?: Array<{ type?: string; text?: string }>;
};

function extractCanvaUrl(responseBody: AnthropicMessageResponse): string | null {
  const urlRegex = /https?:\/\/(?:www\.)?canva\.com\/[^\s"'<>]+/i;

  for (const block of responseBody.content ?? []) {
    if (block.type !== "text" || !block.text) continue;
    const match = block.text.match(urlRegex);
    if (match?.[0]) return match[0];
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CanvaRequestBody;
    const analysis = body.analysis;

    if (!analysis) {
      return NextResponse.json({ error: "Missing analysis payload" }, { status: 400 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-beta": "mcp-client-2025-04-04",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system:
          "You are a presentation generator. Using the Canva MCP tools available to you, generate a professional presentation from the financial analysis provided. Use brand kit ID: " +
          process.env.CANVA_BRAND_KIT_ID +
          ". Create 7 slides: 1) Title slide with company/doc info, 2) What they said, 3) What it actually means, 4) Key numbers, 5) Language drift signals, 6) Flags worth a closer look, 7) Disclaimer slide. After generating, return ONLY the Canva design URL, nothing else.",
        messages: [
          {
            role: "user",
            content: "Generate a Canva presentation from this financial analysis: " + JSON.stringify(analysis),
          },
        ],
        mcp_servers: [
          {
            type: "url",
            url: "https://mcp.canva.com/mcp",
            name: "canva",
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to generate Canva presentation" }, { status: 500 });
    }

    const payload = (await response.json()) as AnthropicMessageResponse;
    const url = extractCanvaUrl(payload);

    if (!url) {
      return NextResponse.json({ error: "Could not find Canva URL" }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Failed to generate Canva presentation" }, { status: 500 });
  }
}
