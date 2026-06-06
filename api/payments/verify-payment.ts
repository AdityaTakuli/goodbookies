import { CheckoutError, verifyCheckoutPayment } from "../../src/lib/payments/checkout.ts";
import { getUserIdFromRequest, sendError, sendJson, setCors } from "../mobile/shared.js";

export const config = { runtime: "nodejs" };

type VercelReq = {
  method?: string;
  headers: { authorization?: string };
  body?: string;
};

type VercelRes = {
  status: (n: number) => VercelRes;
  json: (body: unknown) => void;
  end: (body?: string) => void;
  setHeader: (k: string, v: string) => void;
};

function parseBody(req: VercelReq): Record<string, unknown> {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body as Record<string, unknown>;
  try {
    return JSON.parse(req.body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method === "OPTIONS") {
    setCors(res);
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return sendError(res, "Method not allowed", 405);
  }

  const userId = await getUserIdFromRequest(req);
  if (!userId) return sendError(res, "Unauthorized", 401);

  try {
    const body = parseBody(req);
    const razorpay_payment_id = String(body.razorpay_payment_id ?? "");
    const razorpay_order_id = String(body.razorpay_order_id ?? "");
    const razorpay_signature = String(body.razorpay_signature ?? "");
    const bookingId = typeof body.booking_id === "string" ? body.booking_id : undefined;

    const result = await verifyCheckoutPayment({
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      bookingId,
      userId,
    });

    sendJson(res, result);
  } catch (error) {
    if (error instanceof CheckoutError) {
      return sendError(res, error.message, error.status);
    }
    console.error("[verify-payment]", error);
    return sendError(res, "Payment verification failed", 500);
  }
}
