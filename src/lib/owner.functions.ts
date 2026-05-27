import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin role required");
}

export const registerOwner = createServerFn({ method: "POST" })
  .inputValidator((i: {
    name: string; email: string; phone: string; password: string;
    business_name?: string; city: string;
  }) =>
    z.object({
      name: z.string().min(2).max(120),
      email: z.string().email(),
      phone: z.string().min(10).max(15),
      password: z.string().min(8).max(72),
      business_name: z.string().max(120).optional(),
      city: z.string().min(2).max(80),
    }).parse(i),
  )
  .handler(async ({ data }) => {
    const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.name, phone: data.phone, role: "owner" },
    });
    if (authErr) throw new Error(authErr.message);

    const { error: ownerErr } = await supabaseAdmin.from("owners").insert({
      id: authUser.user.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      business_name: data.business_name ?? null,
      city: data.city,
      status: "pending",
    });
    if (ownerErr) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw new Error(ownerErr.message);
    }
    return { ok: true, message: "Application submitted. You'll receive an email once approved." };
  });

export const getOwnerStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("owners")
      .select("id, status, rejection_reason, business_name, city")
      .eq("id", context.userId)
      .maybeSingle();
    return data;
  });

export const adminListOwnerRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("owners")
      .select("id, name, email, phone, business_name, city, status, rejection_reason, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminReviewOwnerRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string; action: "approve" | "reject"; reason?: string }) =>
    z.object({
      id: z.string().uuid(),
      action: z.enum(["approve", "reject"]),
      reason: z.string().max(500).optional(),
    }).parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const status = data.action === "approve" ? "approved" : "rejected";
    const patch: Record<string, unknown> = {
      status,
      rejection_reason: data.action === "reject" ? (data.reason ?? "Not approved") : null,
      approved_at: data.action === "approve" ? new Date().toISOString() : null,
      approved_by: data.action === "approve" ? context.userId : null,
    };
    const { error } = await supabaseAdmin.from("owners").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    if (data.action === "approve") {
      await supabaseAdmin.from("user_roles").insert({ user_id: data.id, role: "owner" });
    }
    return { ok: true };
  });
