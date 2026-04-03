import { z } from "zod";

export const claimShiftDirectionSchema = z.enum(["firm", "hedge", "neutral", "mixed"]);

export type ClaimShiftDirection = z.infer<typeof claimShiftDirectionSchema>;

const claimShiftDirections: readonly ClaimShiftDirection[] = ["firm", "hedge", "neutral", "mixed"];

function normalizeClaimShiftDirection(raw: unknown): ClaimShiftDirection {
  if (typeof raw !== "string") return "neutral";
  const d = raw.toLowerCase().trim() as ClaimShiftDirection;
  return claimShiftDirections.includes(d) ? d : "neutral";
}

const claimShiftInputSchema = z.union([
  z.string(),
  z.object({
    direction: z.union([claimShiftDirectionSchema, z.string()]).optional(),
    text: z.string(),
  }),
]);

export type ClaimShiftItem = {
  direction: ClaimShiftDirection;
  text: string;
};

function normalizeClaimShiftItem(raw: z.infer<typeof claimShiftInputSchema>): ClaimShiftItem {
  if (typeof raw === "string") {
    return { direction: "neutral", text: raw };
  }
  return {
    direction: normalizeClaimShiftDirection(raw.direction),
    text: raw.text,
  };
}

export const compareResultSchema = z
  .object({
    overview: z.string(),
    newLanguage: z.array(z.string()),
    droppedLanguage: z.array(z.string()),
    confidenceA: z.union([z.number(), z.string()]),
    confidenceB: z.union([z.number(), z.string()]),
    confidenceNote: z.string(),
    claimShifts: z.array(claimShiftInputSchema),
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
      claimShifts: o.claimShifts.map(normalizeClaimShiftItem),
      metricsNarrative: o.metricsNarrative,
    };
  });

export type CompareResultValidated = z.infer<typeof compareResultSchema>;

export function claimDirectionLabel(direction: ClaimShiftDirection): string {
  switch (direction) {
    case "firm":
      return "Firm";
    case "hedge":
      return "Hedge";
    case "mixed":
      return "Mixed";
    default:
      return "Neutral";
  }
}
