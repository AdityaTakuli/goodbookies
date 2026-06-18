import { c as createServerRpc } from "./createServerRpc-D1yNa8Tt.js";
import { l as createServerFn } from "./server-BDwJjQtX.js";
import { r as requireSupabaseAuth } from "./auth-middleware-CSCWJAYw.js";
import { M as MIN_ORDER_PAISE, c as createCheckoutOrder, v as verifyCheckoutPayment, C as CheckoutError } from "./checkout-B66VBp1z.js";
import { a as RazorpayAuthError, R as RazorpayApiError } from "./razorpay-DwVM9bks.js";
import { o as objectType, s as stringType, n as numberType } from "./types-DeUvCBv7.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-BlRNeFf7.js";
import "./client.server-CQTuKCic.js";
import "node:crypto";
function mapCheckoutError(error) {
  if (error instanceof CheckoutError) throw new Error(error.message);
  if (error instanceof RazorpayAuthError) throw new Error(error.message);
  if (error instanceof RazorpayApiError) throw new Error(error.message);
  throw error instanceof Error ? error : new Error("Payment failed");
}
const createPaymentOrder_createServerFn_handler = createServerRpc({
  id: "79167d01055e7ca7df54dc70f34b74c07dc814b41e652ca2fabfc1b1237d5d53",
  name: "createPaymentOrder",
  filename: "src/lib/payment.functions.ts"
}, (opts) => createPaymentOrder.__executeServer(opts));
const createPaymentOrder = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  amount: numberType().int().min(MIN_ORDER_PAISE),
  currency: stringType().length(3).default("INR"),
  receipt: stringType().min(1).max(40).optional()
}).parse(input)).handler(createPaymentOrder_createServerFn_handler, async ({
  data
}) => {
  try {
    return await createCheckoutOrder({
      amountPaise: data.amount,
      receipt: data.receipt ?? `rcpt_${Date.now()}`,
      currency: data.currency
    });
  } catch (error) {
    mapCheckoutError(error);
  }
});
const verifyBookingPayment_createServerFn_handler = createServerRpc({
  id: "5607daa85cfa41afc7e3db3fe53bd66008a98f835337c473f35efc1f582bd2ac",
  name: "verifyBookingPayment",
  filename: "src/lib/payment.functions.ts"
}, (opts) => verifyBookingPayment.__executeServer(opts));
const verifyBookingPayment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  razorpay_payment_id: stringType().min(1),
  razorpay_order_id: stringType().min(1),
  razorpay_signature: stringType().min(1),
  booking_id: stringType().uuid()
}).parse(input)).handler(verifyBookingPayment_createServerFn_handler, async ({
  data,
  context
}) => {
  try {
    return await verifyCheckoutPayment({
      razorpay_payment_id: data.razorpay_payment_id,
      razorpay_order_id: data.razorpay_order_id,
      razorpay_signature: data.razorpay_signature,
      bookingId: data.booking_id,
      userId: context.userId
    });
  } catch (error) {
    mapCheckoutError(error);
  }
});
export {
  createPaymentOrder_createServerFn_handler,
  verifyBookingPayment_createServerFn_handler
};
