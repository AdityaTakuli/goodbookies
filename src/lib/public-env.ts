export type PublicSupabaseEnv = {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
  VITE_RAZORPAY_KEY_ID?: string;
  MEDIA_PUBLIC_URL?: string;
};

declare global {
  interface Window {
    __GB_PUBLIC_ENV__?: Partial<PublicSupabaseEnv>;
  }
}

export function readPublicRazorpayKeyId(): string | undefined {
  const runtime = typeof window !== "undefined" ? window.__GB_PUBLIC_ENV__ : undefined;
  return (
    import.meta.env.VITE_RAZORPAY_KEY_ID ||
    runtime?.VITE_RAZORPAY_KEY_ID ||
    process.env.VITE_RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_KEY_ID
  );
}

export function readPublicSupabaseEnv(): Partial<PublicSupabaseEnv> {
  const runtime = typeof window !== "undefined" ? window.__GB_PUBLIC_ENV__ : undefined;

  return {
    VITE_SUPABASE_URL:
      import.meta.env.VITE_SUPABASE_URL ||
      runtime?.VITE_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      process.env.SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY:
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      runtime?.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_ANON_KEY,
  };
}

export function getPublicEnvInlineScript(): string | null {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY;
  const razorpayKeyId = process.env.VITE_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID;

  if (!url || !key) return null;

  const siteUrl =
    process.env.MEDIA_PUBLIC_URL?.replace(/\/$/, "") ||
    process.env.SITE_URL?.replace(/\/$/, "") ||
    "https://goodbookies.co.in";

  const payload = JSON.stringify({
    VITE_SUPABASE_URL: url,
    VITE_SUPABASE_PUBLISHABLE_KEY: key,
    MEDIA_PUBLIC_URL: siteUrl,
    ...(razorpayKeyId ? { VITE_RAZORPAY_KEY_ID: razorpayKeyId } : {}),
  } satisfies PublicSupabaseEnv);

  return `window.__GB_PUBLIC_ENV__=${payload};`;
}
