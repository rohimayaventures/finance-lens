"use client";

import Link from "next/link";
import { PORTFOLIO_URL } from "@/lib/portfolio";

type Props = {
  className?: string;
};

export function PortfolioSiteCredit({ className }: Props) {
  return (
    <Link href={PORTFOLIO_URL} className={className} rel="noopener noreferrer" target="_blank">
      Built by Hannah Kraulik Pagade · Portfolio
    </Link>
  );
}
