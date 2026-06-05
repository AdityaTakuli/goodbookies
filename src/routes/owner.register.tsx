import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { registerOwner } from "@/lib/owner.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/owner/register")({
  component: OwnerRegister,
});

function OwnerRegister() {
  const registerFn = useServerFn(registerOwner);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirm: "",
    business_name: "", city: "", agreed: false,
  });
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords don't match"); return; }
    if (!form.agreed) { toast.error("Please accept the terms"); return; }
    try {
      const res = await registerFn({
        data: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          business_name: form.business_name || undefined,
          city: form.city,
        },
      });
      toast.success(res.message);
      setDone(true);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (done) {
    return (
      <div className="container mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Partner account created</h1>
        <p className="mt-3 text-muted-foreground">Your partner account is approved instantly. Continue to owner login.</p>
        <Link to="/owner/login" className="mt-6 inline-block text-sm text-primary hover:underline">Go to owner login →</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-12">
      <h1 className="font-display text-4xl font-bold">List your venue</h1>
      <p className="mt-2 text-muted-foreground">
        Use the same Gmail as your player account — we&apos;ll link partner access. You can book other turfs as a player, but not your own.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-border/60 bg-card p-6">
        <Field label="Full name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Email"><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Phone"><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="Business name (optional)"><Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} /></Field>
        <Field label="City"><Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
        <Field label="Password"><Input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <Field label="Confirm password"><Input type="password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} /></Field>
        <label className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={form.agreed}
            onChange={(e) => setForm({ ...form, agreed: e.target.checked })}
          />
          <span>I agree to the Terms &amp; Conditions</span>
        </label>
        <Button type="submit" className="w-full">Create partner account</Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/owner/login" className="text-primary hover:underline">Owner login</Link>
        </p>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-1.5"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>{children}</div>;
}
