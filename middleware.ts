import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { deckShareLinkErrorDocument } from "@/lib/deckShareLinkErrorHtml";
import { isShareSessionExpired } from "@/lib/shareSessionExpiry";

export const config = {
  matcher: ["/deck/:slug*"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "deck") {
    return NextResponse.next();
  }
  const slug = segments[1] ?? "";
  if (!slug) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    return NextResponse.next();
  }

  const homeUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "") || "https://financelens-ai.vercel.app";

  const restUrl = `${url.replace(/\/+$/, "")}/rest/v1/financelens_sessions?share_slug=eq.${encodeURIComponent(slug)}&select=expires_at`;
  let res: Response;
  try {
    res = await fetch(restUrl, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch {
    return NextResponse.next();
  }

  if (!res.ok) {
    return NextResponse.next();
  }

  let rows: unknown;
  try {
    rows = await res.json();
  } catch {
    return NextResponse.next();
  }

  if (!Array.isArray(rows)) {
    return NextResponse.next();
  }

  if (rows.length === 0) {
    return new NextResponse(deckShareLinkErrorDocument(homeUrl, "not-found"), {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  const first = rows[0] as { expires_at?: string };
  const exp = typeof first.expires_at === "string" ? first.expires_at : "";
  if (isShareSessionExpired(exp)) {
    return new NextResponse(deckShareLinkErrorDocument(homeUrl, "gone"), {
      status: 410,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  return NextResponse.next();
}
