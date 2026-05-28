import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { getOwnerStatus } from "@/lib/owner.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
        toast.message("Logged in. Create a partner application to access owner features.");
      } else if (owner.status === "pending") {
        toast.message("Logged in. Your partner application is pending approval.");
      } else if (owner.status === "rejected") {
        toast.message(owner.rejection_reason ?? "Logged in. Your application was not approved.");
      } else if (owner.status === "suspended") {
        toast.message("Logged in. Your partner account is suspended.");
      }
      navigate({ to: "/owner" });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Owner Login</h1>
      <p className="mt-2 text-muted-foreground">Access your venue partner dashboard.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-border/60 bg-card p-6">
        <div className="grid gap-1.5"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="grid gap-1.5"><Label>Password</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <Button type="submit" className="w-full">Log in</Button>
        <p className="text-center text-sm text-muted-foreground">
          Need a partner account? <Link to="/owner/register" className="text-primary hover:underline">Register</Link>
        </p>
      </form>
    </div>
  );
}
