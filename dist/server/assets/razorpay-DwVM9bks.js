import { createHmac, timingSafeEqual } from "node:crypto";
function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}
function verifyRazorpayPaymentSignature(input) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;
  const expected = createHmac("sha256", keySecret).update(`${input.orderId}|${input.paymentId}`).digest("hex");
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(input.signature, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
async function createRazorpayOrder(amountPaise, receipt, currency = "INR") {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return {
      id: `order_stub_${receipt.slice(0, 8)}`,
      amount: amountPaise,
      currency,
      status: "created"
    };
  }
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency,
      receipt,
      payment_capture: 1
    })
  });
  if (res.status === 401) {
    throw new RazorpayAuthError("Razorpay authentication failed");
  }
  if (!res.ok) {
    const err = await res.text();
    throw new RazorpayApiError(`Razorpay order failed: ${err}`);
  }
  const data = await res.json();
  return { id: data.id, amount: data.amount, currency: data.currency, status: data.status };
}
class RazorpayAuthError extends Error {
  constructor(message) {
    super(message);
    this.name = "RazorpayAuthError";
  }
}
class RazorpayApiError extends Error {
  constructor(message) {
    super(message);
    this.name = "RazorpayApiError";
  }
}
async function refundRazorpayPayment(paymentId, amountPaise) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return { id: `rfnd_stub_${paymentId.slice(0, 8)}`, status: "processed" };
  }
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/payments/" + paymentId + "/refund", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(amountPaise ? { amount: amountPaise } : {})
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return { id: data.id, status: data.status };
}
export {
  RazorpayApiError as R,
  RazorpayAuthError as a,
  createRazorpayOrder as c,
  isRazorpayConfigured as i,
  refundRazorpayPayment as r,
  verifyRazorpayPaymentSignature as v
};
