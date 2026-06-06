import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  CheckoutError,
  createCheckoutOrder,
  MIN_ORDER_PAISE,
  verifyCheckoutPayment,
} from "@/lib/payments/checkout";
import { RazorpayApiError, RazorpayAuthError } from "@/lib/services/razorpay";

function mapCheckoutError(error: unknown): never {
  if (error instanceof CheckoutError) throw new Error(error.message);
  if (error instanceof RazorpayAuthError) throw new Error(error.message);
  if (error instanceof RazorpayApiError) throw new Error(error.message);
  throw error instanceof Error ? error : new Error("Payment failed");
}

export const createPaymentOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { amount: number; currency?: string; receipt?: string }) =>
    z
      .object({
        amount: z.number().int().min(MIN_ORDER_PAISE),
        currency: z.string().length(3).default("INR"),
        receipt: z.string().min(1).max(40).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      return await createCheckoutOrder({
        amountPaise: data.amount,
        receipt: data.receipt ?? `rcpt_${Date.now()}`,
        currency: data.currency,
      });
    } catch (error) {
      mapCheckoutError(error);
    }
  });

export const verifyBookingPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
      booking_id: string;
    }) =>
      z
        .object({
          razorpay_payment_id: z.string().min(1),
          razorpay_order_id: z.string().min(1),
          razorpay_signature: z.string().min(1),
          booking_id: z.string().uuid(),
        })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    try {
      return await verifyCheckoutPayment({
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_order_id: data.razorpay_order_id,
        razorpay_signature: data.razorpay_signature,
        bookingId: data.booking_id,
        userId: context.userId,
      });
    } catch (error) {
      mapCheckoutError(error);
    }
  });
