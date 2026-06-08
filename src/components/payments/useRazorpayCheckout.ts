import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { verifyBookingPayment } from "@/lib/payment.functions";
import { readPublicRazorpayKeyId } from "@/lib/public-env";

type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayHandlerResponse) => void | Promise<void>;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayInstance = {
  on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let scriptPromise: Promise<boolean> | null = null;

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

export function useRazorpayCheckout() {
  const verifyFn = useServerFn(verifyBookingPayment);
  const [paying, setPaying] = useState(false);

  const openCheckout = useCallback(
    async (input: {
      bookingId: string;
      orderId: string;
      amountPaise: number;
      currency?: string;
      title: string;
      description: string;
      customerName?: string;
      customerEmail?: string;
    }) => {
      const keyId = readPublicRazorpayKeyId();
      if (!keyId) {
        toast.error("Payment gateway is not configured");
        return false;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        toast.error("Could not load Razorpay checkout");
        return false;
      }

      setPaying(true);

      return new Promise<boolean>((resolve) => {
        const rzp = new window.Razorpay!({
          key: keyId,
          amount: input.amountPaise,
          currency: input.currency ?? "INR",
          name: input.title,
          description: input.description,
          order_id: input.orderId,
          prefill: {
            name: input.customerName,
            email: input.customerEmail,
          },
          theme: { color: "#10b981" },
          handler: async (response) => {
            try {
              await verifyFn({
                data: {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  booking_id: input.bookingId,
                },
              });
              toast.success("Payment successful. Booking confirmed!");
              resolve(true);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Payment verification failed");
              resolve(false);
            } finally {
              setPaying(false);
            }
          },
          modal: {
            ondismiss: () => {
              toast.info("Payment cancelled");
              setPaying(false);
              resolve(false);
            },
          },
        });

        rzp.on("payment.failed", (response) => {
          toast.error(response.error?.description ?? "Payment failed");
          setPaying(false);
          resolve(false);
        });

        rzp.open();
      });
    },
    [verifyFn],
  );

  return { openCheckout, paying };
}
