import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const analysis = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "mcp-client-2025-04-04"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: `You are a presentation generator. Use the Canva MCP tools to create a professional presentation from the financial analysis provided. 

Steps:
1. Call request-outline-review with 7 slides based on the analysis
2. Call generate-design-structured with the approved outline
3. Call create-design-from-candidate with the first candidate
4. Return ONLY the final Canva design URL in this exact format: {"url": "https://www.canva.com/design/..."}

Do not explain anything. Just execute the steps and return the URL JSON.`,
        messages: [
          {
            role: "user",
            content: `Create a Canva presentation from this financial analysis. Use brand kit ID kAG3mB26BgM. Make it professional and data-focused.

Analysis data:
Title: ${analysis.docTitle || "Financial Analysis"}
What they said: ${analysis.whatTheySaid}
What it means: ${analysis.whatItMeans}
Key numbers: ${JSON.stringify(analysis.keyNumbers)}
Drift signals: ${JSON.stringify(analysis.driftSignals)}
Flags: ${JSON.stringify(analysis.flags)}
Confidence score: ${analysis.confidenceScore}%

Return only the Canva URL JSON when done.`
          }
        ],
        mcp_servers: [
          {
            type: "url",
            url: "https://mcp.canva.com/mcp",
            name: "canva"
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return NextResponse.json({ error: "Generation failed" }, { status: 500 });
    }

    const data = await response.json();
    
    // Find the URL in the response content blocks
    let canvaUrl = "";
    for (const block of data.content) {
      if (block.type === "text") {
        try {
          const parsed = JSON.parse(block.text.replace(/```json|```/g, "").trim());
          if (parsed.url) {
            canvaUrl = parsed.url;
            break;
          }
        } catch {
          // Check if URL is directly in the text
          const match = block.text.match(/https:\/\/www\.canva\.com\/design\/[a-zA-Z0-9_-]+/);
          if (match) {
            canvaUrl = match[0];
            break;
          }
        }
      }
    }

    if (!canvaUrl) {
      return NextResponse.json({ error: "Could not extract Canva URL" }, { status: 500 });
    }

    return NextResponse.json({ url: canvaUrl });

  } catch (error) {
    console.error("Canva route error:", error);
    return NextResponse.json({ error: "Could not generate presentation" }, { status: 500 });
  }
}
