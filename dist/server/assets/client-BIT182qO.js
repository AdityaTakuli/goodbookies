import { c as createClient } from "./index-BlRNeFf7.js";
function readPublicSupabaseEnv() {
  return {
    VITE_SUPABASE_URL: "https://gbjsdtzcawmfiqwbmmip.supabase.co",
    VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x_FcK3mvOmsyHiGRWP2yfg_0DAK9omE"
  };
}
function getPublicEnvInlineScript() {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const payload = JSON.stringify({
    VITE_SUPABASE_URL: url,
    VITE_SUPABASE_PUBLISHABLE_KEY: key
  });
  return `window.__GB_PUBLIC_ENV__=${payload};`;
}
function createSupabaseClient() {
  const { VITE_SUPABASE_URL: SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY: SUPABASE_PUBLISHABLE_KEY } = readPublicSupabaseEnv();
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
  supabase as s
};
