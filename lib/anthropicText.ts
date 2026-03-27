import type Anthropic from "@anthropic-ai/sdk";

export function anthropicTextContent(content: Anthropic.Messages.Message["content"]): string {
  const chunks: string[] = [];
  for (const block of content) {
    if (block.type === "text") {
      chunks.push(block.text);
    }
  }
  return chunks.join("\n").trim();
}
