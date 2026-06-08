import { c as createServerRpc } from "./createServerRpc-DKAsi4Th.js";
import { l as createServerFn } from "./server-BB13nDRL.js";
import { r as requireSupabaseAuth } from "./auth-middleware-5muUp2Nu.js";
import { s as supabaseAdmin } from "./client.server-CQTuKCic.js";
import { i as isAllowedImageReference } from "./paths-BeoFimim.js";
import { t as toCsv } from "./export-BP4E1wVQ.js";
import { r as refundRazorpayPayment } from "./razorpay-DwVM9bks.js";
import { o as objectType, n as numberType, s as stringType, e as enumType, c as booleanType, r as recordType } from "./types-DeUvCBv7.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-BlRNeFf7.js";
import "node:crypto";
async function assertAdmin(userId) {
  const {
    data,
    error
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}
function todayISO() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function daysAgoISO(n) {
  const d = /* @__PURE__ */ new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
const adminSummary_createServerFn_handler = createServerRpc({
  id: "6ef41fefe1c66f448832c899f30dd530b784c2262114118afbd370eeb4ac323f",
  name: "adminSummary",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminSummary.__executeServer(opts));
const adminSummary = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminSummary_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const today = todayISO();
  const monthStart = today.slice(0, 7) + "-01";
  const weekAgo = daysAgoISO(7);
  const [bToday, bMonth, venues, users, cancels] = await Promise.all([supabaseAdmin.from("bookings").select("total_price, status").eq("booking_date", today), supabaseAdmin.from("bookings").select("total_price, status").gte("booking_date", monthStart), supabaseAdmin.from("venues").select("id", {
    count: "exact",
    head: true
  }).eq("is_active", true), supabaseAdmin.from("profiles").select("id", {
    count: "exact",
    head: true
  }).gte("created_at", weekAgo), supabaseAdmin.from("bookings").select("id", {
    count: "exact",
    head: true
  }).eq("status", "cancelled").gte("booking_date", monthStart)]);
  const todayRows = bToday.data ?? [];
  const monthRows = bMonth.data ?? [];
  const revToday = todayRows.filter((r) => r.status === "confirmed").reduce((s, r) => s + (r.total_price ?? 0), 0);
  const revMonth = monthRows.filter((r) => r.status === "confirmed").reduce((s, r) => s + (r.total_price ?? 0), 0);
  return {
    bookingsToday: todayRows.length,
    revenueToday: revToday,
    revenueMonth: revMonth,
    activeVenues: venues.count ?? 0,
    newUsersWeek: users.count ?? 0,
    cancelMonth: cancels.count ?? 0
  };
});
const adminRevenueSeries_createServerFn_handler = createServerRpc({
  id: "a458638e7fe689022f65315cbc5592625dc8a3ec81d1d2a4f431bae82f72faad",
  name: "adminRevenueSeries",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminRevenueSeries.__executeServer(opts));
const adminRevenueSeries = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  days: numberType().int().min(7).max(365).default(30)
}).parse(i ?? {})).handler(adminRevenueSeries_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context.userId);
  const start = daysAgoISO(data.days - 1);
  const {
    data: rows
  } = await supabaseAdmin.from("bookings").select("booking_date, total_price, status").gte("booking_date", start).eq("status", "confirmed");
  const map = /* @__PURE__ */ new Map();
  for (let i = 0; i < data.days; i++) map.set(daysAgoISO(data.days - 1 - i), 0);
  rows?.forEach((r) => map.set(r.booking_date, (map.get(r.booking_date) ?? 0) + (r.total_price ?? 0)));
  return Array.from(map.entries()).map(([date, revenue]) => ({
    date,
    revenue
  }));
});
const adminBookingsBySport_createServerFn_handler = createServerRpc({
  id: "dbdc71ccaf169500e54adcc176eabf65ccaa22529f9b4708faa626f52954de95",
  name: "adminBookingsBySport",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminBookingsBySport.__executeServer(opts));
const adminBookingsBySport = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminBookingsBySport_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    data
  } = await supabaseAdmin.from("bookings").select("venue:venues(sport:sports(name))");
  const counts = /* @__PURE__ */ new Map();
  (data ?? []).forEach((b) => {
    const name = b.venue?.sport?.name ?? "Unknown";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  });
  return Array.from(counts.entries()).map(([name, count]) => ({
    name,
    count
  }));
});
const adminTopVenues_createServerFn_handler = createServerRpc({
  id: "121a9ea8060825a9ba35224b32025c8b110bdc4e731c096ba8f130b566bfd5f1",
  name: "adminTopVenues",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminTopVenues.__executeServer(opts));
const adminTopVenues = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminTopVenues_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    data
  } = await supabaseAdmin.from("bookings").select("venue_id, total_price, status, venue:venues(name, rating, sport:sports(name))");
  const map = /* @__PURE__ */ new Map();
  (data ?? []).forEach((b) => {
    const k = b.venue_id;
    const cur = map.get(k) ?? {
      name: b.venue?.name ?? "—",
      sport: b.venue?.sport?.name ?? "—",
      rating: Number(b.venue?.rating ?? 0),
      bookings: 0,
      revenue: 0
    };
    cur.bookings += 1;
    if (b.status === "confirmed") cur.revenue += b.total_price ?? 0;
    map.set(k, cur);
  });
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
});
const adminListBookings_createServerFn_handler = createServerRpc({
  id: "c9a9a52b5fc63be3d469bba72091278aa72096a847ce75d9e200e278f3d5cea4",
  name: "adminListBookings",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminListBookings.__executeServer(opts));
const adminListBookings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  limit: numberType().int().min(1).max(100).default(50),
  status: enumType(["all", "confirmed", "cancelled", "pending"]).default("all"),
  sport: stringType().optional()
}).parse(i ?? {})).handler(adminListBookings_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context.userId);
  let q = supabaseAdmin.from("bookings").select("id, booking_date, start_hour, end_hour, total_price, status, user_id, player_count, player_names, venue:venues(name, slug, sport:sports(name, slug))").order("created_at", {
    ascending: false
  }).limit(data.limit);
  if (data.status !== "all") q = q.eq("status", data.status);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  const filtered = data.sport ? (rows ?? []).filter((r) => r.venue?.sport?.slug === data.sport) : rows ?? [];
  const userIds = Array.from(new Set(filtered.map((r) => r.user_id)));
  const {
    data: profiles
  } = await supabaseAdmin.from("profiles").select("id, full_name, email").in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
  const pmap = new Map((profiles ?? []).map((p) => [p.id, p]));
  return filtered.map((r) => ({
    ...r,
    profile: pmap.get(r.user_id) ?? null
  }));
});
const adminCancelBooking_createServerFn_handler = createServerRpc({
  id: "4a945698f50b46db0b9240d971919d39e65dc0bf6c9d5410554d2f42736b7e68",
  name: "adminCancelBooking",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminCancelBooking.__executeServer(opts));
const adminCancelBooking = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(adminCancelBooking_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context.userId);
  const {
    error
  } = await supabaseAdmin.from("bookings").update({
    status: "cancelled"
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const adminListVenues_createServerFn_handler = createServerRpc({
  id: "b9b144f73d121490531cbb0a984ffac09dcf86e9d3d8e9e70040c6648e428a4e",
  name: "adminListVenues",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminListVenues.__executeServer(opts));
const adminListVenues = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminListVenues_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    data,
    error
  } = await supabaseAdmin.from("venues").select("id, name, slug, city, address, price_per_hour, opening_hour, closing_hour, rating, is_active, image_url, sport:sports(name, slug)").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const venueInputSchema = objectType({
  name: stringType().min(2).max(120),
  slug: stringType().min(2).max(120).regex(/^[a-z0-9-]+$/, "lowercase letters, numbers, hyphens only"),
  sport_id: stringType().uuid(),
  city: stringType().min(2).max(80),
  address: stringType().min(2).max(255),
  description: stringType().max(2e3).optional().nullable(),
  image_url: stringType().max(500).optional().nullable().refine((v) => !v || isAllowedImageReference(v), {
    message: "Use an uploaded media path or https URL"
  }),
  price_per_hour: numberType().int().min(0).max(1e6),
  opening_hour: numberType().int().min(0).max(23),
  closing_hour: numberType().int().min(1).max(24),
  is_active: booleanType().default(true)
});
const adminUpsertVenue_createServerFn_handler = createServerRpc({
  id: "246a0a9d09f775d5eb34172c46a18c3d842670e74df0efa91f5e49358f8ce34b",
  name: "adminUpsertVenue",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminUpsertVenue.__executeServer(opts));
const adminUpsertVenue = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid().optional(),
  values: venueInputSchema
}).parse(i)).handler(adminUpsertVenue_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context.userId);
  if (data.id) {
    const {
      error: error2
    } = await supabaseAdmin.from("venues").update(data.values).eq("id", data.id);
    if (error2) throw new Error(error2.message);
    return {
      id: data.id
    };
  }
  const {
    data: row,
    error
  } = await supabaseAdmin.from("venues").insert(data.values).select("id").single();
  if (error) throw new Error(error.message);
  return {
    id: row.id
  };
});
const adminDeleteVenue_createServerFn_handler = createServerRpc({
  id: "5149a7b6223787943e515a7529593293a20cf08be3d28fcea58eab52a3dc536f",
  name: "adminDeleteVenue",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminDeleteVenue.__executeServer(opts));
const adminDeleteVenue = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(adminDeleteVenue_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context.userId);
  const {
    error
  } = await supabaseAdmin.from("venues").update({
    is_active: false
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const adminListSports_createServerFn_handler = createServerRpc({
  id: "d2003c22a53a7a4f6454ba41abead9c98473c8a24cb86310975c9d9175eaf66b",
  name: "adminListSports",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminListSports.__executeServer(opts));
const adminListSports = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminListSports_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    data,
    error
  } = await supabaseAdmin.from("sports").select("*").order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});
const adminUpsertSport_createServerFn_handler = createServerRpc({
  id: "e5b260efea14a64b8b493c0040675e148d4d423d78dcbb176afa8e72673a6315",
  name: "adminUpsertSport",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminUpsertSport.__executeServer(opts));
const adminUpsertSport = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid().optional(),
  values: objectType({
    name: stringType().min(2).max(80),
    slug: stringType().min(2).max(80).regex(/^[a-z0-9-]+$/),
    icon: stringType().max(40).optional().nullable(),
    is_active: booleanType().default(true)
  })
}).parse(i)).handler(adminUpsertSport_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context.userId);
  if (data.id) {
    const {
      error: error2
    } = await supabaseAdmin.from("sports").update(data.values).eq("id", data.id);
    if (error2) throw new Error(error2.message);
    return {
      id: data.id
    };
  }
  const {
    data: row,
    error
  } = await supabaseAdmin.from("sports").insert(data.values).select("id").single();
  if (error) throw new Error(error.message);
  return {
    id: row.id
  };
});
const adminListUsers_createServerFn_handler = createServerRpc({
  id: "35cf6cc28f61c798a570ec39672552de8ed250f60706565e25b34a66f0c5b240",
  name: "adminListUsers",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminListUsers.__executeServer(opts));
const adminListUsers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminListUsers_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    data: profiles,
    error
  } = await supabaseAdmin.from("profiles").select("id, full_name, email, phone, created_at, is_banned").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  const ids = (profiles ?? []).map((p) => p.id);
  const {
    data: bookings
  } = await supabaseAdmin.from("bookings").select("user_id, total_price, status").in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  const stats = /* @__PURE__ */ new Map();
  (bookings ?? []).forEach((b) => {
    const s = stats.get(b.user_id) ?? {
      count: 0,
      spent: 0
    };
    s.count += 1;
    if (b.status === "confirmed") s.spent += b.total_price ?? 0;
    stats.set(b.user_id, s);
  });
  return (profiles ?? []).map((p) => ({
    ...p,
    stats: stats.get(p.id) ?? {
      count: 0,
      spent: 0
    }
  }));
});
const adminBookingsVolume_createServerFn_handler = createServerRpc({
  id: "d46e9d1217410616bafd0f9118ebb4b9ee91b4997ff2e8142eeeb39b3df197c0",
  name: "adminBookingsVolume",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminBookingsVolume.__executeServer(opts));
const adminBookingsVolume = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  days: numberType().int().min(7).max(365).default(30)
}).parse(i ?? {})).handler(adminBookingsVolume_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context.userId);
  const start = daysAgoISO(data.days - 1);
  const {
    data: rows
  } = await supabaseAdmin.from("bookings").select("booking_date").gte("booking_date", start);
  const map = /* @__PURE__ */ new Map();
  for (let i = 0; i < data.days; i++) map.set(daysAgoISO(data.days - 1 - i), 0);
  rows?.forEach((r) => map.set(r.booking_date, (map.get(r.booking_date) ?? 0) + 1));
  return Array.from(map.entries()).map(([date, count]) => ({
    date,
    count
  }));
});
const adminMonthlyRevenue_createServerFn_handler = createServerRpc({
  id: "69ad42758ce566fc7e772f358993afce59091101d6969a2c8dfafab6a3f999b8",
  name: "adminMonthlyRevenue",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminMonthlyRevenue.__executeServer(opts));
const adminMonthlyRevenue = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  year: numberType().int().min(2020).max(2100).default((/* @__PURE__ */ new Date()).getFullYear())
}).parse(i ?? {})).handler(adminMonthlyRevenue_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context.userId);
  const start = `${data.year}-01-01`;
  const end = `${data.year}-12-31`;
  const {
    data: rows
  } = await supabaseAdmin.from("bookings").select("booking_date, total_price, status").gte("booking_date", start).lte("booking_date", end).eq("status", "confirmed");
  const months = Array.from({
    length: 12
  }, (_, i) => ({
    month: i + 1,
    label: new Date(data.year, i).toLocaleString("en", {
      month: "short"
    }),
    revenue: 0
  }));
  rows?.forEach((r) => {
    const m = new Date(r.booking_date).getMonth();
    months[m].revenue += r.total_price ?? 0;
  });
  const best = months.reduce((a, b) => b.revenue > a.revenue ? b : a, months[0]);
  return {
    months,
    bestMonth: best
  };
});
const adminUserGrowth_createServerFn_handler = createServerRpc({
  id: "e3ca80351fab202bac9eb0203bb88edfade3d8c6aa19165c06880b3cc8469350",
  name: "adminUserGrowth",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminUserGrowth.__executeServer(opts));
const adminUserGrowth = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  days: numberType().int().min(30).max(365).default(90)
}).parse(i ?? {})).handler(adminUserGrowth_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context.userId);
  const start = daysAgoISO(data.days);
  const {
    data: rows
  } = await supabaseAdmin.from("profiles").select("created_at").gte("created_at", start + "T00:00:00Z").order("created_at");
  let cumulative = 0;
  const map = /* @__PURE__ */ new Map();
  for (let i = 0; i < data.days; i++) map.set(daysAgoISO(data.days - 1 - i), 0);
  rows?.forEach((r) => {
    const d = r.created_at.slice(0, 10);
    map.set(d, (map.get(d) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([date, signups]) => {
    cumulative += signups;
    return {
      date,
      signups,
      total: cumulative
    };
  });
});
const adminCancellationTrend_createServerFn_handler = createServerRpc({
  id: "98a3e230c9f4d180096935324ce9235c0b9e5b1c8ba6bdaab41575005266b352",
  name: "adminCancellationTrend",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminCancellationTrend.__executeServer(opts));
const adminCancellationTrend = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  days: numberType().int().min(7).max(90).default(30)
}).parse(i ?? {})).handler(adminCancellationTrend_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context.userId);
  const start = daysAgoISO(data.days - 1);
  const {
    data: rows
  } = await supabaseAdmin.from("bookings").select("booking_date, status").gte("booking_date", start);
  const map = /* @__PURE__ */ new Map();
  for (let i = 0; i < data.days; i++) map.set(daysAgoISO(data.days - 1 - i), {
    total: 0,
    cancelled: 0
  });
  rows?.forEach((r) => {
    const cur = map.get(r.booking_date);
    cur.total += 1;
    if (r.status === "cancelled") cur.cancelled += 1;
    map.set(r.booking_date, cur);
  });
  return Array.from(map.entries()).map(([date, v]) => ({
    date,
    rate: v.total ? Math.round(v.cancelled / v.total * 1e3) / 10 : 0
  }));
});
const adminRevenueByVenue_createServerFn_handler = createServerRpc({
  id: "dfd5a08f6f48db85a09a2103fad2bbe434314e8fd3778d0b8eef2850492131d9",
  name: "adminRevenueByVenue",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminRevenueByVenue.__executeServer(opts));
const adminRevenueByVenue = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminRevenueByVenue_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    data
  } = await supabaseAdmin.from("bookings").select("total_price, status, venue:venues(name)").eq("status", "confirmed");
  const map = /* @__PURE__ */ new Map();
  (data ?? []).forEach((b) => {
    const name = b.venue?.name ?? "Unknown";
    map.set(name, (map.get(name) ?? 0) + (b.total_price ?? 0));
  });
  return Array.from(map.entries()).map(([name, revenue]) => ({
    name,
    revenue
  })).sort((a, b) => b.revenue - a.revenue);
});
const adminListPayments_createServerFn_handler = createServerRpc({
  id: "ab1d9b925bf8ae271cad14c587a163d23f2635fccee442b9c9a7b9875b259a8c",
  name: "adminListPayments",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminListPayments.__executeServer(opts));
const adminListPayments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  status: enumType(["all", "success", "cancelled", "pending"]).default("all")
}).parse(i ?? {})).handler(adminListPayments_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context.userId);
  let q = supabaseAdmin.from("bookings").select("id, booking_date, total_price, status, created_at, user_id, venue:venues(name)").order("created_at", {
    ascending: false
  }).limit(100);
  if (data.status !== "all") {
    const map = {
      success: "confirmed",
      cancelled: "cancelled",
      pending: "pending"
    };
    q = q.eq("status", map[data.status]);
  }
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
  const {
    data: profiles
  } = await supabaseAdmin.from("profiles").select("id, full_name, email").in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
  const pmap = new Map((profiles ?? []).map((p) => [p.id, p]));
  return (rows ?? []).map((r) => ({
    id: r.id,
    booking_id: r.id,
    user: pmap.get(r.user_id)?.full_name || pmap.get(r.user_id)?.email || "—",
    venue: r.venue?.name ?? "—",
    amount: r.total_price,
    method: "card",
    status: r.status === "confirmed" ? "success" : r.status,
    date: r.created_at
  }));
});
const adminPaymentsSummary_createServerFn_handler = createServerRpc({
  id: "4185a881f07fa7d0274896eb04b9035566c20950be9e4c1179713a4411201547",
  name: "adminPaymentsSummary",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminPaymentsSummary.__executeServer(opts));
const adminPaymentsSummary = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminPaymentsSummary_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const monthStart = todayISO().slice(0, 7) + "-01";
  const {
    data: rows
  } = await supabaseAdmin.from("bookings").select("total_price, status").gte("booking_date", monthStart);
  let collected = 0;
  let refunded = 0;
  (rows ?? []).forEach((r) => {
    if (r.status === "confirmed") collected += r.total_price ?? 0;
    if (r.status === "cancelled") refunded += r.total_price ?? 0;
  });
  return {
    collected,
    refunded,
    net: collected - refunded
  };
});
const adminGetSettings_createServerFn_handler = createServerRpc({
  id: "6b533370e07b251c5a5dd40ac56f2ab94fcc70285fb22480d29bdd6508c382b9",
  name: "adminGetSettings",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetSettings.__executeServer(opts));
const adminGetSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminGetSettings_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    data,
    error
  } = await supabaseAdmin.from("site_settings").select("key, value").order("key");
  if (error) throw new Error(error.message);
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
});
const adminUpdateSettings_createServerFn_handler = createServerRpc({
  id: "e078a971dab9be475414606cb4b44659a840b7f88ab7bd2113fd0b66f57db84a",
  name: "adminUpdateSettings",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminUpdateSettings.__executeServer(opts));
const adminUpdateSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => recordType(stringType(), stringType()).parse(i)).handler(adminUpdateSettings_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context.userId);
  for (const [key, value] of Object.entries(data)) {
    const {
      error
    } = await supabaseAdmin.from("site_settings").upsert({
      key,
      value,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }, {
      onConflict: "key"
    });
    if (error) throw new Error(error.message);
  }
  return {
    ok: true
  };
});
const adminSendNotification_createServerFn_handler = createServerRpc({
  id: "2ce335996f2b07a5db45e1394010b15094588b453097d464a8e3d8f8b1ac8a00",
  name: "adminSendNotification",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminSendNotification.__executeServer(opts));
const adminSendNotification = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  title: stringType().min(1).max(120),
  message: stringType().min(1).max(2e3),
  target_type: enumType(["all", "sport", "user"]).default("all"),
  channel: enumType(["in-app", "email", "sms"]).default("in-app")
}).parse(i)).handler(adminSendNotification_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context.userId);
  const {
    data: users
  } = await supabaseAdmin.from("profiles").select("id");
  const inserts = (users ?? []).map((u) => ({
    user_id: u.id,
    title: data.title,
    message: data.message,
    type: "offer"
  }));
  if (inserts.length) {
    const {
      error
    } = await supabaseAdmin.from("notifications").insert(inserts);
    if (error) throw new Error(error.message);
  }
  await supabaseAdmin.from("admin_notification_log").insert({
    sent_by: context.userId,
    title: data.title,
    message: data.message,
    target_type: data.target_type,
    channel: data.channel,
    delivery_count: inserts.length
  });
  return {
    ok: true,
    count: inserts.length
  };
});
const adminNotificationLog_createServerFn_handler = createServerRpc({
  id: "fdc4092a839496272208bf37c48a0a5cf776dfc4cc04f1901c0547b0c9d883f8",
  name: "adminNotificationLog",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminNotificationLog.__executeServer(opts));
const adminNotificationLog = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminNotificationLog_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    data,
    error
  } = await supabaseAdmin.from("admin_notification_log").select("*").order("sent_at", {
    ascending: false
  }).limit(30);
  if (error) throw new Error(error.message);
  return data ?? [];
});
const adminRefundPayment_createServerFn_handler = createServerRpc({
  id: "6157dfc2215c04ae826570437f53037d98cc21b44722110bbfe4e7cf92754bdb",
  name: "adminRefundPayment",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminRefundPayment.__executeServer(opts));
const adminRefundPayment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  bookingId: stringType().uuid()
}).parse(i)).handler(adminRefundPayment_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context.userId);
  const {
    data: booking
  } = await supabaseAdmin.from("bookings").select("payment_id, status").eq("id", data.bookingId).maybeSingle();
  if (!booking?.payment_id) throw new Error("No payment linked");
  const {
    data: pay
  } = await supabaseAdmin.from("payments").select("razorpay_payment_id, amount").eq("id", booking.payment_id).maybeSingle();
  if (pay?.razorpay_payment_id) await refundRazorpayPayment(pay.razorpay_payment_id, pay.amount * 100);
  await supabaseAdmin.from("payments").update({
    status: "refunded"
  }).eq("id", booking.payment_id);
  await supabaseAdmin.from("bookings").update({
    status: "cancelled"
  }).eq("id", data.bookingId);
  return {
    ok: true
  };
});
const adminExportAnalyticsCsv_createServerFn_handler = createServerRpc({
  id: "c938e969b14951d8c495a01ac1b675d85c1d65fe731c6ab9b22153f3b4a4880c",
  name: "adminExportAnalyticsCsv",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminExportAnalyticsCsv.__executeServer(opts));
const adminExportAnalyticsCsv = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminExportAnalyticsCsv_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const start = daysAgoISO(29);
  const {
    data: rows
  } = await supabaseAdmin.from("bookings").select("booking_date, total_price, status").gte("booking_date", start).eq("status", "confirmed");
  const map = /* @__PURE__ */ new Map();
  for (let i = 0; i < 30; i++) map.set(daysAgoISO(29 - i), 0);
  rows?.forEach((r) => map.set(r.booking_date, (map.get(r.booking_date) ?? 0) + (r.total_price ?? 0)));
  const csvRows = Array.from(map.entries()).map(([date, revenue]) => ({
    date,
    revenue
  }));
  return {
    csv: toCsv(csvRows),
    filename: `admin-analytics-${todayISO()}.csv`
  };
});
const adminBanUser_createServerFn_handler = createServerRpc({
  id: "3bba96bfc803ffdceb8e317d49ead43f2463bee72ef9463446d363dc12f76f2a",
  name: "adminBanUser",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminBanUser.__executeServer(opts));
const adminBanUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid(),
  banned: booleanType()
}).parse(i)).handler(adminBanUser_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context.userId);
  const {
    error
  } = await supabaseAdmin.from("profiles").update({
    is_banned: data.banned
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  adminBanUser_createServerFn_handler,
  adminBookingsBySport_createServerFn_handler,
  adminBookingsVolume_createServerFn_handler,
  adminCancelBooking_createServerFn_handler,
  adminCancellationTrend_createServerFn_handler,
  adminDeleteVenue_createServerFn_handler,
  adminExportAnalyticsCsv_createServerFn_handler,
  adminGetSettings_createServerFn_handler,
  adminListBookings_createServerFn_handler,
  adminListPayments_createServerFn_handler,
  adminListSports_createServerFn_handler,
  adminListUsers_createServerFn_handler,
  adminListVenues_createServerFn_handler,
  adminMonthlyRevenue_createServerFn_handler,
  adminNotificationLog_createServerFn_handler,
  adminPaymentsSummary_createServerFn_handler,
  adminRefundPayment_createServerFn_handler,
  adminRevenueByVenue_createServerFn_handler,
  adminRevenueSeries_createServerFn_handler,
  adminSendNotification_createServerFn_handler,
  adminSummary_createServerFn_handler,
  adminTopVenues_createServerFn_handler,
  adminUpdateSettings_createServerFn_handler,
  adminUpsertSport_createServerFn_handler,
  adminUpsertVenue_createServerFn_handler,
  adminUserGrowth_createServerFn_handler
};
