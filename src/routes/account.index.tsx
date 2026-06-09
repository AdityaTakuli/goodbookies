import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Star } from "lucide-react";
import { listMyBookings } from "@/lib/booking.functions";
import {
  acceptLobbyQuery,
  declineLobbyQuery,
  listMyLobbyQueries,
  listPendingQueriesForHost,
} from "@/lib/lobby.functions";
import { cancelMyBooking } from "@/lib/account.functions";
import { resolveVenueImage } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { formatBookingSlotLabel, formatBookingStartLabel } from "@/lib/slot-time";

export const Route = createFileRoute("/account/")({
  component: AccountBookings,
});

const queryStatusLabel: Record<string, string> = {
  pending: "Pending host approval",
  accepted: "Approved, ready to play",
  rejected: "Rejected",
  expired: "Expired / full",
};

function AccountBookings() {
  const listFn = useServerFn(listMyBookings);
  const cancelFn = useServerFn(cancelMyBooking);
  const hostQueriesFn = useServerFn(listPendingQueriesForHost);
  const myQueriesFn = useServerFn(listMyLobbyQueries);
  const acceptFn = useServerFn(acceptLobbyQuery);
  const declineFn = useServerFn(declineLobbyQuery);
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => listFn(),
  });

  const { data: hostQueries } = useQuery({
    queryKey: ["host-lobby-queries"],
    queryFn: () => hostQueriesFn(),
    refetchInterval: 5000,
  });

  const { data: sentQueries } = useQuery({
    queryKey: ["my-lobby-queries"],
    queryFn: () => myQueriesFn(),
    refetchInterval: 5000,
  });

  const { upcoming, past, cancelled } = useMemo(() => {
    const u: typeof bookings = [];
    const p: typeof bookings = [];
    const c: typeof bookings = [];
    (bookings ?? []).forEach((b) => {
      if (b.status === "cancelled") c.push(b);
      else if (b.booking_date >= today) u.push(b);
      else p.push(b);
    });
    return { upcoming: u, past: p, cancelled: c };
  }, [bookings, today]);

  const onCancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await cancelFn({ data: { id } });
      toast.success("Booking cancelled");
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const onAccept = async (queryId: string) => {
    try {
      await acceptFn({ data: { queryId } });
      toast.success("Player added to your match");
      qc.invalidateQueries({ queryKey: ["host-lobby-queries"] });
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
      qc.invalidateQueries({ queryKey: ["open-lobbies"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const onDecline = async (queryId: string) => {
    try {
      await declineFn({ data: { queryId } });
      toast.success("Request declined");
      qc.invalidateQueries({ queryKey: ["host-lobby-queries"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const pendingSent = (sentQueries ?? []).filter((q) => q.status === "pending" || q.status === "accepted");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">My bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">{bookings?.length ?? 0} total</p>
      </div>

      {(hostQueries?.length ?? 0) > 0 && (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <h2 className="font-display text-lg font-semibold">Join requests on your matches</h2>
          <div className="mt-4 space-y-4">
            {hostQueries!.map((q: any) => {
              const seeker = q.seeker?.full_name || q.seeker?.email || "A player";
              const names = (q.player_names ?? []).join(", ");
              const b = q.booking;
              return (
                <div key={q.id} className="rounded-xl border border-border/60 bg-card p-4">
                  <p className="text-sm">
                    <span className="font-semibold">{seeker}</span> wants to join your{" "}
                    <span className="font-semibold">{formatBookingStartLabel(b)}</span> game on{" "}
                    <span className="font-semibold">{b?.booking_date}</span> with{" "}
                    <span className="font-semibold">{q.player_count}</span> player{q.player_count === 1 ? "" : "s"}
                    {names ? ` (${names})` : ""}.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{b?.venue?.name}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => onAccept(q.id)}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => onDecline(q.id)}>Reject</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {pendingSent.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold">Sent join requests</h2>
          <div className="mt-4 grid gap-3">
            {pendingSent.map((q: any) => (
              <div key={q.id} className="rounded-xl border border-border/60 bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{(q.booking as any)?.venue?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(q.booking as any)?.booking_date} · {formatBookingStartLabel((q.booking as any) ?? { start_hour: 0 })} · {q.player_count} players
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                    {queryStatusLabel[q.status] ?? q.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {isLoading && <p className="text-muted-foreground">Loading…</p>}

      {!isLoading && bookings?.length === 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-10 text-center">
          <p className="text-muted-foreground">No bookings yet.</p>
          <Link to="/sports"><Button className="mt-4">Book your first slot</Button></Link>
        </div>
      )}

      <BookingSection title="Upcoming" items={upcoming} onCancel={onCancel} rebook={false} />
      <BookingSection title="Past" items={past} rebook />
      <BookingSection title="Cancelled" items={cancelled} />
    </div>
  );
}

function BookingSection({
  title,
  items,
  onCancel,
  rebook,
}: {
  title: string;
  items: any[] | undefined;
  onCancel?: (id: string) => void;
  rebook?: boolean;
}) {
  if (!items?.length) return null;
  return (
    <div>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-4 grid gap-4">
        {items.map((b, i) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center"
          >
            <img
              src={resolveVenueImage((b.venue as any)?.image_url)}
              alt=""
              loading="lazy"
              className="h-24 w-full rounded-lg object-cover sm:w-32"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span>{(b.venue as any)?.sport?.icon}</span>
                <h3 className="font-display text-lg font-semibold">{(b.venue as any)?.name}</h3>
                {b.is_open_lobby && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">Open lobby</span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{(b.venue as any)?.city}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{b.booking_date} · {formatBookingSlotLabel(b)}</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{b.player_count} players</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="font-display text-xl font-bold text-primary">₹{b.total_price}</p>
              <StatusBadge status={b.status} />
              {onCancel && b.status === "confirmed" && (
                <Button size="sm" variant="outline" onClick={() => onCancel(b.id)}>Cancel</Button>
              )}
              {rebook && (
                <>
                  <Link to="/venues/$slug" params={{ slug: (b.venue as any)?.slug }} hash="reviews">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Star className="h-3.5 w-3.5" />
                      Review turf
                    </Button>
                  </Link>
                  <Link to="/venues/$slug" params={{ slug: (b.venue as any)?.slug }}>
                    <Button size="sm" variant="ghost">Re-book</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
