import type Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";
import { anthropicTextContent } from "@/lib/anthropicText";
import { looseJsonParse } from "@/lib/jsonFromModel";

type Message = Anthropic.MessageParam;

export async function claudeJsonWithRetry<T>(
  anthropic: Anthropic,
  options: {
    model: string;
    maxTokens: number;
    system: string;
    user: string;
    schema: z.ZodType<T>;
  },
): Promise<T> {
  const messages: Message[] = [{ role: "user", content: options.user }];
  let lastError = "Unknown validation error";

  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await anthropic.messages.create({
      model: options.model,
      max_tokens: options.maxTokens,
      system: options.system,
      messages,
    });

    const rawText = anthropicTextContent(response.content);
    let parsed: unknown;

    try {
      parsed = looseJsonParse(rawText);
    } catch {
      lastError = "Response was not valid JSON.";
      if (attempt === 0) {
        messages.push({ role: "assistant", content: rawText });
        messages.push({
          role: "user",
          content:
            "Your previous reply was not valid JSON. Output ONLY one JSON object exactly as specified in the system message. No markdown code fences, no commentary.",
        });
      }
      continue;
    }

    const checked = options.schema.safeParse(parsed);
    if (checked.success) {
      return checked.data;
    }

    lastError = checked.error.message;
    if (attempt === 0) {
      messages.push({ role: "assistant", content: rawText });
      messages.push({
        role: "user",
        content: `That JSON failed validation: ${lastError}. Output ONLY a corrected JSON object matching the schema. No markdown.`,
      });
    } else {
      throw new Error(lastError);
    }
  }

  throw new Error(lastError);
}
