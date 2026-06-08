function authRedirectUrl(path) {
  const base = typeof window !== "undefined" && window.location.origin || process.env.MEDIA_PUBLIC_URL || "https://goodbookies.co.in";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
export {
  authRedirectUrl as a
};
