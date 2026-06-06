export type PublicSupabaseEnv = {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
};

declare global {
  interface Window {
    __GB_PUBLIC_ENV__?: Partial<PublicSupabaseEnv>;
  }
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

  if (!url || !key) return null;

  const payload = JSON.stringify({
    VITE_SUPABASE_URL: url,
    VITE_SUPABASE_PUBLISHABLE_KEY: key,
  } satisfies PublicSupabaseEnv);

  return `window.__GB_PUBLIC_ENV__=${payload};`;
}
