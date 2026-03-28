"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { BriefingDeckPayload } from "@/lib/briefingTypes";
import { readBriefingDeckRaw } from "@/lib/briefingDeckStorage";

export default function BriefingDeckPage() {
  const [payload, setPayload] = useState<BriefingDeckPayload | null>(null);
  const [index, setIndex] = useState(0);
  const [imgBroken, setImgBroken] = useState(false);

  useEffect(() => {
    try {
      const raw = readBriefingDeckRaw();
      if (!raw) return;
      const parsed = JSON.parse(raw) as BriefingDeckPayload;
      if (parsed?.slides?.length) {
        setPayload(parsed);
        setIndex(0);
      }
    } catch {
      setPayload(null);
    }
  }, []);

  const total = payload?.slides.length ?? 0;
  const slide = payload && total > 0 ? payload.slides[Math.min(index, total - 1)] : null;

  useEffect(() => {
    setImgBroken(false);
  }, [index, slide?.imageUrl]);

  const go = useCallback(
    (delta: number) => {
      if (!payload || total === 0) return;
      setIndex((i) => {
        const n = i + delta;
        return Math.max(0, Math.min(total - 1, n));
      });
    },
    [payload, total],
  );

  useEffect(() => {
    if (!payload) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Home") {
        e.preventDefault();
        setIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setIndex(total - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [payload, go, total]);

  if (!payload || !slide) {
    return (
      <div className="fl-deck-empty">
        <p className="fl-deck-empty-title">No briefing deck loaded</p>
        <p className="fl-deck-empty-copy">
          Open full-screen from the <strong>results</strong> page after you build a briefing deck (the new tab cannot read the other
          tab’s session). If you did that and still see this, check that cookies/storage are not blocked for this site.
        </p>
        <Link href="/analyze" className="fl-deck-empty-link">
          Run an analysis
        </Link>
      </div>
    );
  }

  return (
    <div className="fl-deck-shell">
      <header className="fl-deck-bar">
        <p className="fl-deck-bar-title">{payload.title}</p>
        <p className="fl-deck-bar-meta">
          Slide {index + 1} of {total} · use ← → or space
        </p>
        <div className="fl-deck-bar-actions">
          <button type="button" className="fl-deck-icon-btn" onClick={() => go(-1)} disabled={index <= 0} aria-label="Previous slide">
            ‹
          </button>
          <button type="button" className="fl-deck-icon-btn" onClick={() => go(1)} disabled={index >= total - 1} aria-label="Next slide">
            ›
          </button>
        </div>
      </header>
      <div className="fl-deck-stage">
        <div className={`fl-deck-slide${slide.imageUrl && !imgBroken ? " fl-deck-slide--split" : ""}`}>
          <div className="fl-deck-slide-main">
            <p className="fl-deck-slide-kicker">Slide {index + 1}</p>
            <h1 className="fl-deck-slide-headline">{slide.headline}</h1>
            {slide.bullets.length > 0 ? (
              <ul className="fl-deck-slide-list">
                {slide.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            ) : null}
          </div>
          {slide.imageUrl && !imgBroken ? (
            <figure className="fl-deck-slide-figure">
              <img
                src={slide.imageUrl}
                alt={slide.imageAlt ?? ""}
                className="fl-deck-slide-img"
                onError={() => setImgBroken(true)}
              />
              {slide.imageCaption ? <figcaption className="fl-deck-slide-cap">{slide.imageCaption}</figcaption> : null}
              {slide.imageAttribution ? <p className="fl-deck-slide-attrib">{slide.imageAttribution}</p> : null}
            </figure>
          ) : null}
        </div>
      </div>
    </div>
  );
}
