import Link from "next/link";
import { DeckViewer, type SharedAnalysis } from "@/components/DeckViewer";
import type { BriefingSlide } from "@/lib/briefingTypes";
import { getPublicAppUrl } from "@/lib/publicAppUrl";
import { isShareSessionExpired } from "@/lib/shareSessionExpiry";
import { getSupabase } from "@/lib/supabase";

type SessionRow = {
  slides: unknown;
  analysis: unknown;
  expires_at: string;
};

export default async function SharedDeckPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const homeUrl = getPublicAppUrl();

  const supabase = getSupabase();
  if (!supabase) {
    return <ExpiredOrMissing homeUrl={homeUrl} />;
  }

  const { data, error } = await supabase
    .from("financelens_sessions")
    .select("slides, analysis, expires_at")
    .eq("share_slug", slug)
    .maybeSingle();

  if (error || !data) {
    return <ExpiredOrMissing homeUrl={homeUrl} />;
  }

  const row = data as SessionRow;
  if (isShareSessionExpired(row.expires_at)) {
    return <ExpiredOrMissing homeUrl={homeUrl} />;
  }

  const analysis =
    row.analysis != null && typeof row.analysis === "object" ? (row.analysis as SharedAnalysis) : null;
  const slides = Array.isArray(row.slides) ? (row.slides as BriefingSlide[]) : null;

  const hasSlides = Boolean(slides && slides.length > 0);
  const hasAnalysis = Boolean(analysis && (analysis.whatTheySaid || analysis.whatItMeans));

  if (!hasSlides && !hasAnalysis) {
    return <ExpiredOrMissing homeUrl={homeUrl} />;
  }

  const layout = hasSlides ? "briefing" : "analysis";

  return (
    <DeckViewer
      layout={layout}
      slides={hasSlides ? slides : null}
      analysis={layout === "analysis" ? analysis : null}
      expiresAtIso={row.expires_at}
      homeUrl={homeUrl}
    />
  );
}

function ExpiredOrMissing({ homeUrl }: { homeUrl: string }) {
  return (
    <div className="fl-viewer-missing">
      <p className="fl-viewer-missing-title">This deck has expired or does not exist</p>
      <p className="fl-viewer-missing-copy">
        Shared links last 30 days. Run a new analysis on FinanceLens to create a fresh link.
      </p>
      <Link href={homeUrl} className="fl-app-nav-btn">
        Back to FinanceLens AI
      </Link>
    </div>
  );
}
