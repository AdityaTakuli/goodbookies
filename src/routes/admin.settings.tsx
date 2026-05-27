import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { adminGetSettings, adminUpdateSettings } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const FIELDS = [
  { key: "site_name", label: "Site name" },
  { key: "contact_email", label: "Contact email" },
  { key: "support_phone", label: "Support phone" },
  { key: "peak_hour_surcharge_percent", label: "Peak hour surcharge (%)" },
  { key: "cancellation_hours", label: "Cancellation window (hours before slot)" },
  { key: "platform_commission_rate", label: "Platform commission (%)" },
] as const;

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const getFn = useServerFn(adminGetSettings);
  const saveFn = useServerFn(adminUpdateSettings);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-settings"], queryFn: () => getFn() });
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) setValues(data);
  }, [data]);

  const onSave = async () => {
    try {
      await saveFn({ data: values });
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform configuration.</p>
      </div>
      <div className="max-w-md space-y-4 rounded-2xl border border-border/60 bg-card p-6">
        {FIELDS.map((f) => (
          <div key={f.key} className="grid gap-1.5">
            <Label>{f.label}</Label>
            <Input
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          </div>
        ))}
        <Button onClick={onSave}>Save settings</Button>
      </div>
    </div>
  );
}
