import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://financelens-ai.vercel.app");

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAFAF7",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FinanceLens AI — Financial Document Intelligence",
    template: "%s | FinanceLens AI",
  },
  description: "Paste an earnings call, 10-K, or regulatory notice. Get plain language, drift signals, and flags in seconds. Assistive analysis only — not financial advice.",
  authors: [{ name: "Hannah Kraulik Pagade", url: "https://www.hannahkraulikpagade.com/" }],
  openGraph: {
    title: "FinanceLens AI",
    description: "Read what they actually said.",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FinanceLens AI — document intelligence preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FinanceLens AI",
    description: "Read what they actually said.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=IBM+Plex+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
