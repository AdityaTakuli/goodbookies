import { n as normalizeIndianPhone } from "./phone-DJVzxjRj.js";
import { s as supabaseAdmin } from "./client.server-CQTuKCic.js";
async function releaseUnconfirmedPhoneHolders(normalized, excludeUserId) {
  const { data: holders, error } = await supabaseAdmin.from("profiles").select("id").eq("phone_normalized", normalized);
  if (error) throw new Error(error.message);
  for (const holder of holders ?? []) {
    if (excludeUserId && holder.id === excludeUserId) continue;
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.getUserById(holder.id);
    if (authErr || !authData.user) {
      await supabaseAdmin.from("profiles").update({ phone: null }).eq("id", holder.id);
      continue;
    }
    if (authData.user.email_confirmed_at) continue;
    await supabaseAdmin.from("profiles").update({ phone: null }).eq("id", holder.id);
    await supabaseAdmin.auth.admin.deleteUser(holder.id);
  }
}
async function assertPhoneAvailable(phone, excludeUserId) {
  const normalized = normalizeIndianPhone(phone);
  await releaseUnconfirmedPhoneHolders(normalized, excludeUserId);
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
export {
  assertPhoneAvailable as a
};
