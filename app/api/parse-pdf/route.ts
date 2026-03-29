import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";

const MAX_TEXT_CHARS = 15_000;

const PARSE_FAILURE_MESSAGE =
  "Could not extract text from this PDF. Please paste the document text directly.";

export async function POST(request: NextRequest) {
  const failResponse = () =>
    NextResponse.json({ error: PARSE_FAILURE_MESSAGE }, { status: 400 });

  let parser: InstanceType<typeof PDFParse> | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing PDF file" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    parser = new PDFParse({ data: buffer });

    let parsed;
    try {
      parsed = await parser.getText();
    } finally {
      try {
        await parser.destroy();
      } catch {
        /* ignore */
      }
      parser = null;
    }

    const rawText = (parsed.text ?? "").trim();
    const pageCount =
      typeof parsed.total === "number" && Number.isFinite(parsed.total)
        ? parsed.total
        : Array.isArray(parsed.pages)
          ? parsed.pages.length
          : 0;

    if (!rawText) {
      return failResponse();
    }

    let text = rawText;
    let truncated = false;
    if (text.length > MAX_TEXT_CHARS) {
      text = text.slice(0, MAX_TEXT_CHARS);
      truncated = true;
      console.warn(
        `[parse-pdf] Truncated extracted text from ${rawText.length} to ${MAX_TEXT_CHARS} characters`,
      );
    }

    return NextResponse.json({ text, pageCount, truncated });
  } catch (err) {
    if (parser) {
      await parser.destroy().catch(() => {});
    }
    console.error("parse-pdf:", err);
    return failResponse();
  }
}
