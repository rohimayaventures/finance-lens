import { z } from "zod";

export const compareResultSchema = z
  .object({
    overview: z.string(),
    newLanguage: z.array(z.string()),
    droppedLanguage: z.array(z.string()),
    confidenceA: z.union([z.number(), z.string()]),
    confidenceB: z.union([z.number(), z.string()]),
    confidenceNote: z.string(),
    claimShifts: z.array(z.string()),
    metricsNarrative: z.string(),
  })
  .transform((o) => {
    const a = typeof o.confidenceA === "string" ? Number(o.confidenceA) : o.confidenceA;
    const b = typeof o.confidenceB === "string" ? Number(o.confidenceB) : o.confidenceB;
    return {
      overview: o.overview,
      newLanguage: o.newLanguage,
      droppedLanguage: o.droppedLanguage,
      confidenceA: Math.max(0, Math.min(100, Math.round(Number.isFinite(a) ? a : 0))),
      confidenceB: Math.max(0, Math.min(100, Math.round(Number.isFinite(b) ? b : 0))),
      confidenceNote: o.confidenceNote,
      claimShifts: o.claimShifts,
      metricsNarrative: o.metricsNarrative,
    };
  });

export type CompareResultValidated = z.infer<typeof compareResultSchema>;
