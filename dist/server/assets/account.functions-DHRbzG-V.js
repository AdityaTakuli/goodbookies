import { c as createServerRpc } from "./createServerRpc-BcKSNWcR.js";
import { l as createServerFn } from "./server-DgS7T2sN.js";
import { r as requireSupabaseAuth } from "./auth-middleware-BkNrly7S.js";
import { s as supabaseAdmin } from "./client.server-CQTuKCic.js";
import { a as assertPhoneAvailable } from "./phone.server-D66YsfzL.js";
import { h as hoursUntilSlot, b as CANCEL_PARTIAL_REFUND_HOURS, d as cancellationRefundPercent } from "./cancellation-policy-Be0g0_Zy.js";
import { d as bookingStartMinute } from "./slot-time-DELf3klw.js";
import { r as refundRazorpayPayment } from "./razorpay-DwVM9bks.js";
import { o as objectType, s as stringType } from "./types-DeUvCBv7.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-BlRNeFf7.js";
import "./phone-DJVzxjRj.js";
import "node:crypto";
const getMyProfile_createServerFn_handler = createServerRpc({
  id: "7137c45c66e2762097026ceecb6dd952f95d83288f96d03621061209a6008b8a",
  name: "getMyProfile",
  filename: "src/lib/account.functions.ts"
}, (opts) => getMyProfile.__executeServer(opts));
const getMyProfile = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getMyProfile_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await context.supabase.from("profiles").select("id, full_name, email, phone, created_at, is_banned").eq("id", context.userId).maybeSingle();
  if (error) throw new Error(error.message);
  if (data?.is_banned) throw new Error("Account suspended");
  return data;
});
const updateMyProfile_createServerFn_handler = createServerRpc({
  id: "a9a93b35b4fca3d47286ae52b9b8e588b5785c8c5eb7ec53518c1d73941bb2b9",
  name: "updateMyProfile",
  filename: "src/lib/account.functions.ts"
}, (opts) => updateMyProfile.__executeServer(opts));
const updateMyProfile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  full_name: stringType().min(2).max(120).optional(),
  phone: stringType().max(20).optional()
}).parse(i)).handler(updateMyProfile_createServerFn_handler, async ({
  context,
  data
}) => {
  const patch = {
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (data.full_name !== void 0) patch.full_name = data.full_name;
  if (data.phone !== void 0) {
    patch.phone = data.phone.trim() ? await assertPhoneAvailable(data.phone, context.userId) : "";
  }
  const {
    error
  } = await context.supabase.from("profiles").update(patch).eq("id", context.userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const cancelMyBooking_createServerFn_handler = createServerRpc({
  id: "6cbddeb7e11591da000d994a17d572bffc49d765e5edfeeccfd5a7738a03d586",
  name: "cancelMyBooking",
  filename: "src/lib/account.functions.ts"
}, (opts) => cancelMyBooking.__executeServer(opts));
const cancelMyBooking = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(cancelMyBooking_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: booking,
    error: fErr
  } = await context.supabase.from("bookings").select("id, status, booking_date, start_hour, start_minute, payment_id").eq("id", data.id).eq("user_id", context.userId).maybeSingle();
  if (fErr || !booking) throw new Error("Booking not found");
  if (booking.status === "cancelled") throw new Error("Already cancelled");
  const startMinute = bookingStartMinute(booking);
  const hoursUntil = hoursUntilSlot(booking.booking_date, startMinute);
  const refundPercent = cancellationRefundPercent(hoursUntil);
  if (refundPercent === null) {
    throw new Error(`Cancellation is not allowed within ${CANCEL_PARTIAL_REFUND_HOURS} hours of your slot`);
  }
  const {
    error
  } = await context.supabase.from("bookings").update({
    status: "cancelled"
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  if (booking.payment_id && refundPercent > 0) {
    const {
      data: pay
    } = await supabaseAdmin.from("payments").select("razorpay_payment_id, amount, status").eq("id", booking.payment_id).maybeSingle();
    if (pay?.razorpay_payment_id && pay.status === "paid") {
      const refundPaise = Math.round(pay.amount * 100 * (refundPercent / 100));
      if (refundPaise > 0) {
        await refundRazorpayPayment(pay.razorpay_payment_id, refundPaise);
      }
      await supabaseAdmin.from("payments").update({
        status: refundPercent === 100 ? "refunded" : "partially_refunded"
      }).eq("id", booking.payment_id);
    }
  }
  const refundNote = refundPercent === 100 ? "A full refund will be processed within 5–7 business days." : `A ${refundPercent}% refund will be processed within 5–7 business days.`;
  await supabaseAdmin.from("notifications").insert({
    user_id: context.userId,
    title: "Booking cancelled",
    message: `Your booking was cancelled. ${refundNote}`,
    type: "cancellation"
  });
  return {
    ok: true,
    refundPercent
  };
});
const listMyNotifications_createServerFn_handler = createServerRpc({
  id: "80b0a4bbf573cf3966716cdc655a6487e49dd8182e44f1e876aa9f10f89f24c4",
  name: "listMyNotifications",
  filename: "src/lib/account.functions.ts"
}, (opts) => listMyNotifications.__executeServer(opts));
const listMyNotifications = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyNotifications_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await context.supabase.from("notifications").select("id, title, message, type, is_read, created_at").eq("user_id", context.userId).order("created_at", {
    ascending: false
  }).limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
});
const markNotificationsRead_createServerFn_handler = createServerRpc({
  id: "c87ea2d8ea7b5701200fb3d9a67d099edd07cf7c7c4e6d40f22e6d358e6f4a86",
  name: "markNotificationsRead",
  filename: "src/lib/account.functions.ts"
}, (opts) => markNotificationsRead.__executeServer(opts));
const markNotificationsRead = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(markNotificationsRead_createServerFn_handler, async ({
  context
}) => {
  const {
    error
  } = await context.supabase.from("notifications").update({
    is_read: true
  }).eq("user_id", context.userId).eq("is_read", false);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listMyPayments_createServerFn_handler = createServerRpc({
  id: "9ee81fa046072effef2d37d3ae6bc0a5386ef421025b04ada2cd0c62eba58694",
  name: "listMyPayments",
  filename: "src/lib/account.functions.ts"
}, (opts) => listMyPayments.__executeServer(opts));
const listMyPayments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyPayments_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await context.supabase.from("bookings").select("id, booking_date, total_price, status, created_at, venue:venues(name, sport:sports(name))").eq("user_id", context.userId).order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return (data ?? []).map((b) => ({
    booking_id: b.id,
    venue: b.venue?.name ?? "N/A",
    sport: b.venue?.sport?.name ?? "N/A",
    date: b.booking_date,
    amount: b.total_price,
    status: b.status === "cancelled" ? "refunded" : b.status === "confirmed" ? "success" : b.status,
    paid_at: b.created_at
  }));
});
export {
  cancelMyBooking_createServerFn_handler,
  getMyProfile_createServerFn_handler,
  listMyNotifications_createServerFn_handler,
  listMyPayments_createServerFn_handler,
  markNotificationsRead_createServerFn_handler,
  updateMyProfile_createServerFn_handler
};
