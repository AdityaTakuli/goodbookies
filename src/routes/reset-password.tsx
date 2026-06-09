import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { buildPageMeta } from "@/lib/seo";
import { PLAYER_HOME } from "@/lib/auth-landing";

export const Route = createFileRoute("/reset-password")({
  head: () => buildPageMeta({ title: "Reset password", path: "/reset-password", noIndex: true }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initRecoverySession() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!cancelled && !error) setReady(true);
        if (!cancelled) setChecking(false);
        return;
      }

      const hash = window.location.hash;
      if (hash.includes("type=recovery") || hash.includes("access_token")) {
        const { data, error } = await supabase.auth.getSession();
        if (!cancelled && !error && data.session) setReady(true);
        if (!cancelled) setChecking(false);
        return;
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" && session) {
          setReady(true);
          setChecking(false);
        }
      });

      const { data } = await supabase.auth.getSession();
      if (!cancelled && data.session) {
        setReady(true);
        setChecking(false);
      } else if (!cancelled) {
        setChecking(false);
      }

      return () => subscription.unsubscribe();
    }

    const cleanupPromise = initRecoverySession();
    return () => {
      cancelled = true;
      void cleanupPromise;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. You're logged in.");
      navigate({ to: PLAYER_HOME });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update password");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="container mx-auto flex max-w-md flex-col px-4 py-16">
        <p className="text-muted-foreground">Verifying reset link…</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="container mx-auto flex max-w-md flex-col px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold">Link expired or invalid</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Request a new password reset link and open it from the same browser.
        </p>
        <Link to="/forgot-password" className="mt-8 text-sm font-semibold text-primary hover:underline">
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="font-display text-3xl font-bold">Set new password</h1>
      <p className="mt-1 text-sm text-muted-foreground">Choose a new password for your account.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
