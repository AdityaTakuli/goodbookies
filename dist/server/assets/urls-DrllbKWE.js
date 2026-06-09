import { T as TSS_SERVER_FUNCTION, E as getServerFnById } from "./server-B1uN4J2-.js";
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
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
  if (key.startsWith("/venues/")) return key;
  return LEGACY_VENUE_KEYS[key] ?? fallback;
}
function resolveVenueImage(key) {
  return resolveMediaUrl(key, football);
}
function resolveMediaUrlAbsolute(key, fallback) {
  if (!key) return football;
  if (key.startsWith("http://") || key.startsWith("https://") || key.startsWith("data:")) {
    return key;
  }
  if (key.startsWith("/uploads/") || key.startsWith("/venues/") || key.startsWith("/api/media/user/") || key.startsWith("/api/media/venue/") || key.startsWith("/api/media/asset/")) {
    const base = typeof process !== "undefined" && process.env.MEDIA_PUBLIC_URL?.replace(/\/$/, "") || "https://goodbookies.co.in";
    return `${base}${key}`;
  }
  return resolveMediaUrl(key, fallback);
}
export {
  resolveMediaUrlAbsolute as a,
  resolveVenueImage as b,
  createSsrRpc as c,
  resolveMediaUrl as r
};
