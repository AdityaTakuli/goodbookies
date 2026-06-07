import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { type MediaCategory } from "@/lib/media/config";
import { saveMediaBuffer } from "@/lib/media/storage.server";

async function assertCanUploadCategory(userId: string, category: MediaCategory) {
  if (category === "avatars") return;

  const [{ data: admin }, { data: owner }] = await Promise.all([
    supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle(),
    supabaseAdmin.from("owners").select("status").eq("id", userId).maybeSingle(),
  ]);

  if (admin) return;
  if (owner?.status === "approved") return;
  throw new Error("Forbidden: admin or approved owner required for this upload");
}

export async function saveUploadedMediaForUser(opts: {
  userId: string;
  category: MediaCategory;
  buffer: Buffer;
  mimeType: string;
}) {
  await assertCanUploadCategory(opts.userId, opts.category);
  return await saveMediaBuffer({
    category: opts.category,
    ownerId: opts.userId,
    buffer: opts.buffer,
    mimeType: opts.mimeType,
  });
}
