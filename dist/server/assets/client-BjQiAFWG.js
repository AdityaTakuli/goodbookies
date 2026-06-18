import { c as createClient } from "./index-BlRNeFf7.js";
function readPublicRazorpayKeyId() {
  const runtime = typeof window !== "undefined" ? window.__GB_PUBLIC_ENV__ : void 0;
  return runtime?.VITE_RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
}
function readPublicSupabaseEnv() {
  const runtime = typeof window !== "undefined" ? window.__GB_PUBLIC_ENV__ : void 0;
  return {
    VITE_SUPABASE_URL: runtime?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: runtime?.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY
  };
}
function getPublicEnvInlineScript() {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  const razorpayKeyId = process.env.VITE_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID;
  if (!url || !key) return null;
  const siteUrl = process.env.MEDIA_PUBLIC_URL?.replace(/\/$/, "") || process.env.SITE_URL?.replace(/\/$/, "") || "https://goodbookies.co.in";
  const payload = JSON.stringify({
    VITE_SUPABASE_URL: url,
    VITE_SUPABASE_PUBLISHABLE_KEY: key,
    MEDIA_PUBLIC_URL: siteUrl,
    ...razorpayKeyId ? { VITE_RAZORPAY_KEY_ID: razorpayKeyId } : {}
  });
  return `window.__GB_PUBLIC_ENV__=${payload};`;
}
function createSupabaseClient() {
  const { VITE_SUPABASE_URL: SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY: SUPABASE_PUBLISHABLE_KEY } = readPublicSupabaseEnv();
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    const missing = [
      ...!SUPABASE_URL ? ["SUPABASE_URL"] : [],
      ...!SUPABASE_PUBLISHABLE_KEY ? ["SUPABASE_PUBLISHABLE_KEY"] : []
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(", ")}. Connect Supabase in Lovable Cloud.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : void 0,
      persistSession: true,
      autoRefreshToken: true
    }
  });
}
let _supabase;
const supabase = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  }
});
export {
  getPublicEnvInlineScript as g,
  readPublicRazorpayKeyId as r,
  supabase as s
};
