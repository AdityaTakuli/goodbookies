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
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { buildPageMeta } from "@/lib/seo";

export const Route = createFileRoute("/signup")({
  head: () => buildPageMeta({ title: "Sign up", path: "/signup", noIndex: true }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const checkPhoneFn = useServerFn(checkPhoneAvailable);

  const [sent, setSent] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
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

      setSent(true);
      toast.success("Check your email for the confirmation link");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  async function onResendLink() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: authRedirectUrl("/account") },
      });
      if (error) throw error;
      toast.success("Confirmation link sent again");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not resend link");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="container mx-auto flex max-w-md flex-col px-4 py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>. Click the link
          to activate your account and you&apos;ll land on My Account.
        </p>
        {isValidIndianPhone(phone) && (
          <p className="mt-2 text-sm text-muted-foreground">
            Phone on file:{" "}
            <span className="font-medium text-foreground">{formatIndianPhoneDisplay(normalizeIndianPhone(phone))}</span>
          </p>
        )}

        <div className="mt-8 space-y-3">
          <Button type="button" variant="outline" className="w-full" onClick={onResendLink} disabled={loading}>
            {loading ? "Sending…" : "Resend confirmation link"}
          </Button>
          <button
            type="button"
            className="w-full text-center text-sm text-muted-foreground hover:underline"
            onClick={() => setSent(false)}
          >
            ← Back to sign up
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already confirmed? <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="font-display text-3xl font-bold">Create account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Player account. We&apos;ll email you a confirmation link. One phone per account.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
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
          <p className="mt-1 text-xs text-muted-foreground">10-digit Indian mobile, one account per number</p>
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
          {loading ? "Creating account…" : "Create account"}
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
