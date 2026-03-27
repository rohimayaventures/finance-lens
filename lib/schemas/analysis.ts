import { z } from "zod";

export const analysisResultSchema = z
  .object({
    whatTheySaid: z.string(),
    whatItMeans: z.string(),
    keyNumbers: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
        direction: z.string(),
      }),
    ),
    driftSignals: z.array(
      z.object({
        type: z.enum(["hedge", "firm"]),
        quote: z.string(),
      }),
    ),
    flags: z.array(z.object({ text: z.string() })),
    supportingEvidence: z
      .array(
        z.object({
          quote: z.string(),
          context: z.string().optional(),
        }),
      )
      .optional(),
    confidenceScore: z.union([z.number(), z.string(), z.null()]).optional(),
    driftCount: z.number().optional(),
    flagCount: z.number().optional(),
  })
  .transform((o) => {
    const supportingEvidence = (o.supportingEvidence ?? [])
      .map((e) => ({
        quote: e.quote.trim().slice(0, 480),
        context: e.context?.trim().slice(0, 160),
      }))
      .filter((e) => e.quote.length > 0)
      .slice(0, 8);

    let confidenceScore: number | null = null;
    if (o.confidenceScore !== undefined && o.confidenceScore !== null) {
      const n = typeof o.confidenceScore === "string" ? Number(o.confidenceScore) : o.confidenceScore;
      if (typeof n === "number" && Number.isFinite(n)) {
        confidenceScore = Math.max(0, Math.min(100, Math.round(n)));
      }
    }

    return {
      whatTheySaid: o.whatTheySaid,
      whatItMeans: o.whatItMeans,
      keyNumbers: o.keyNumbers,
      driftSignals: o.driftSignals,
      flags: o.flags,
      supportingEvidence,
      confidenceScore,
      driftCount: o.driftSignals.length,
      flagCount: o.flags.length,
    };
  });

export type AnalysisResultValidated = z.infer<typeof analysisResultSchema>;
