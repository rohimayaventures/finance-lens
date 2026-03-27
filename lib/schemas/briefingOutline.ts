import { z } from "zod";

/** Raw deck from the model before image URLs are resolved (Unsplash / Pollinations). */
export const briefingOutlineRawSchema = z.object({
  title: z.union([z.string(), z.number()]).transform((t) => String(t).trim()),
  slides: z.array(
    z.object({
      headline: z.union([z.string(), z.number()]).transform((h) => String(h).trim()),
      bullets: z
        .array(z.union([z.string(), z.number()]))
        .transform((arr) => arr.map((b) => String(b).trim()).filter(Boolean)),
      imageUrl: z.string().optional(),
      imageSearchQuery: z.string().optional(),
      imagePrompt: z.string().optional(),
      imageAlt: z.string().optional(),
      imageCaption: z.string().optional(),
    }),
  ),
});

export type BriefingOutlineRaw = z.infer<typeof briefingOutlineRawSchema>;
