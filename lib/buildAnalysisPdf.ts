import { PDFDocument, StandardFonts, type PDFFont, type PDFPage, rgb } from "pdf-lib";

/** Align with app design tokens (globals.css) */
const INK = rgb(28 / 255, 28 / 255, 30 / 255);
const RED = rgb(192 / 255, 57 / 255, 43 / 255);
const GRAY = rgb(85 / 255, 85 / 255, 85 / 255);
const GREEN = rgb(26 / 255, 122 / 255, 60 / 255);
const AMBER = rgb(154 / 255, 107 / 255, 0);
const MUTED = rgb(153 / 255, 153 / 255, 153 / 255);

const PAGE_W = 612;
const PAGE_H = 792;
const M = 54;
const CONTENT_W = PAGE_W - 2 * M;
const FOOTER_RESERVE = 44;
const LINE_11 = 13;
const LINE_10 = 12;

export type PdfAnalysisPayload = {
  docType: string;
  preview: string;
  analysis: {
    whatTheySaid: string;
    whatItMeans: string;
    keyNumbers: Array<{ value: string; label: string; direction: string }>;
    driftSignals: Array<{ type: string; quote: string }>;
    flags: Array<{ text: string }>;
    supportingEvidence?: Array<{ quote: string; context?: string }>;
    confidenceScore: number | null;
    driftCount: number;
    flagCount: number;
  };
};

/** Helvetica / WinAnsi — strip chars that break encoding */
function safePdfText(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2026]/g, "...")
    .replace(/[^\n\t\x20-\x7E]/g, (ch) => {
      const c = ch.charCodeAt(0);
      if (c >= 0xa0 && c <= 0xff) return ch;
      return "";
    });
}

function wrapToWidth(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const t = safePdfText(text).trim();
  if (!t) return [];
  const words = t.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const attempt = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(attempt, size) <= maxW) line = attempt;
    else {
      if (line) lines.push(line);
      if (font.widthOfTextAtSize(w, size) > maxW) {
        let chunk = "";
        for (const ch of w) {
          const next = chunk + ch;
          if (font.widthOfTextAtSize(next, size) <= maxW) chunk = next;
          else {
            if (chunk) lines.push(chunk);
            chunk = ch;
          }
        }
        line = chunk;
      } else line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function wrapParagraphs(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const parts = safePdfText(text).split(/\n+/);
  const out: string[] = [];
  for (const p of parts) {
    const trimmed = p.trim();
    if (!trimmed) {
      out.push("");
      continue;
    }
    out.push(...wrapToWidth(trimmed, font, size, maxW));
    out.push("");
  }
  while (out.length && out[out.length - 1] === "") out.pop();
  return out;
}

type Ctx = {
  pdfDoc: PDFDocument;
  page: PDFPage;
  y: number;
  font: PDFFont;
  fontBold: PDFFont;
  pageNum: number;
};

function footerText(n: number): string {
  return `FinanceLens AI · Page ${n} · Assistive analysis only — not financial advice`;
}

function drawFooter(ctx: Ctx): void {
  const ft = footerText(ctx.pageNum);
  const w = ctx.font.widthOfTextAtSize(ft, 8);
  ctx.page.drawText(ft, {
    x: (PAGE_W - w) / 2,
    y: 28,
    size: 8,
    font: ctx.font,
    color: MUTED,
  });
}

function newPage(ctx: Ctx): void {
  ctx.page = ctx.pdfDoc.addPage([PAGE_W, PAGE_H]);
  ctx.pageNum += 1;
  ctx.y = PAGE_H - M;
  drawFooter(ctx);
  ctx.y -= LINE_10 + 8;
}

function ensureSpace(ctx: Ctx, need: number): void {
  if (ctx.y - need < FOOTER_RESERVE) newPage(ctx);
}

function drawSectionTitle(ctx: Ctx, title: string): void {
  ensureSpace(ctx, 28);
  const t = title.toUpperCase();
  ctx.page.drawText(t, { x: M, y: ctx.y, size: 10, font: ctx.fontBold, color: INK });
  const tw = ctx.fontBold.widthOfTextAtSize(t, 10);
  const lineW = Math.min(tw + 32, CONTENT_W);
  ctx.page.drawLine({
    start: { x: M, y: ctx.y - 4 },
    end: { x: M + lineW, y: ctx.y - 4 },
    thickness: 1.2,
    color: INK,
  });
  ctx.y -= 20;
}

function drawLines(ctx: Ctx, lines: string[], size: number, color = INK, lineHeight?: number): void {
  const lh = lineHeight ?? (size + 3);
  for (const line of lines) {
    if (line === "") {
      ctx.y -= lh * 0.35;
      continue;
    }
    ensureSpace(ctx, lh);
    ctx.page.drawText(line, { x: M, y: ctx.y, size, font: ctx.font, color });
    ctx.y -= lh;
  }
}

function drawMetaLine(ctx: Ctx, label: string, value: string): void {
  ensureSpace(ctx, LINE_11);
  const prefix = `${label}: `;
  ctx.page.drawText(prefix, { x: M, y: ctx.y, size: 10, font: ctx.fontBold, color: INK });
  const pw = ctx.fontBold.widthOfTextAtSize(prefix, 10);
  ctx.page.drawText(value, { x: M + pw, y: ctx.y, size: 10, font: ctx.font, color: GRAY });
  ctx.y -= LINE_11 + 4;
}

export async function buildAnalysisPdfBytes(payload: PdfAnalysisPayload): Promise<Uint8Array> {
  const { docType, preview, analysis } = payload;

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  const ctx: Ctx = { pdfDoc, page, y: PAGE_H - M, font, fontBold, pageNum: 1 };

  drawFooter(ctx);
  ctx.y -= LINE_10 + 12;

  // Brand rule + wordmark
  ctx.page.drawRectangle({
    x: M,
    y: ctx.y - 2,
    width: CONTENT_W,
    height: 3,
    color: RED,
  });
  ctx.y -= 20;

  const brandSize = 22;
  const finance = "Finance";
  ctx.page.drawText(finance, { x: M, y: ctx.y, size: brandSize, font: fontBold, color: INK });
  const fx = M + fontBold.widthOfTextAtSize(finance, brandSize);
  ctx.page.drawText("Lens", { x: fx, y: ctx.y, size: brandSize, font: fontBold, color: RED });
  ctx.page.drawText(" AI", {
    x: fx + fontBold.widthOfTextAtSize("Lens", brandSize),
    y: ctx.y,
    size: brandSize,
    font: fontBold,
    color: INK,
  });
  ctx.y -= 26;

  ctx.page.drawText("DOCUMENT INTELLIGENCE REPORT", {
    x: M,
    y: ctx.y,
    size: 9,
    font: fontBold,
    color: GRAY,
  });
  ctx.y -= 22;

  const previewLine = safePdfText(preview.slice(0, 200));
  drawLines(ctx, wrapToWidth(previewLine || "—", font, 12, CONTENT_W), 12, INK, 15);

  const docLabel =
    docType === "earnings" ? "Earnings call" : docType === "tenk" ? "10-K filing" : "Regulatory notice";
  drawMetaLine(ctx, "Document type", docLabel);
  drawMetaLine(
    ctx,
    "Model confidence",
    analysis.confidenceScore != null ? `${analysis.confidenceScore}%` : "Not scored",
  );
  drawMetaLine(ctx, "Signals", `${analysis.flagCount} flags · ${analysis.driftCount} drift`);

  ctx.y -= 8;

  drawSectionTitle(ctx, "What they said");
  drawLines(ctx, wrapParagraphs(analysis.whatTheySaid, font, 11, CONTENT_W), 11);

  if (analysis.supportingEvidence?.length) {
    drawSectionTitle(ctx, "Source anchors");
    for (const ev of analysis.supportingEvidence) {
      drawLines(ctx, wrapParagraphs(`"${ev.quote}"`, font, 10, CONTENT_W), 10, INK, 12);
      if (ev.context?.trim()) {
        drawLines(ctx, wrapToWidth(`— ${ev.context.trim()}`, font, 9, CONTENT_W), 9, GRAY, 11);
      }
      ctx.y -= 6;
    }
  }

  drawSectionTitle(ctx, "What it actually means");
  drawLines(ctx, wrapParagraphs(analysis.whatItMeans, font, 11, CONTENT_W), 11);

  drawSectionTitle(ctx, "Key numbers");
  for (const kn of analysis.keyNumbers) {
    const line = `${kn.label} — ${kn.value} (${kn.direction})`;
    drawLines(ctx, wrapToWidth(line, font, 10, CONTENT_W), 10, INK, 12);
  }
  if (!analysis.keyNumbers.length) {
    drawLines(ctx, ["None listed."], 10, GRAY);
  }

  drawSectionTitle(ctx, "Language drift");
  for (const d of analysis.driftSignals) {
    ensureSpace(ctx, LINE_11 + 4);
    ctx.page.drawText(`[${d.type}]`, { x: M, y: ctx.y, size: 9, font: fontBold, color: d.type === "firm" ? GREEN : AMBER });
    ctx.y -= LINE_11 + 2;
    drawLines(ctx, wrapParagraphs(d.quote, font, 10, CONTENT_W), 10, INK, 12);
    ctx.y -= 4;
  }
  if (!analysis.driftSignals.length) {
    drawLines(ctx, ["None noted."], 10, GRAY);
  }

  drawSectionTitle(ctx, "Worth a closer look");
  for (let i = 0; i < analysis.flags.length; i++) {
    const f = analysis.flags[i];
    ensureSpace(ctx, LINE_11);
    ctx.page.drawText(`Flag ${i + 1}`, { x: M, y: ctx.y, size: 9, font: fontBold, color: RED });
    ctx.y -= LINE_11 + 2;
    drawLines(ctx, wrapParagraphs(f.text, font, 10, CONTENT_W), 10, INK, 12);
    ctx.y -= 6;
  }
  if (!analysis.flags.length) {
    drawLines(ctx, ["None listed."], 10, GRAY);
  }

  ctx.y -= 10;
  ensureSpace(ctx, 56);
  ctx.page.drawLine({
    start: { x: M, y: ctx.y - 6 },
    end: { x: M + CONTENT_W, y: ctx.y - 6 },
    thickness: 0.75,
    color: MUTED,
  });
  ctx.y -= 18;
  const disc = [
    "This report was produced by FinanceLens AI for informational purposes only. It is not investment, legal, or accounting advice.",
    "Do not make investment decisions based solely on this output. Verify all material points against primary documents.",
    "hannahkraulikpagade.com",
  ];
  for (const d of disc) {
    drawLines(ctx, wrapToWidth(d, font, 8, CONTENT_W), 8, GRAY, 11);
  }

  return pdfDoc.save();
}
