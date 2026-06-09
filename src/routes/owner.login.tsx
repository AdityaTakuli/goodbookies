import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { getOwnerStatus } from "@/lib/owner.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { resolvePartnerLoginPath } from "@/lib/auth-landing";

export const Route = createFileRoute("/owner/login")({
  component: OwnerLogin,
});

function OwnerLogin() {
  const navigate = useNavigate();
  const statusFn = useServerFn(getOwnerStatus);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); return; }

    try {
      const owner = await statusFn();
      if (!owner) {
        toast.message("Logged in. Add partner access to list your venue.");
        navigate({ to: "/owner/register" });
        return;
      }
      if (owner.status === "pending") {
        toast.message("Your partner application is pending approval.");
      } else if (owner.status === "rejected") {
        toast.message(owner.rejection_reason ?? "Your application was not approved.");
      } else if (owner.status === "suspended") {
        toast.message("Your partner account is suspended.");
      }
      navigate({ to: resolvePartnerLoginPath() });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Partner login</h1>
      <p className="mt-2 text-muted-foreground">Turf owners land on the Partner dashboard after sign in.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-border/60 bg-card p-6">
        <div className="grid gap-1.5"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <Label>Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full">Log in</Button>
        <p className="text-center text-sm text-muted-foreground">
          Need a partner account? <Link to="/owner/register" className="text-primary hover:underline">Register</Link>
        </p>
      </form>
    </div>
  );
}
