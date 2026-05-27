import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ownerGetPayouts, ownerSavePayoutDetails } from "@/lib/owner.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/owner/payouts")({
  component: OwnerPayouts,
});

function OwnerPayouts() {
  const getFn = useServerFn(ownerGetPayouts);
  const saveFn = useServerFn(ownerSavePayoutDetails);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["owner-payouts"], queryFn: () => getFn() });
  const [bank, setBank] = useState({ account_holder_name: "", account_number: "", ifsc_code: "", bank_name: "" });

  const saveBank = async () => {
    try {
      await saveFn({ data: bank });
      toast.success("Bank details saved");
      qc.invalidateQueries({ queryKey: ["owner-payouts"] });
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">Payouts</h1>
      <p className="text-sm text-muted-foreground">Platform commission: {data?.commissionRate ?? 10}% · Payouts processed manually by admin.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Lifetime earned", value: data?.lifetimeEarned },
          { label: "Commission", value: data?.commissionDeducted },
          { label: "Net earned", value: data?.netEarned, accent: true },
          { label: "Pending payout", value: data?.pendingPayout },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-border/60 bg-card p-5">
            <p className="text-xs uppercase text-muted-foreground">{c.label}</p>
            <p className={`mt-2 font-display text-2xl font-bold ${c.accent ? "text-primary" : ""}`}>₹{(c.value ?? 0).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
          <h2 className="font-semibold">Bank details</h2>
          <div className="grid gap-2">
            <div><Label>Account holder</Label><Input value={bank.account_holder_name || data?.bank?.account_holder_name || ""} onChange={(e) => setBank({ ...bank, account_holder_name: e.target.value })} /></div>
            <div><Label>Account number</Label><Input value={bank.account_number || data?.bank?.account_number || ""} onChange={(e) => setBank({ ...bank, account_number: e.target.value })} /></div>
            <div><Label>IFSC</Label><Input value={bank.ifsc_code || data?.bank?.ifsc_code || ""} onChange={(e) => setBank({ ...bank, ifsc_code: e.target.value })} /></div>
            <div><Label>Bank name</Label><Input value={bank.bank_name || data?.bank?.bank_name || ""} onChange={(e) => setBank({ ...bank, bank_name: e.target.value })} /></div>
          </div>
          <Button onClick={saveBank}>Save bank details</Button>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="font-semibold mb-3">Payout history</h2>
          <div className="space-y-2 text-sm">
            {(data?.payouts ?? []).length === 0 && <p className="text-muted-foreground">No payouts yet.</p>}
            {(data?.payouts ?? []).map((p: any) => (
              <div key={p.id} className="flex justify-between border-b border-border/40 py-2">
                <span>{p.created_at?.slice(0, 10)} · {p.status}</span>
                <span className="font-semibold text-primary">₹{p.net_amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
