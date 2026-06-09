/**
 * One-off partner account provisioning (admin, email pre-confirmed, no OTP).
 * Usage:
 *   set -a && source .env && set +a
 *   node scripts/provision-owner.mjs
 *
 * Override via env: OWNER_EMAIL, OWNER_NAME, OWNER_BUSINESS, OWNER_CITY, OWNER_PHONE, OWNER_PASSWORD
 */
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const email = (process.env.OWNER_EMAIL ?? "palanuragpal94@gmail.com").trim().toLowerCase();
const name = process.env.OWNER_NAME ?? "Yorker Yard";
const businessName = process.env.OWNER_BUSINESS ?? "Yorker yard turf";
const city = process.env.OWNER_CITY ?? "Jhelum";
const phone = process.env.OWNER_PHONE ?? "9000000094";
const password =
  process.env.OWNER_PASSWORD ??
  `GB-${randomBytes(6).toString("base64url")}1!`;

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function normalizeIndianPhone(raw) {
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  throw new Error(`Invalid phone: ${raw}`);
}

async function linkPartner(userId, normalizedPhone) {
  const { data: existingOwner } = await admin.from("owners").select("id").eq("id", userId).maybeSingle();
  if (existingOwner) {
    console.log("Owner row already exists for this user.");
    return false;
  }

  const { error: ownerErr } = await admin.from("owners").insert({
    id: userId,
    name,
    email,
    phone: normalizedPhone,
    business_name: businessName,
    city,
    status: "approved",
    approved_at: new Date().toISOString(),
  });
  if (ownerErr) throw new Error(`owners insert: ${ownerErr.message}`);

  const { error: profileErr } = await admin
    .from("profiles")
    .update({
      account_type: "both",
      full_name: name,
      phone: normalizedPhone,
      phone_normalized: normalizedPhone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (profileErr) throw new Error(`profiles update: ${profileErr.message}`);

  await admin.from("user_roles").upsert({ user_id: userId, role: "user" }, { onConflict: "user_id,role" });
  const { error: roleErr } = await admin
    .from("user_roles")
    .upsert({ user_id: userId, role: "owner" }, { onConflict: "user_id,role" });
  if (roleErr) throw new Error(`user_roles: ${roleErr.message}`);

  return true;
}

async function main() {
  const normalizedPhone = normalizeIndianPhone(phone);

  const { data: listData, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) throw new Error(listErr.message);

  let user = listData.users.find((u) => u.email?.toLowerCase() === email);

  if (!user) {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, phone: normalizedPhone, account_type: "both" },
    });
    if (createErr) throw new Error(`createUser: ${createErr.message}`);
    user = created.user;
    console.log("Created auth user:", user.id);
  } else {
    console.log("Auth user already exists:", user.id);
    if (process.env.OWNER_PASSWORD) {
      const { error: pwErr } = await admin.auth.admin.updateUserById(user.id, { password });
      if (pwErr) console.warn("Password update skipped:", pwErr.message);
    }
    await admin.auth.admin.updateUserById(user.id, { email_confirm: true });
  }

  const linked = await linkPartner(user.id, normalizedPhone);

  console.log("\n--- Partner account ready ---");
  console.log("Business:", businessName);
  console.log("Email:", email);
  console.log("Login:", "https://goodbookies.co.in/owner/login");
  if (!listData.users.find((u) => u.email?.toLowerCase() === email) || linked) {
    console.log("Temporary password (share with owner):", password);
  } else {
    console.log("Password: unchanged (existing account)");
  }
  console.log("Phone (placeholder, update later):", normalizedPhone);
  console.log("City (placeholder, update later):", city);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
