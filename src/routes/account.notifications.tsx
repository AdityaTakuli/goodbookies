import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyNotifications, markNotificationsRead } from "@/lib/account.functions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/account/notifications")({
  component: AccountNotifications,
});

function AccountNotifications() {
  const listFn = useServerFn(listMyNotifications);
  const markFn = useServerFn(markNotificationsRead);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["my-notifications"], queryFn: () => listFn() });

  const markAll = async () => {
    try {
      await markFn();
      toast.success("All marked as read");
      qc.invalidateQueries({ queryKey: ["my-notifications"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data?.filter((n) => !n.is_read).length ?? 0} unread</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAll}>Mark all read</Button>
      </div>
      <div className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {(data ?? []).map((n) => (
          <div
            key={n.id}
            className={`rounded-2xl border border-border/60 p-4 ${n.is_read ? "bg-card opacity-75" : "bg-primary/5"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold">{n.title}</p>
              <span className="text-xs text-muted-foreground">{n.created_at?.slice(0, 10)}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
          </div>
        ))}
        {!isLoading && (data ?? []).length === 0 && (
          <p className="rounded-2xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}
