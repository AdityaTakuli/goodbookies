import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  createRazorpayOrder,
  isRazorpayConfigured,
  verifyRazorpayPaymentSignature,
} from "@/lib/services/razorpay";

export const MIN_ORDER_PAISE = 100;

export function getPublicRazorpayKeyId(): string | undefined {
  return process.env.VITE_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID;
}

export async function createCheckoutOrder(input: {
  amountPaise: number;
  receipt: string;
  currency?: string;
}) {
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
    currency: order.currency,
  };
}

export async function verifyCheckoutPayment(input: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  bookingId?: string;
  userId?: string;
}) {
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
    signature: razorpay_signature,
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
      razorpayPaymentId: razorpay_payment_id,
    });
  }

  return { success: true as const };
}

export async function confirmBookingAfterPayment(input: {
  bookingId: string;
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
}) {
  const { data: booking, error: bookingErr } = await supabaseAdmin
    .from("bookings")
    .select("id, user_id, venue_id, booking_date, status, payment_id, coupon_code, venue:venues(owner_id)")
    .eq("id", input.bookingId)
    .maybeSingle();

  if (bookingErr || !booking) throw new CheckoutError("Booking not found", 404);
  if (booking.user_id !== input.userId) throw new CheckoutError("Unauthorized", 401);
  if (booking.status === "confirmed") {
    return { bookingId: booking.id, status: "confirmed" as const };
  }
  if (booking.status !== "pending") {
    throw new CheckoutError("Booking cannot be paid for in its current state", 400);
  }
  if (!booking.payment_id) throw new CheckoutError("No payment linked to booking", 400);

  const { data: payment, error: payErr } = await supabaseAdmin
    .from("payments")
    .select("id, razorpay_order_id, status")
    .eq("id", booking.payment_id)
    .maybeSingle();

  if (payErr || !payment) throw new CheckoutError("Payment record not found", 404);
  if (payment.razorpay_order_id !== input.razorpayOrderId) {
    throw new CheckoutError("Order ID does not match this booking", 400);
  }
  if (payment.status === "success") {
    return { bookingId: booking.id, status: "confirmed" as const };
  }

  const { error: payUpdateErr } = await supabaseAdmin
    .from("payments")
    .update({
      status: "success",
      razorpay_payment_id: input.razorpayPaymentId,
    })
    .eq("id", payment.id);

  if (payUpdateErr) throw new CheckoutError(payUpdateErr.message, 500);

  const { error: bookingUpdateErr } = await supabaseAdmin
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", booking.id);

  if (bookingUpdateErr) throw new CheckoutError(bookingUpdateErr.message, 500);

  if (booking.coupon_code) {
    const { data: coupon } = await supabaseAdmin
      .from("coupons")
      .select("id, used_count")
      .eq("code", booking.coupon_code)
      .maybeSingle();
    if (coupon) {
      await supabaseAdmin
        .from("coupons")
        .update({ used_count: (coupon.used_count ?? 0) + 1 })
        .eq("id", coupon.id);
    }
  }

  await supabaseAdmin.from("notifications").insert({
    user_id: input.userId,
    title: "Booking confirmed",
    message: `Payment received — your slot on ${booking.booking_date} is confirmed. See you on the turf!`,
    type: "booking",
  });

  const ownerId = (booking.venue as { owner_id?: string | null } | null)?.owner_id;
  if (ownerId) {
    await supabaseAdmin.from("notifications").insert({
      user_id: ownerId,
      title: "New booking",
      message: `New confirmed booking on ${booking.booking_date}.`,
      type: "booking",
    });
  }

  return { bookingId: booking.id, status: "confirmed" as const };
}

export class CheckoutError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CheckoutError";
    this.status = status;
  }
}
