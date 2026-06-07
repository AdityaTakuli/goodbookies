import { createClient } from "@supabase/supabase-js";
import { resolveMediaUrlAbsolute } from "../../src/lib/media/urls.ts";

export const DEFAULT_VENUE_IMAGE =
  "https://images.unsplash.com/photo-1529900748604-0752a0770cc8?w=800&q=80";

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase not configured");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function resolveImageUrl(key?: string | null): string {
  if (!key) return DEFAULT_VENUE_IMAGE;
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  if (
    key.startsWith("/uploads/") ||
    key.startsWith("/api/media/user/") ||
    key.startsWith("/api/media/venue/") ||
    key.startsWith("/api/media/asset/") ||
    key.startsWith("venue-")
  ) {
    return resolveMediaUrlAbsolute(key, DEFAULT_VENUE_IMAGE);
  }
  return DEFAULT_VENUE_IMAGE;
}

export function setCors(res: { setHeader: (k: string, v: string) => void }) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export function sendJson(
  res: { status: (n: number) => typeof res; json: (b: unknown) => void; setHeader: (k: string, v: string) => void },
  body: unknown,
  status = 200,
) {
  setCors(res);
  res.status(status).json(body);
}

export function sendError(res: Parameters<typeof sendJson>[0], message: string, status = 400) {
  sendJson(res, { error: message }, status);
}

export async function getUserIdFromRequest(req: { headers: { authorization?: string } }): Promise<string | null> {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

export const defaultSports = [
  { name: "Football", slug: "football", icon: "⚽", is_active: true },
  { name: "Cricket", slug: "cricket", icon: "🏏", is_active: true },
  { name: "Badminton", slug: "badminton", icon: "🏸", is_active: true },
  { name: "Basketball", slug: "basketball", icon: "🏀", is_active: true },
];
