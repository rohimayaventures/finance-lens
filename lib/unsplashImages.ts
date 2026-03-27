type UnsplashSearchResponse = {
  results?: Array<{
    urls?: { regular?: string; small?: string };
    user?: { name?: string };
    links?: { html?: string; download_location?: string };
  }>;
};

/**
 * Search Unsplash for a landscape photo. Requires UNSPLASH_ACCESS_KEY (Client ID).
 * @see https://unsplash.com/documentation#search-photos
 */
export async function fetchUnsplashPhoto(searchQuery: string): Promise<{
  imageUrl: string;
  attribution: string;
} | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!key || !searchQuery.trim()) return null;

  const q = encodeURIComponent(searchQuery.trim().slice(0, 100));
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${q}&per_page=1&orientation=landscape&content_filter=high`,
    { headers: { Authorization: `Client-ID ${key}` } },
  );

  if (!res.ok) return null;

  const data = (await res.json()) as UnsplashSearchResponse;
  const photo = data.results?.[0];
  if (!photo) return null;
  const imageUrl = photo.urls?.regular ?? photo.urls?.small;
  if (!imageUrl) return null;

  const name = photo.user?.name ?? "Photographer";
  const attribution = `Photo: ${name} · Unsplash`;

  const download = photo.links?.download_location;
  if (download) {
    void fetch(download, { headers: { Authorization: `Client-ID ${key}` } }).catch(() => {});
  }

  return { imageUrl, attribution };
}
