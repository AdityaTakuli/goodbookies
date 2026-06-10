import { CreditCard, IndianRupee, Info, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FULL_TURF_TOKEN_PERCENT, computeFullTurfTokenAmount, type FullTurfPaymentPlan } from "@/lib/pricing";

type BookingPaymentPortalProps = {
  amount: number;
  fullAmount: number;
  balanceDue?: number;
  bookingLabel: string;
  hours: number;
  venueName: string;
  isIndividual?: boolean;
  isFullTurf?: boolean;
  paymentPlan?: FullTurfPaymentPlan;
  onPaymentPlanChange?: (plan: FullTurfPaymentPlan) => void;
  termsAccepted?: boolean;
  onTermsAcceptedChange?: (accepted: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  requiresPayment?: boolean;
  awaitingCheckout?: boolean;
  onPay: () => void;
  onOpenCheckout?: () => void;
};

export function BookingPaymentPortal({
  amount,
  fullAmount,
  balanceDue = 0,
  bookingLabel,
  hours,
  venueName,
  isIndividual,
  isFullTurf,
  paymentPlan = "full",
  onPaymentPlanChange,
  termsAccepted,
  onTermsAcceptedChange,
  disabled,
  loading,
  requiresPayment = true,
  awaitingCheckout = false,
  onPay,
  onOpenCheckout,
}: BookingPaymentPortalProps) {
  const tokenPercentLabel = Math.round(FULL_TURF_TOKEN_PERCENT * 100);
  const tokenAmount = computeFullTurfTokenAmount(fullAmount);
  const tokenBalance = fullAmount - tokenAmount;
  const payBlocked = isIndividual && !termsAccepted;

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
        {isFullTurf && paymentPlan === "token" && balanceDue > 0 && (
          <p className="mt-1 text-xs text-amber-400">
            {tokenPercentLabel}% token now · ₹{balanceDue.toLocaleString()} balance due before your slot
          </p>
        )}
      </div>

      {isFullTurf && onPaymentPlanChange && (
        <div className="space-y-2 rounded-xl border border-[#1E3A27] bg-[#0B130E]/60 p-3">
          <p className="text-xs font-semibold text-foreground">How would you like to pay?</p>
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
              paymentPlan === "full" ? "border-primary bg-primary/5" : "border-border/60"
            }`}
          >
            <input
              type="radio"
              name="paymentPlan"
              checked={paymentPlan === "full"}
              onChange={() => onPaymentPlanChange("full")}
              className="mt-1"
            />
            <span className="text-sm">
              <span className="font-semibold">Pay full amount</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                ₹{fullAmount.toLocaleString()} now — booking fully confirmed
              </span>
            </span>
          </label>
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
              paymentPlan === "token" ? "border-primary bg-primary/5" : "border-border/60"
            }`}
          >
            <input
              type="radio"
              name="paymentPlan"
              checked={paymentPlan === "token"}
              onChange={() => onPaymentPlanChange("token")}
              className="mt-1"
            />
            <span className="text-sm">
              <span className="font-semibold">Pay {tokenPercentLabel}% token</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                ₹{tokenAmount.toLocaleString()} now · remaining ₹{tokenBalance.toLocaleString()} due before play
              </span>
            </span>
          </label>
        </div>
      )}

      {isIndividual && (
        <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div className="space-y-2">
              <p className="font-semibold text-foreground">Individual booking terms</p>
              <p>
                If the turf does not fill up with other players, you may be required to pay the full
                turf fee for your slot.
              </p>
              <p>You can cancel your booking free of charge up to 1 hour before your slot starts.</p>
            </div>
          </div>
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox
              checked={termsAccepted}
              onCheckedChange={(v) => onTermsAcceptedChange?.(v === true)}
              className="mt-0.5"
            />
            <span className="text-xs text-muted-foreground">
              I understand these terms and agree to proceed with my individual spot booking.
            </span>
          </label>
        </div>
      )}

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
          disabled={disabled || loading || payBlocked}
          onClick={onPay}
        >
          {loading
            ? "Processing…"
            : requiresPayment
              ? payBlocked
                ? "Accept terms to continue"
                : `Pay ₹${amount.toLocaleString()} & confirm booking`
              : "Confirm booking"}
        </Button>
      )}
    </div>
  );
}
