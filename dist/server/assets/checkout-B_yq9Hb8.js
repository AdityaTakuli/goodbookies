import { s as supabaseAdmin } from "./client.server-CQTuKCic.js";
import { i as isRazorpayConfigured, c as createRazorpayOrder, v as verifyRazorpayPaymentSignature } from "./razorpay-DwVM9bks.js";
const MIN_ORDER_PAISE = 100;
async function createCheckoutOrder(input) {
  if (input.amountPaise < MIN_ORDER_PAISE) {
    throw new CheckoutError("Amount must be at least 100 paise (₹1)", 400);
  }
  if (!isRazorpayConfigured()) {
    throw new CheckoutError("Razorpay is not configured", 401);
  }
  const order = await createRazorpayOrder(input.amountPaise, input.receipt, input.currency ?? "INR");
  return {
    order_id: order.id,
    amount: order.amount,
    currency: order.currency
  };
}
async function verifyCheckoutPayment(input) {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId, userId } = input;
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    throw new CheckoutError("Missing payment verification fields", 400);
  }
  if (!isRazorpayConfigured()) {
    throw new CheckoutError("Razorpay is not configured", 401);
  }
  const valid = verifyRazorpayPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature
  });
  if (!valid) {
    throw new CheckoutError("Invalid payment signature", 400);
  }
  if (bookingId) {
    if (!userId) throw new CheckoutError("Unauthorized", 401);
    await confirmBookingAfterPayment({
      bookingId,
      userId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    });
  }
  return { success: true };
}
async function confirmBookingAfterPayment(input) {
  const { data: booking, error: bookingErr } = await supabaseAdmin.from("bookings").select("id, user_id, venue_id, booking_date, status, payment_id, coupon_code, venue:venues(owner_id)").eq("id", input.bookingId).maybeSingle();
  if (bookingErr || !booking) throw new CheckoutError("Booking not found", 404);
  if (booking.user_id !== input.userId) throw new CheckoutError("Unauthorized", 401);
  if (booking.status === "confirmed") {
    return { bookingId: booking.id, status: "confirmed" };
  }
  if (booking.status !== "pending") {
    throw new CheckoutError("Booking cannot be paid for in its current state", 400);
  }
  if (!booking.payment_id) throw new CheckoutError("No payment linked to booking", 400);
  const { data: payment, error: payErr } = await supabaseAdmin.from("payments").select("id, razorpay_order_id, status").eq("id", booking.payment_id).maybeSingle();
  if (payErr || !payment) throw new CheckoutError("Payment record not found", 404);
  if (payment.razorpay_order_id !== input.razorpayOrderId) {
    throw new CheckoutError("Order ID does not match this booking", 400);
  }
  if (payment.status === "success") {
    return { bookingId: booking.id, status: "confirmed" };
  }
  const { error: payUpdateErr } = await supabaseAdmin.from("payments").update({
    status: "success",
    razorpay_payment_id: input.razorpayPaymentId
  }).eq("id", payment.id);
  if (payUpdateErr) throw new CheckoutError(payUpdateErr.message, 500);
  const { error: bookingUpdateErr } = await supabaseAdmin.from("bookings").update({ status: "confirmed" }).eq("id", booking.id);
  if (bookingUpdateErr) throw new CheckoutError(bookingUpdateErr.message, 500);
  if (booking.coupon_code) {
    const { data: coupon } = await supabaseAdmin.from("coupons").select("id, used_count").eq("code", booking.coupon_code).maybeSingle();
    if (coupon) {
      await supabaseAdmin.from("coupons").update({ used_count: (coupon.used_count ?? 0) + 1 }).eq("id", coupon.id);
    }
  }
  await supabaseAdmin.from("notifications").insert({
    user_id: input.userId,
    title: "Booking confirmed",
    message: `Payment received — your slot on ${booking.booking_date} is confirmed. See you on the turf!`,
    type: "booking"
  });
  const ownerId = booking.venue?.owner_id;
  if (ownerId) {
    await supabaseAdmin.from("notifications").insert({
      user_id: ownerId,
      title: "New booking",
      message: `New confirmed booking on ${booking.booking_date}.`,
      type: "booking"
    });
  }
  return { bookingId: booking.id, status: "confirmed" };
}
class CheckoutError extends Error {
  status;
  constructor(message, status = 400) {
    super(message);
    this.name = "CheckoutError";
    this.status = status;
  }
}
export {
  CheckoutError as C,
  MIN_ORDER_PAISE as M,
  createCheckoutOrder as c,
  verifyCheckoutPayment as v
};
