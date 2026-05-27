import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminSendNotification, adminNotificationLog } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/notifications")({
  component: AdminNotifications,
});

function AdminNotifications() {
  const sendFn = useServerFn(adminSendNotification);
  const logFn = useServerFn(adminNotificationLog);
  const qc = useQueryClient();
  const { data: log } = useQuery({ queryKey: ["admin-notif-log"], queryFn: () => logFn() });
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const onSend = async () => {
    if (!title.trim() || !message.trim()) return;
    try {
      const res = await sendFn({ data: { title, message, target_type: "all", channel: "in-app" } });
      toast.success(`Sent to ${res.count} users`);
      setTitle("");
      setMessage("");
      qc.invalidateQueries({ queryKey: ["admin-notif-log"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">Send bulk in-app messages.</p>
      </div>

      <div className="max-w-lg space-y-4 rounded-2xl border border-border/60 bg-card p-6">
        <div className="grid gap-1.5"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="grid gap-1.5"><Label>Message</Label><Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
        <Button onClick={onSend}>Send to all users</Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Sent log</h2>
        <div className="mt-4 space-y-3">
          {(log ?? []).map((n: any) => (
            <div key={n.id} className="rounded-xl border border-border/40 p-4">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">{n.title}</span>
                <span className="text-muted-foreground">{n.sent_at?.slice(0, 16).replace("T", " ")}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
              <p className="mt-2 text-xs text-muted-foreground">Delivered: {n.delivery_count} · {n.channel}</p>
            </div>
          ))}
          {(!log || log.length === 0) && <p className="text-sm text-muted-foreground">No notifications sent yet.</p>}
        </div>
      </div>
    </div>
  );
}
