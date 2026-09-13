import { c as createServerRpc } from "./createServerRpc-CkedBoEp.js";
import { l as createServerFn } from "./server-BDxa_Kju.js";
import { o as objectType, s as stringType, d as requireSupabaseAuth } from "./auth-middleware-CXeE-dWU.js";
import { s as supabaseAdmin } from "./client.server-CQTuKCic.js";
import { a as assertPhoneAvailable } from "./phone.server-DrcC5xv-.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-BlRNeFf7.js";
import "./phone-DJVzxjRj.js";
const checkPhoneAvailable_createServerFn_handler = createServerRpc({
  id: "356233ab538099e723566e80a761c0e3d7afe85c53224308bed9d35f74638f03",
  name: "checkPhoneAvailable",
  filename: "src/lib/auth.functions.ts"
}, (opts) => checkPhoneAvailable.__executeServer(opts));
const checkPhoneAvailable = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  phone: stringType().min(10).max(20)
}).parse(input)).handler(checkPhoneAvailable_createServerFn_handler, async ({
  data
}) => {
  const normalized = await assertPhoneAvailable(data.phone);
  return {
    ok: true,
    phone: normalized
  };
});
const claimMyPhone_createServerFn_handler = createServerRpc({
  id: "b1628cc123a3972de457ef4c57c434276df100672945610a6458209c64e1b759",
  name: "claimMyPhone",
  filename: "src/lib/auth.functions.ts"
}, (opts) => claimMyPhone.__executeServer(opts));
const claimMyPhone = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(claimMyPhone_createServerFn_handler, async ({
  context
}) => {
  const {
    data: profile,
    error: profileErr
  } = await supabaseAdmin.from("profiles").select("id, phone").eq("id", context.userId).maybeSingle();
  if (profileErr) throw new Error(profileErr.message);
  if (profile?.phone) return {
    ok: true,
    phone: profile.phone,
    claimed: false
  };
  const {
    data: authData,
    error: authErr
  } = await supabaseAdmin.auth.admin.getUserById(context.userId);
  if (authErr || !authData.user) throw new Error(authErr?.message ?? "User not found");
  const rawPhone = authData.user.user_metadata?.phone;
  if (!rawPhone || typeof rawPhone !== "string") {
    return {
      ok: true,
      phone: null,
      claimed: false
    };
  }
  const normalized = await assertPhoneAvailable(rawPhone, context.userId);
  const {
    error: updateErr
  } = await supabaseAdmin.from("profiles").update({
    phone: normalized,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", context.userId);
  if (updateErr) throw new Error(updateErr.message);
  return {
    ok: true,
    phone: normalized,
    claimed: true
  };
});
export {
  checkPhoneAvailable_createServerFn_handler,
  claimMyPhone_createServerFn_handler
};
