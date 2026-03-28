import { NextRequest, NextResponse } from "next/server";
import { buildAnalysisPdfBytes, type PdfAnalysisPayload } from "@/lib/buildAnalysisPdf";

export const runtime = "nodejs";
export const maxDuration = 60;

function safeFilename(preview: string): string {
  const base = preview
    .slice(0, 48)
    .replace(/[^\w\s-]+/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return base || "analysis";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      preview?: string;
      docType?: string;
      analysis?: unknown;
    };

    const preview = typeof body.preview === "string" ? body.preview : "";
    const docType = typeof body.docType === "string" ? body.docType : "earnings";
    const analysis = body.analysis;

    if (!analysis || typeof analysis !== "object") {
      return NextResponse.json({ error: "Missing analysis payload." }, { status: 400 });
    }

    const bytes = await buildAnalysisPdfBytes({
      docType,
      preview,
      analysis: analysis as PdfAnalysisPayload["analysis"],
    });

    const name = safeFilename(preview);
    const filename = `FinanceLens-${name}.pdf`;

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("export-pdf:", err);
    return NextResponse.json({ error: "PDF export failed." }, { status: 500 });
  }
}
