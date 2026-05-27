import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ownerListVenues, ownerListSlots, ownerBlockSlot, ownerUnblockSlot } from "@/lib/owner.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/owner/slots")({
  component: OwnerSlots,
});

function OwnerSlots() {
  const venuesFn = useServerFn(ownerListVenues);
  const slotsFn = useServerFn(ownerListSlots);
  const blockFn = useServerFn(ownerBlockSlot);
  const unblockFn = useServerFn(ownerUnblockSlot);
  const qc = useQueryClient();

  const month = new Date().toISOString().slice(0, 7);
  const [venueId, setVenueId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [blockStart, setBlockStart] = useState("18:00");
  const [blockEnd, setBlockEnd] = useState("20:00");

  const { data: venues } = useQuery({ queryKey: ["owner-venues"], queryFn: () => venuesFn() });
  const activeVenue = venueId || venues?.[0]?.id || "";
  const { data: slotData } = useQuery({
    queryKey: ["owner-slots", activeVenue, month],
    queryFn: () => slotsFn({ data: { venueId: activeVenue, month } }),
    enabled: !!activeVenue,
  });

  const dayBookings = (slotData?.bookings ?? []).filter((b: any) => b.booking_date === selectedDate);
  const dayBlocks = (slotData?.blocks ?? []).filter((b: any) => !b.block_date || b.block_date === selectedDate || b.is_recurring);

  const onBlock = async () => {
    try {
      await blockFn({ data: { venueId: activeVenue, date: selectedDate, startTime: blockStart, endTime: blockEnd, reason: "Owner block" } });
      toast.success("Slot blocked");
      qc.invalidateQueries({ queryKey: ["owner-slots"] });
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Slot management</h1>
      <div className="flex flex-wrap gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Venue</Label>
          <select className="mt-1 h-10 rounded-md border border-input bg-input px-3 text-sm" value={activeVenue} onChange={(e) => setVenueId(e.target.value)}>
            {(venues ?? []).map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Date</Label>
          <Input type="date" className="mt-1" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="font-semibold">Day schedule</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 16 }, (_, i) => i + 6).map((h) => {
              const booked = dayBookings.some((b: any) => h >= b.start_hour && h < b.end_hour && b.status !== "cancelled");
              const blocked = dayBlocks.some((bl: any) => {
                const sh = Number(String(bl.start_time).slice(0, 2));
                const eh = Number(String(bl.end_time).slice(0, 2));
                return h >= sh && h < eh;
              });
              const cls = booked ? "bg-destructive/20 text-destructive" : blocked ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary";
              return <span key={h} className={`rounded-lg px-3 py-2 text-sm font-medium ${cls}`}>{h}:00</span>;
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Green = available · Red = booked · Grey = blocked</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
          <h2 className="font-semibold">Block time range</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>From</Label><Input type="time" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} /></div>
            <div><Label>To</Label><Input type="time" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} /></div>
          </div>
          <Button onClick={onBlock}>Block slots</Button>
          <div className="pt-4 border-t border-border/60">
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Active blocks</p>
            {(slotData?.blocks ?? []).map((bl: any) => (
              <div key={bl.id} className="flex justify-between items-center py-2 text-sm">
                <span>{bl.block_date ?? `Day ${bl.recurrence_day}`} · {String(bl.start_time).slice(0, 5)}–{String(bl.end_time).slice(0, 5)}</span>
                <Button size="sm" variant="ghost" onClick={async () => { await unblockFn({ data: { id: bl.id, venueId: activeVenue } }); qc.invalidateQueries({ queryKey: ["owner-slots"] }); }}>Remove</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
