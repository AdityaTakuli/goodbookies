import {
  CheckoutError,
  createCheckoutOrder,
  MIN_ORDER_PAISE,
} from "../../src/lib/payments/checkout.ts";
import { RazorpayApiError, RazorpayAuthError } from "../../src/lib/services/razorpay.ts";
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
    const amount = Number(body.amount);
    const currency = typeof body.currency === "string" ? body.currency : "INR";
    const receipt = typeof body.receipt === "string" ? body.receipt : `rcpt_${Date.now()}`;

    if (!Number.isFinite(amount) || amount < MIN_ORDER_PAISE) {
      return sendError(res, `Amount must be at least ${MIN_ORDER_PAISE} paise`, 400);
    }

    const order = await createCheckoutOrder({
      amountPaise: Math.round(amount),
      receipt,
      currency,
    });

    sendJson(res, order);
  } catch (error) {
    if (error instanceof CheckoutError) {
      return sendError(res, error.message, error.status);
    }
    if (error instanceof RazorpayAuthError) {
      return sendError(res, error.message, 401);
    }
    if (error instanceof RazorpayApiError) {
      return sendError(res, error.message, 500);
    }
    console.error("[create-order]", error);
    return sendError(res, "Failed to create order", 500);
  }
}
