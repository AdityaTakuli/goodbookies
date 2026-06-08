/** Absolute URL for Supabase email redirects (reset password, etc.). */
export function authRedirectUrl(path: string): string {
  const base =
    (typeof window !== "undefined" && window.location.origin) ||
    process.env.MEDIA_PUBLIC_URL ||
    "https://goodbookies.co.in";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
