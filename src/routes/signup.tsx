import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { checkPhoneAvailable } from "@/lib/auth.functions";
import { formatIndianPhoneDisplay, isValidIndianPhone, normalizeIndianPhone } from "@/lib/phone";
import { authRedirectUrl } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

type Step = "form" | "otp";

function SignupPage() {
  const navigate = useNavigate();
  const checkPhoneFn = useServerFn(checkPhoneAvailable);

  const [step, setStep] = useState<Step>("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidIndianPhone(phone)) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return;
    }

    setLoading(true);
    try {
      const normalized = normalizeIndianPhone(phone);
      await checkPhoneFn({ data: { phone: normalized } });

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          // Supabase may still require a redirect URL while generating confirmation payloads
          emailRedirectTo: authRedirectUrl("/account"),
          data: {
            full_name: fullName.trim(),
            phone: normalized,
            account_type: "player",
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        toast.success("Account created!");
        navigate({ to: "/account" });
        return;
      }

      setStep("otp");
      toast.success(`Enter the 6-digit code sent to ${email}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp,
        type: "signup",
      });

      if (error) {
        const retry = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: otp,
          type: "email",
        });
        if (retry.error) throw retry.error;
        if (retry.data.session) {
          toast.success("Email verified — welcome!");
          navigate({ to: "/account" });
          return;
        }
        throw error;
      }

      if (data.session) {
        toast.success("Email verified — welcome!");
        navigate({ to: "/account" });
        return;
      }

      toast.success("Verified! You can log in now.");
      navigate({ to: "/login" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  }

  async function onResendOtp() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
      });
      if (error) throw error;
      toast.success("New code sent to your email");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not resend code");
    } finally {
      setLoading(false);
    }
  }

  if (step === "otp") {
    return (
      <div className="container mx-auto flex max-w-md flex-col px-4 py-16">
        <h1 className="font-display text-3xl font-bold">Verify your email</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
          {isValidIndianPhone(phone) && (
            <>
              {" "}
              · Phone <span className="font-medium text-foreground">{formatIndianPhoneDisplay(normalizeIndianPhone(phone))}</span>
            </>
          )}
        </p>

        <form onSubmit={onVerifyOtp} className="mt-8 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <Label htmlFor="otp">Verification code</Label>
            <InputOTP id="otp" maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
            {loading ? "Verifying…" : "Verify & create account"}
          </Button>

          <div className="flex flex-col gap-2 text-center text-sm">
            <button
              type="button"
              className="text-primary hover:underline disabled:opacity-50"
              onClick={onResendOtp}
              disabled={loading}
            >
              Resend code
            </button>
            <button
              type="button"
              className="text-muted-foreground hover:underline"
              onClick={() => {
                setStep("form");
                setOtp("");
              }}
            >
              ← Back to sign up
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="font-display text-3xl font-bold">Create account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Player account — we verify your email with a one-time code (no link required). One phone per account.
      </p>
      <form onSubmit={onSendOtp} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="phone">Phone (unique)</Label>
          <Input
            id="phone"
            type="tel"
            required
            inputMode="numeric"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-muted-foreground">10-digit Indian mobile — one account per number</p>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending code…" : "Send verification code"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have one? <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link>
        <br />
        <span className="mt-2 inline-block">
          List a turf?{" "}
          <Link to="/owner/register" className="font-semibold text-primary hover:underline">
            Create a partner account
          </Link>
        </span>
      </p>
    </div>
  );
}
