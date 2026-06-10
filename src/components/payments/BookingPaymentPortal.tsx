import { CreditCard, IndianRupee, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type BookingPaymentPortalProps = {
  amount: number;
  bookingLabel: string;
  hours: number;
  venueName: string;
  disabled?: boolean;
  loading?: boolean;
  requiresPayment?: boolean;
  awaitingCheckout?: boolean;
  onPay: () => void;
  onOpenCheckout?: () => void;
};

export function BookingPaymentPortal({
  amount,
  bookingLabel,
  hours,
  venueName,
  disabled,
  loading,
  requiresPayment = true,
  awaitingCheckout = false,
  onPay,
  onOpenCheckout,
}: BookingPaymentPortalProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-primary/30 bg-gradient-to-b from-[#142219] to-card p-5 shadow-[var(--shadow-glow)]">
      <div className="flex items-center gap-2 text-primary">
        <CreditCard className="h-4 w-4" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em]">Payment portal</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Booking at {venueName}</p>
        <p className="mt-1 flex items-center font-display text-3xl font-bold text-foreground">
          <IndianRupee className="h-6 w-6" />
          {amount.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {hours} hour{hours === 1 ? "" : "s"} · {bookingLabel}
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-[#1E3A27] bg-[#0B130E]/60 p-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>
          {requiresPayment
            ? "Pay securely via Razorpay to confirm your slot. Your booking stays reserved until payment completes."
            : "No payment required. Your booking will be confirmed immediately."}
        </p>
      </div>

      {awaitingCheckout ? (
        <>
          <p className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
            Slot reserved. Open Razorpay checkout to complete payment.
          </p>
          <Button
            size="lg"
            className="glow-primary h-12 w-full"
            disabled={loading}
            onClick={onOpenCheckout}
          >
            {loading ? "Opening…" : `Open Razorpay · Pay ₹${amount.toLocaleString()}`}
          </Button>
        </>
      ) : (
        <Button
          size="lg"
          className="glow-primary h-12 w-full"
          disabled={disabled || loading}
          onClick={onPay}
        >
          {loading
            ? "Processing…"
            : requiresPayment
              ? `Pay ₹${amount.toLocaleString()} & confirm booking`
              : "Confirm booking"}
        </Button>
      )}
    </div>
  );
}
