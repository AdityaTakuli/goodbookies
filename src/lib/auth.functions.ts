import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertPhoneAvailable } from "@/lib/phone.server";

export const checkPhoneAvailable = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ phone: z.string().min(10).max(20) }).parse(input))
  .handler(async ({ data }) => {
    const normalized = await assertPhoneAvailable(data.phone);
    return { ok: true, phone: normalized };
  });

/** Claim phone from auth metadata after email confirmation (trigger no longer writes phone). */
export const claimMyPhone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("id, phone")
      .eq("id", context.userId)
      .maybeSingle();
    if (profileErr) throw new Error(profileErr.message);
    if (profile?.phone) return { ok: true, phone: profile.phone, claimed: false };

    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    if (authErr || !authData.user) throw new Error(authErr?.message ?? "User not found");

    const rawPhone = authData.user.user_metadata?.phone;
    if (!rawPhone || typeof rawPhone !== "string") {
      return { ok: true, phone: null, claimed: false };
    }

    const normalized = await assertPhoneAvailable(rawPhone, context.userId);
    const { error: updateErr } = await supabaseAdmin
      .from("profiles")
      .update({ phone: normalized, updated_at: new Date().toISOString() })
      .eq("id", context.userId);
    if (updateErr) throw new Error(updateErr.message);

    return { ok: true, phone: normalized, claimed: true };
  });
