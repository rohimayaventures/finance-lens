import Link from "next/link";
import { notFound } from "next/navigation";
import { DeckViewer, type SharedAnalysis } from "@/components/DeckViewer";
import type { BriefingSlide } from "@/lib/briefingTypes";
import { compareResultSchema } from "@/lib/schemas/compare";
import { getPublicAppUrl } from "@/lib/publicAppUrl";
import { isShareSessionExpired } from "@/lib/shareSessionExpiry";
import { getSupabase } from "@/lib/supabase";

type SessionRow = {
  slides: unknown;
  analysis: unknown;
  expires_at: string;
  layout?: string | null;
};

export default async function SharedDeckPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const homeUrl = getPublicAppUrl();

  const supabase = getSupabase();
  if (!supabase) {
    return <SharedDeckUnavailable homeUrl={homeUrl} />;
  }

  const { data, error } = await supabase
    .from("financelens_sessions")
    .select("slides, analysis, expires_at, layout")
    .eq("share_slug", slug)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const row = data as SessionRow;
  if (isShareSessionExpired(row.expires_at)) {
    return <ExpiredDeck homeUrl={homeUrl} />;
  }

  const layoutCol = typeof row.layout === "string" && row.layout.trim() ? row.layout.trim() : null;
  const analysisObj = row.analysis != null && typeof row.analysis === "object" ? row.analysis : null;
  const slides = Array.isArray(row.slides) ? (row.slides as BriefingSlide[]) : null;
  const hasSlides = Boolean(slides && slides.length > 0);

  const common = {
    expiresAtIso: row.expires_at,
    homeUrl,
  };

  if (hasSlides) {
    return (
      <DeckViewer
        layout="briefing"
        slides={slides}
        analysis={null}
        compareResult={null}
        {...common}
      />
    );
  }

  if (!analysisObj) {
    notFound();
  }

  if (layoutCol === "compare") {
    const parsed = compareResultSchema.safeParse(analysisObj);
    if (!parsed.success) {
      return (
        <DeckViewer
          layout="compare"
          slides={null}
          analysis={null}
          compareResult={null}
          compareInvalid
          {...common}
        />
      );
    }
    return (
      <DeckViewer
        layout="compare"
        slides={null}
        analysis={null}
        compareResult={parsed.data}
        {...common}
      />
    );
  }

  const single = analysisObj as SharedAnalysis;
  const hasSingleDoc = Boolean(single.whatTheySaid?.trim() || single.whatItMeans?.trim());
  if (hasSingleDoc) {
    return (
      <DeckViewer layout="analysis" slides={null} analysis={single} compareResult={null} {...common} />
    );
  }

  const legacyCompare = compareResultSchema.safeParse(analysisObj);
  if (legacyCompare.success) {
    return (
      <DeckViewer
        layout="compare"
        slides={null}
        analysis={null}
        compareResult={legacyCompare.data}
        {...common}
      />
    );
  }

  notFound();
}

function SharedDeckUnavailable({ homeUrl }: { homeUrl: string }) {
  return (
    <div className="fl-viewer-missing">
      <p className="fl-viewer-missing-title">Shared decks are not configured</p>
      <p className="fl-viewer-missing-copy">
        This deployment is missing storage settings for share links. Try the main FinanceLens site or contact the operator.
      </p>
      <Link href={homeUrl} className="fl-app-nav-btn">
        Back to FinanceLens AI
      </Link>
    </div>
  );
}

function ExpiredDeck({ homeUrl }: { homeUrl: string }) {
  return (
    <div className="fl-viewer-missing">
      <p className="fl-viewer-missing-title">This shared deck has expired</p>
      <p className="fl-viewer-missing-copy">
        Shared links last 30 days. Run a new analysis on FinanceLens to create a fresh link.
      </p>
      <Link href={homeUrl} className="fl-app-nav-btn">
        Back to FinanceLens AI
      </Link>
    </div>
  );
}
