/**
 * Shared shape for briefing decks: API, modal, full-screen view exports, and PPTX.
 */

export type BriefingSlide = {
  headline: string;
  bullets: string[];
  /** HTTPS URL to raster image (provided in JSON or resolved from imagePrompt on the server). */
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
};

export type BriefingDeckPayload = {
  title: string;
  slides: BriefingSlide[];
};
