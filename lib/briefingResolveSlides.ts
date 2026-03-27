import type { BriefingDeckPayload, BriefingSlide } from "@/lib/briefingTypes";
import type { BriefingOutlineRaw } from "@/lib/schemas/briefingOutline";
import { pollinationsImageUrl, sanitizeBriefingImageUrl } from "@/lib/briefingImageUrl";
import { fetchUnsplashPhoto } from "@/lib/unsplashImages";

export async function resolveBriefingImages(outline: BriefingOutlineRaw): Promise<BriefingDeckPayload> {
  const title = outline.title.trim() || "Briefing outline";

  const slides: BriefingSlide[] = await Promise.all(
    outline.slides.map(async (s, idx) => {
      const headline = s.headline.trim() || "Slide";
      const bullets = s.bullets.map((b) => b.trim()).filter(Boolean);

      const imageCaption =
        typeof s.imageCaption === "string" && s.imageCaption.trim()
          ? s.imageCaption.trim().slice(0, 220)
          : undefined;
      const userAlt =
        typeof s.imageAlt === "string" && s.imageAlt.trim() ? s.imageAlt.trim().slice(0, 280) : undefined;

      let imageUrl = sanitizeBriefingImageUrl(s.imageUrl);
      let imageAttribution: string | undefined;

      const searchQ =
        typeof s.imageSearchQuery === "string" && s.imageSearchQuery.trim()
          ? s.imageSearchQuery.trim().slice(0, 100)
          : "";
      if (!imageUrl && searchQ) {
        const u = await fetchUnsplashPhoto(searchQ);
        if (u) {
          imageUrl = u.imageUrl;
          imageAttribution = u.attribution;
        }
      }

      const imagePrompt =
        typeof s.imagePrompt === "string" && s.imagePrompt.trim()
          ? s.imagePrompt.trim().slice(0, 320)
          : "";
      if (!imageUrl && imagePrompt) {
        imageUrl = pollinationsImageUrl(imagePrompt, `${idx}-${headline}`);
      }

      const slide: BriefingSlide = { headline, bullets };
      if (imageUrl) {
        slide.imageUrl = imageUrl;
        slide.imageAlt =
          userAlt ?? `Concept illustration supporting the slide: ${headline}`.slice(0, 280);
      }
      if (imageCaption) slide.imageCaption = imageCaption;
      if (imageAttribution) slide.imageAttribution = imageAttribution;
      return slide;
    }),
  );

  const filtered = slides.filter((s) => s.headline.length > 0);

  if (filtered.length === 0) {
    return {
      title,
      slides: [{ headline: "Summary", bullets: ["No slide content returned. Try again."] }],
    };
  }

  return { title, slides: filtered };
}
