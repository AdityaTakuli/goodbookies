import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import {
  ownerListVenues, ownerGetPricing, ownerSavePeakPricing, ownerSaveDayPricing,
  ownerAddDatePricing, ownerSaveDurationDiscounts, ownerListCoupons, ownerUpsertCoupon, ownerDeleteCoupon,
} from "@/lib/owner.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/owner/pricing")({
  component: OwnerPricing,
});

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function OwnerPricing() {
  const venuesFn = useServerFn(ownerListVenues);
  const pricingFn = useServerFn(ownerGetPricing);
  const savePeakFn = useServerFn(ownerSavePeakPricing);
  const saveDayFn = useServerFn(ownerSaveDayPricing);
  const addDateFn = useServerFn(ownerAddDatePricing);
  const saveDurFn = useServerFn(ownerSaveDurationDiscounts);
  const couponsFn = useServerFn(ownerListCoupons);
  const upsertCouponFn = useServerFn(ownerUpsertCoupon);
  const delCouponFn = useServerFn(ownerDeleteCoupon);
  const qc = useQueryClient();

  const { data: venues } = useQuery({ queryKey: ["owner-venues"], queryFn: () => venuesFn() });
  const [venueId, setVenueId] = useState("");
  const active = venueId || venues?.[0]?.id || "";

  const { data: pricing } = useQuery({ queryKey: ["owner-pricing", active], queryFn: () => pricingFn({ data: { venueId: active } }), enabled: !!active });
  const { data: coupons } = useQuery({ queryKey: ["owner-coupons"], queryFn: () => couponsFn() });

  const [peak, setPeak] = useState({ start_time: "17:00", end_time: "21:00", surcharge_type: "percent", surcharge_value: 20 });
  const [dayPrices, setDayPrices] = useState<Record<number, string>>({});
  const [dateOverride, setDateOverride] = useState({ date: "", price: "" });
  const [durRules, setDurRules] = useState([{ min_hours: 2, discount_percent: 5 }]);
  const [coupon, setCoupon] = useState({ code: "", discount_type: "percent" as const, discount_value: 10, min_booking_amount: 500 });

  useEffect(() => {
    if (pricing?.day) {
      const m: Record<number, string> = {};
      pricing.day.forEach((d: any) => { m[d.day_of_week] = String(d.price_override); });
      setDayPrices(m);
    }
  }, [pricing]);

  if (!active) return <p className="text-muted-foreground">Add a venue first.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Pricing & offers</h1>
        <select className="h-10 rounded-md border border-input bg-input px-3 text-sm" value={active} onChange={(e) => setVenueId(e.target.value)}>
          {(venues ?? []).map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </div>

      <Tabs defaultValue="peak">
        <TabsList className="bg-muted">
          <TabsTrigger value="peak">Peak hours</TabsTrigger>
          <TabsTrigger value="day">Day pricing</TabsTrigger>
          <TabsTrigger value="date">Date override</TabsTrigger>
          <TabsTrigger value="duration">Duration discounts</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
        </TabsList>

        <TabsContent value="peak" className="rounded-2xl border border-border/60 bg-card p-5 mt-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><Label>Start</Label><Input type="time" value={peak.start_time} onChange={(e) => setPeak({ ...peak, start_time: e.target.value })} /></div>
            <div><Label>End</Label><Input type="time" value={peak.end_time} onChange={(e) => setPeak({ ...peak, end_time: e.target.value })} /></div>
            <div><Label>Surcharge %</Label><Input type="number" value={peak.surcharge_value} onChange={(e) => setPeak({ ...peak, surcharge_value: Number(e.target.value) })} /></div>
          </div>
          <Button onClick={async () => {
            try {
              await savePeakFn({ data: { venueId: active, rules: [{ ...peak, day_of_week: null }] } });
              toast.success("Peak pricing saved");
              qc.invalidateQueries({ queryKey: ["owner-pricing"] });
            } catch (e: any) { toast.error(e.message); }
          }}>Save peak rules</Button>
        </TabsContent>

        <TabsContent value="day" className="rounded-2xl border border-border/60 bg-card p-5 mt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {DAYS.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-10 text-sm">{label}</span>
                <Input placeholder="₹/hr override" value={dayPrices[i] ?? ""} onChange={(e) => setDayPrices({ ...dayPrices, [i]: e.target.value })} />
              </div>
            ))}
          </div>
          <Button className="mt-4" onClick={async () => {
            const rules = Object.entries(dayPrices).filter(([, v]) => v).map(([d, v]) => ({ day_of_week: Number(d), price_override: Number(v) }));
            await saveDayFn({ data: { venueId: active, rules } });
            toast.success("Day pricing saved");
          }}>Save day pricing</Button>
        </TabsContent>

        <TabsContent value="date" className="rounded-2xl border border-border/60 bg-card p-5 mt-4 space-y-3">
          <div className="flex gap-3 flex-wrap">
            <Input type="date" value={dateOverride.date} onChange={(e) => setDateOverride({ ...dateOverride, date: e.target.value })} />
            <Input type="number" placeholder="₹/hr" value={dateOverride.price} onChange={(e) => setDateOverride({ ...dateOverride, price: e.target.value })} />
            <Button onClick={async () => {
              await addDateFn({ data: { venueId: active, date: dateOverride.date, price_override: Number(dateOverride.price) } });
              toast.success("Date price set");
              qc.invalidateQueries({ queryKey: ["owner-pricing"] });
            }}>Add</Button>
          </div>
          <ul className="text-sm text-muted-foreground">
            {(pricing?.date ?? []).map((d: any) => <li key={d.id}>{d.date}: ₹{d.price_override}/hr</li>)}
          </ul>
        </TabsContent>

        <TabsContent value="duration" className="rounded-2xl border border-border/60 bg-card p-5 mt-4 space-y-3">
          {durRules.map((r, i) => (
            <div key={i} className="flex gap-2">
              <Input type="number" placeholder="Min hours" value={r.min_hours} onChange={(e) => { const n = [...durRules]; n[i].min_hours = Number(e.target.value); setDurRules(n); }} />
              <Input type="number" placeholder="Discount %" value={r.discount_percent} onChange={(e) => { const n = [...durRules]; n[i].discount_percent = Number(e.target.value); setDurRules(n); }} />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setDurRules([...durRules, { min_hours: 3, discount_percent: 10 }])}>+ Rule</Button>
          <Button onClick={async () => { await saveDurFn({ data: { venueId: active, rules: durRules } }); toast.success("Saved"); }}>Save duration discounts</Button>
        </TabsContent>

        <TabsContent value="coupons" className="rounded-2xl border border-border/60 bg-card p-5 mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="CODE" value={coupon.code} onChange={(e) => setCoupon({ ...coupon, code: e.target.value.toUpperCase() })} />
            <Input type="number" placeholder="Value" value={coupon.discount_value} onChange={(e) => setCoupon({ ...coupon, discount_value: Number(e.target.value) })} />
          </div>
          <Button onClick={async () => {
            await upsertCouponFn({ data: { values: { ...coupon, venue_id: active, is_active: true } } });
            toast.success("Coupon created");
            qc.invalidateQueries({ queryKey: ["owner-coupons"] });
          }}>Create coupon</Button>
          <div className="space-y-2">
            {(coupons ?? []).map((c: any) => (
              <div key={c.id} className="flex justify-between text-sm border-b border-border/40 py-2">
                <span>{c.code} · {c.discount_type} {c.discount_value} · used {c.used_count}</span>
                <Button size="sm" variant="ghost" onClick={async () => { await delCouponFn({ data: { id: c.id } }); qc.invalidateQueries({ queryKey: ["owner-coupons"] }); }}>Delete</Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
