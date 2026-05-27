import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { listMyBookings } from "@/lib/booking.functions";
import { cancelMyBooking } from "@/lib/account.functions";
import { resolveVenueImage } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";

export const Route = createFileRoute("/account/")({
  component: AccountBookings,
});

function AccountBookings() {
  const listFn = useServerFn(listMyBookings);
  const cancelFn = useServerFn(cancelMyBooking);
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => listFn(),
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">My bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">{bookings?.length ?? 0} total</p>
      </div>

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
              </div>
              <div className="mt-1 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{(b.venue as any)?.city}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{b.booking_date} · {b.start_hour}:00 – {b.end_hour}:00</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="font-display text-xl font-bold text-primary">₹{b.total_price}</p>
              <StatusBadge status={b.status} />
              {onCancel && b.status === "confirmed" && (
                <Button size="sm" variant="outline" onClick={() => onCancel(b.id)}>Cancel</Button>
              )}
              {rebook && (
                <Link to="/venues/$slug" params={{ slug: (b.venue as any)?.slug }}>
                  <Button size="sm" variant="ghost">Re-book</Button>
                </Link>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
