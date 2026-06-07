const football = "/assets/venue-football-CVplYEDa.jpg";
const cricket = "/assets/venue-cricket-CqDzUcxo.jpg";
const basketball = "/assets/venue-basketball-CcIMvU03.jpg";
const LEGACY_VENUE_KEYS = {
  "venue-football": football,
  "venue-cricket": cricket,
  "venue-basketball": basketball
};
function resolveMediaUrl(key, fallback = football) {
  if (!key) return fallback;
  if (key.startsWith("data:")) return key;
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  if (key.startsWith("/api/media/user/")) return key;
  if (key.startsWith("/api/media/venue/")) return key;
  if (key.startsWith("/api/media/asset/")) return key;
  if (key.startsWith("/uploads/")) return key;
  return LEGACY_VENUE_KEYS[key] ?? fallback;
}
function resolveVenueImage(key) {
  return resolveMediaUrl(key, football);
}
export {
  resolveVenueImage as a,
  resolveMediaUrl as r
};
