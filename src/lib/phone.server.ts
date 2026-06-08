import { normalizeIndianPhone } from "@/lib/phone";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Throws if phone is taken by another profile or owner account. */
export async function assertPhoneAvailable(phone: string, excludeUserId?: string): Promise<string> {
  const normalized = normalizeIndianPhone(phone);

  let profileQuery = supabaseAdmin.from("profiles").select("id").eq("phone_normalized", normalized);
  if (excludeUserId) profileQuery = profileQuery.neq("id", excludeUserId);
  const { data: profile, error: profileErr } = await profileQuery.maybeSingle();
  if (profileErr) throw new Error(profileErr.message);
  if (profile) throw new Error("This phone number is already registered to another account.");

  const { data: owners, error: ownersErr } = await supabaseAdmin.from("owners").select("id, phone");
  if (ownersErr) throw new Error(ownersErr.message);

  for (const owner of owners ?? []) {
    if (!owner.phone || owner.id === excludeUserId) continue;
    try {
      if (normalizeIndianPhone(owner.phone) === normalized) {
        throw new Error("This phone number is already registered to another account.");
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("already registered")) throw error;
    }
  }

  return normalized;
}
