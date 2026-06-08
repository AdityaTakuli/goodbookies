import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo } from "react";
import { adminListUsers, adminBanUser } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const listFn = useServerFn(adminListUsers);
  const banFn = useServerFn(adminBanUser);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => listFn() });
  const [q, setQ] = useState("");

  const toggleBan = async (id: string, banned: boolean) => {
    if (!confirm(banned ? "Ban this user?" : "Unban this user?")) return;
    try {
      await banFn({ data: { id, banned } });
      toast.success(banned ? "User banned" : "User unbanned");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filtered = useMemo(() => {
    if (!data) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return data;
    return data.filter((u: any) =>
      (u.full_name ?? "").toLowerCase().includes(needle) ||
      (u.email ?? "").toLowerCase().includes(needle) ||
      (u.phone ?? "").toLowerCase().includes(needle),
    );
  }, [data, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Players</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All registered players · {filtered.length} of {data?.length ?? 0} shown
          </p>
        </div>
        <Input placeholder="Search name, email, phone" value={q} onChange={(e) => setQ(e.target.value)} className="w-64" />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Phone</th>
                <th className="pb-2 font-medium">Joined</th>
                <th className="pb-2 font-medium text-right">Bookings</th>
                <th className="pb-2 font-medium text-right">Spent</th>
                <th className="pb-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: any) => (
                <tr key={u.id} className="border-b border-border/30 last:border-0">
                  <td className="py-3 font-medium">{u.full_name || "N/A"}</td>
                  <td className="py-3 text-muted-foreground">{u.email}</td>
                  <td className="py-3 text-muted-foreground">{u.phone || "N/A"}</td>
                  <td className="py-3 text-muted-foreground">{u.created_at?.slice(0, 10)}</td>
                  <td className="py-3 text-right">{u.stats.count}</td>
                  <td className="py-3 text-right font-semibold text-primary">₹{u.stats.spent.toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => toggleBan(u.id, !u.is_banned)}>
                      {u.is_banned ? "Unban" : "Ban"}
                    </Button>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-sm text-muted-foreground">No users.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}