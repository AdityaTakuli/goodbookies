import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { authRedirectUrl } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { buildPageMeta } from "@/lib/seo";

export const Route = createFileRoute("/forgot-password")({
  head: () => buildPageMeta({ title: "Forgot password", path: "/forgot-password", noIndex: true }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: authRedirectUrl("/reset-password"),
      });
      if (error) throw error;
      setSent(true);
      toast.success("Password reset link sent — check your email");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send reset email");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="container mx-auto flex max-w-md flex-col px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold">Check your email</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          If an account exists for <span className="font-medium text-foreground">{email}</span>, we sent a link to
          set a new password. The link opens on this site.
        </p>
        <Link to="/login" className="mt-8 text-sm font-semibold text-primary hover:underline">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="font-display text-3xl font-bold">Forgot password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your email and we&apos;ll send a secure link to choose a new password.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-semibold text-primary hover:underline">
          ← Back to log in
        </Link>
      </p>
    </div>
  );
}
