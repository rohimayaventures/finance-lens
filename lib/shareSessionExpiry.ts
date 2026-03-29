/** True when the ISO expiry is in the past (uses wall clock — for server routes only). */
export function isShareSessionExpired(expiresAtIso: string): boolean {
  const expMs = new Date(expiresAtIso).getTime();
  if (Number.isNaN(expMs)) return true;
  return expMs < Date.now();
}
