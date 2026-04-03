import Link from "next/link";
import { getPublicAppUrl } from "@/lib/publicAppUrl";

export default function DeckShareNotFound() {
  const homeUrl = getPublicAppUrl();
  return (
    <div className="fl-viewer-missing">
      <p className="fl-viewer-missing-title">This shared link was not found</p>
      <p className="fl-viewer-missing-copy">
        Check the URL or run a new analysis on FinanceLens to create a new share link.
      </p>
      <Link href={homeUrl} className="fl-app-nav-btn">
        Back to FinanceLens AI
      </Link>
    </div>
  );
}
