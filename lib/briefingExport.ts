/**
 * Client-only: builds a downloadable .pptx from briefing slide content.
 */

import type { BriefingDeckPayload } from "./briefingTypes";

export type { BriefingDeckPayload };

function safeFileBase(name: string): string {
  const trimmed = name.trim() || "FinanceLens-briefing";
  const ascii = trimmed.replace(/[^\w\d\-]+/g, "-").replace(/^-+|-+$/g, "");
  return ascii.slice(0, 72) || "FinanceLens-briefing";
}

async function imageUrlToDataUrl(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return undefined;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onloadend = () => resolve(fr.result as string);
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

export async function downloadBriefingPptx(content: BriefingDeckPayload): Promise<void> {
  const pptxgen = (await import("pptxgenjs")).default;
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE_16x9";
  pptx.title = content.title;
  pptx.author = "FinanceLens AI";
  pptx.subject = "Document analysis briefing";

  for (const s of content.slides) {
    const slide = pptx.addSlide();
    slide.background = { color: "F4F1EB" };

    let imageData: string | undefined;
    if (s.imageUrl) {
      imageData = await imageUrlToDataUrl(s.imageUrl);
    }
    const useImage = Boolean(imageData);

    const titleW = useImage ? 7.15 : 12.2;
    slide.addText(s.headline, {
      x: 0.55,
      y: 0.5,
      w: titleW,
      h: 1.12,
      fontSize: 26,
      bold: true,
      color: "111111",
      fontFace: "Calibri",
    });

    const bodyY = 1.68;
    if (useImage && imageData) {
      slide.addImage({
        data: imageData,
        x: 7.92,
        y: bodyY,
        w: 4.85,
        h: 4.25,
        rounding: true,
      });
      const capY = bodyY + 4.32;
      if (s.imageCaption) {
        slide.addText(s.imageCaption, {
          x: 7.92,
          y: capY,
          w: 4.85,
          h: 0.55,
          fontSize: 10,
          italic: true,
          color: "555555",
          fontFace: "Calibri",
        });
      }
      if (s.imageAttribution) {
        slide.addText(s.imageAttribution, {
          x: 7.92,
          y: capY + (s.imageCaption ? 0.58 : 0),
          w: 4.85,
          h: 0.42,
          fontSize: 8,
          color: "888888",
          fontFace: "Calibri",
        });
      }
      if (s.bullets.length > 0) {
        const textParts = s.bullets.map((b) => ({
          text: b,
          options: { bullet: true as const, breakLine: true as const },
        }));
        slide.addText(textParts, {
          x: 0.65,
          y: bodyY,
          w: 6.95,
          h: 5.05,
          fontSize: 15,
          color: "2D2D2D",
          fontFace: "Calibri",
          valign: "top",
        });
      }
    } else if (s.bullets.length > 0) {
      const textParts = s.bullets.map((b) => ({
        text: b,
        options: { bullet: true as const, breakLine: true as const },
      }));
      slide.addText(textParts, {
        x: 0.65,
        y: bodyY,
        w: 11.9,
        h: 5.2,
        fontSize: 15,
        color: "2D2D2D",
        fontFace: "Calibri",
        valign: "top",
      });
    }
  }

  const base = safeFileBase(content.title);
  await pptx.writeFile({ fileName: `${base}.pptx` });
}
