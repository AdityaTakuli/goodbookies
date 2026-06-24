import { c as createServerRpc } from "./createServerRpc-BLY4jruu.js";
import { l as createServerFn } from "./server-CAJvkpA7.js";
import { c as createClient } from "./index-BlRNeFf7.js";
import { r as requireSupabaseAuth } from "./auth-middleware-BtFbOegV.js";
import { s as supabaseAdmin } from "./client.server-CQTuKCic.js";
import { i as isAllowedImageReference } from "./paths-DJaPhCuO.js";
import { t as toCsv } from "./export-BP4E1wVQ.js";
import { r as refundRazorpayPayment } from "./razorpay-DwVM9bks.js";
import { a as assertPhoneAvailable } from "./phone.server-D66YsfzL.js";
import { o as objectType, c as booleanType, s as stringType, e as enumType, n as numberType, b as arrayType, a as anyType } from "./types-DeUvCBv7.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "node:crypto";
import "./phone-DJVzxjRj.js";
async function sendEmail(opts) {
  const apiKey = process.env.RESEND_API_KEY ?? process.env.SENDGRID_API_KEY;
  const from = process.env.EMAIL_FROM ?? "noreply@goodbookies.com";
  if (!apiKey) {
    console.info("[email stub]", { to: opts.to, subject: opts.subject });
    return { ok: true, stub: true };
  }
  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html })
    });
    if (!res.ok) throw new Error(await res.text());
    return { ok: true };
  }
  console.info("[email stub — no provider]", opts.to, opts.subject);
  return { ok: true, stub: true };
}
async function assertAdmin(userId) {
  const {
    data
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden: admin role required");
}
async function assertApprovedOwner(userId) {
  const {
    data
  } = await supabaseAdmin.from("owners").select("id, status").eq("id", userId).maybeSingle();
  if (!data || data.status !== "approved") throw new Error("Forbidden: approved owner required");
  return data;
}
async function assertOwnerVenue(userId, venueId) {
  await assertApprovedOwner(userId);
  const {
    data
  } = await supabaseAdmin.from("venues").select("id, owner_id").eq("id", venueId).maybeSingle();
  if (!data || data.owner_id !== userId) throw new Error("Forbidden: not your venue");
  return data;
}
function todayISO() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function daysAgoISO(n) {
  const d = /* @__PURE__ */ new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
const venueSchema = objectType({
  name: stringType().min(2).max(120),
  slug: stringType().min(2).max(120).regex(/^[a-z0-9-]+$/),
  sport_id: stringType().uuid(),
  city: stringType().min(2).max(80),
  address: stringType().min(2).max(255),
  description: stringType().max(2e3).optional().nullable(),
  image_url: stringType().max(500).optional().nullable().refine((v) => !v || isAllowedImageReference(v), {
    message: "Use an uploaded media path or https URL"
  }),
  price_per_hour: numberType().int().min(0),
  opening_hour: numberType().int().min(0).max(23),
  closing_hour: numberType().int().min(1).max(24),
  slot_duration_minutes: numberType().int().min(30).max(240).default(60),
  max_players_allowed: numberType().int().min(1).max(100).default(10),
  venue_type: stringType().optional(),
  state: stringType().optional().nullable(),
  pin_code: stringType().optional().nullable(),
  amenities: arrayType(stringType()).optional(),
  operating_days: arrayType(numberType().int().min(0).max(6)).optional(),
  advance_booking_days: numberType().int().min(1).max(365).optional(),
  confirmation_mode: enumType(["instant", "manual"]).optional(),
  cancellation_policy: stringType().max(2e3).optional().nullable(),
  is_active: booleanType().optional()
});
const registerOwner_createServerFn_handler = createServerRpc({
  id: "2cb06ef96d716c256227af563752d5880b03112faacc08bb745ebc59ab35921a",
  name: "registerOwner",
  filename: "src/lib/owner.functions.ts"
}, (opts) => registerOwner.__executeServer(opts));
const registerOwner = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  name: stringType().min(2).max(120),
  email: stringType().email(),
  phone: stringType().min(10).max(15),
  password: stringType().min(8).max(72),
  business_name: stringType().max(120).optional(),
  city: stringType().min(2).max(80)
}).parse(i)).handler(registerOwner_createServerFn_handler, async ({
  data
}) => {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const supabaseAnon = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const linkPartnerToUser = async (userId, phone) => {
    const {
      data: existingOwner
    } = await supabaseAdmin.from("owners").select("id").eq("id", userId).maybeSingle();
    if (existingOwner) throw new Error("This account already has partner access.");
    const {
      error: ownerErr
    } = await supabaseAdmin.from("owners").insert({
      id: userId,
      name: data.name,
      email: data.email,
      phone,
      business_name: data.business_name ?? null,
      city: data.city,
      status: "approved",
      approved_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (ownerErr) throw new Error(ownerErr.message);
    await supabaseAdmin.from("profiles").update({
      account_type: "both",
      full_name: data.name,
      phone,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", userId);
    await supabaseAdmin.from("user_roles").upsert({
      user_id: userId,
      role: "user"
    }, {
      onConflict: "user_id,role"
    });
    const {
      error: roleErr
    } = await supabaseAdmin.from("user_roles").upsert({
      user_id: userId,
      role: "owner"
    }, {
      onConflict: "user_id,role"
    });
    if (roleErr) throw new Error(roleErr.message);
  };
  const {
    data: existingProfile
  } = await supabaseAdmin.from("profiles").select("id, account_type").eq("email", data.email).maybeSingle();
  if (existingProfile) {
    const normalizedPhone2 = await assertPhoneAvailable(data.phone, existingProfile.id);
    if (!supabaseUrl || !supabaseAnon) throw new Error("Server auth not configured");
    const verifyClient = createClient(supabaseUrl, supabaseAnon, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    const {
      error: pwErr
    } = await verifyClient.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });
    if (pwErr) {
      throw new Error("This email already has a player account. Log in first, or enter the correct password to add partner access.");
    }
    await linkPartnerToUser(existingProfile.id, normalizedPhone2);
    return {
      ok: true,
      message: "Partner access linked to your existing account. Log in to use both My Account and Partner."
    };
  }
  const normalizedPhone = await assertPhoneAvailable(data.phone);
  const {
    data: authUser,
    error: authErr
  } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      full_name: data.name,
      phone: normalizedPhone,
      account_type: "both"
    }
  });
  if (authErr) throw new Error(authErr.message);
  await supabaseAdmin.from("profiles").update({
    account_type: "both"
  }).eq("id", authUser.user.id);
  await linkPartnerToUser(authUser.user.id, normalizedPhone);
  return {
    ok: true,
    message: "Partner account created. You can book turfs and manage venues with the same login."
  };
});
const getOwnerStatus_createServerFn_handler = createServerRpc({
  id: "cf544636187fc988f5d6a284e3f5322e49d2ed8d3b2a254d2103192a15e47dd7",
  name: "getOwnerStatus",
  filename: "src/lib/owner.functions.ts"
}, (opts) => getOwnerStatus.__executeServer(opts));
const getOwnerStatus = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getOwnerStatus_createServerFn_handler, async ({
  context
}) => {
  const {
    data
  } = await supabaseAdmin.from("owners").select("id, status, rejection_reason, business_name, city, name, email, phone").eq("id", context.userId).maybeSingle();
  return data;
});
const ownerSummary_createServerFn_handler = createServerRpc({
  id: "8d1309036a77b2ae6f4c94d7257a5acc849837f137a564497b3e3bf302b5afeb",
  name: "ownerSummary",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerSummary.__executeServer(opts));
const ownerSummary = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(ownerSummary_createServerFn_handler, async ({
  context
}) => {
  await assertApprovedOwner(context.userId);
  const today = todayISO();
  const monthStart = today.slice(0, 7) + "-01";
  const {
    data: venueIds
  } = await supabaseAdmin.from("venues").select("id").eq("owner_id", context.userId);
  const ids = (venueIds ?? []).map((v) => v.id);
  if (!ids.length) {
    return {
      bookingsToday: 0,
      revenueToday: 0,
      revenueMonth: 0,
      activeVenues: 0,
      pendingBookings: 0,
      cancelMonth: 0
    };
  }
  const [bToday, bMonth, venues, pending, cancels] = await Promise.all([supabaseAdmin.from("bookings").select("total_price, status").in("venue_id", ids).eq("booking_date", today), supabaseAdmin.from("bookings").select("total_price, status").in("venue_id", ids).gte("booking_date", monthStart), supabaseAdmin.from("venues").select("id", {
    count: "exact",
    head: true
  }).eq("owner_id", context.userId).eq("is_active", true).eq("approval_status", "approved"), supabaseAdmin.from("bookings").select("id", {
    count: "exact",
    head: true
  }).in("venue_id", ids).eq("status", "pending"), supabaseAdmin.from("bookings").select("id", {
    count: "exact",
    head: true
  }).in("venue_id", ids).eq("status", "cancelled").gte("booking_date", monthStart)]);
  const todayRows = bToday.data ?? [];
  const monthRows = bMonth.data ?? [];
  return {
    bookingsToday: todayRows.length,
    revenueToday: todayRows.filter((r) => r.status === "confirmed").reduce((s, r) => s + (r.total_price ?? 0), 0),
    revenueMonth: monthRows.filter((r) => r.status === "confirmed").reduce((s, r) => s + (r.total_price ?? 0), 0),
    activeVenues: venues.count ?? 0,
    pendingBookings: pending.count ?? 0,
    cancelMonth: cancels.count ?? 0
  };
});
const ownerRevenueSeries_createServerFn_handler = createServerRpc({
  id: "117e856707ddd5e3fa4a60b300994c9ebaf2ceceae4af9abe7ccf268f663f021",
  name: "ownerRevenueSeries",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerRevenueSeries.__executeServer(opts));
const ownerRevenueSeries = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  days: numberType().int().min(7).max(90).default(30)
}).parse(i ?? {})).handler(ownerRevenueSeries_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertApprovedOwner(context.userId);
  const {
    data: venues
  } = await supabaseAdmin.from("venues").select("id").eq("owner_id", context.userId);
  const ids = (venues ?? []).map((v) => v.id);
  const start = daysAgoISO(data.days - 1);
  const map = /* @__PURE__ */ new Map();
  for (let i = 0; i < data.days; i++) map.set(daysAgoISO(data.days - 1 - i), 0);
  if (ids.length) {
    const {
      data: rows
    } = await supabaseAdmin.from("bookings").select("booking_date, total_price, status").in("venue_id", ids).gte("booking_date", start).eq("status", "confirmed");
    rows?.forEach((r) => map.set(r.booking_date, (map.get(r.booking_date) ?? 0) + (r.total_price ?? 0)));
  }
  return Array.from(map.entries()).map(([date, revenue]) => ({
    date,
    revenue
  }));
});
const ownerBookingsVolume_createServerFn_handler = createServerRpc({
  id: "0a4e519d874aad274890bb32072cd938cbf62f63ee4489ee1340e3fa5a9069e4",
  name: "ownerBookingsVolume",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerBookingsVolume.__executeServer(opts));
const ownerBookingsVolume = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  days: numberType().int().min(7).max(90).default(30)
}).parse(i ?? {})).handler(ownerBookingsVolume_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertApprovedOwner(context.userId);
  const {
    data: venues
  } = await supabaseAdmin.from("venues").select("id").eq("owner_id", context.userId);
  const ids = (venues ?? []).map((v) => v.id);
  const start = daysAgoISO(data.days - 1);
  const map = /* @__PURE__ */ new Map();
  for (let i = 0; i < data.days; i++) map.set(daysAgoISO(data.days - 1 - i), 0);
  if (ids.length) {
    const {
      data: rows
    } = await supabaseAdmin.from("bookings").select("booking_date").in("venue_id", ids).gte("booking_date", start);
    rows?.forEach((r) => map.set(r.booking_date, (map.get(r.booking_date) ?? 0) + 1));
  }
  return Array.from(map.entries()).map(([date, count]) => ({
    date,
    count
  }));
});
const ownerPeakHours_createServerFn_handler = createServerRpc({
  id: "e9b3835b58aa9b054b6418be4b5b2de396b70f772d9dbbb4da77b9a1403e6a91",
  name: "ownerPeakHours",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerPeakHours.__executeServer(opts));
const ownerPeakHours = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  venueId: stringType().uuid().optional()
}).parse(i ?? {})).handler(ownerPeakHours_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertApprovedOwner(context.userId);
  let q = supabaseAdmin.from("venues").select("id").eq("owner_id", context.userId);
  if (data.venueId) q = q.eq("id", data.venueId);
  const {
    data: venues
  } = await q;
  const ids = (venues ?? []).map((v) => v.id);
  const grid = [];
  for (let day = 0; day < 7; day++) for (let hour = 6; hour < 23; hour++) grid.push({
    day,
    hour,
    count: 0
  });
  if (!ids.length) return grid;
  const {
    data: bookings
  } = await supabaseAdmin.from("bookings").select("booking_date, start_hour, end_hour").in("venue_id", ids).eq("status", "confirmed");
  bookings?.forEach((b) => {
    const dow = (/* @__PURE__ */ new Date(b.booking_date + "T12:00:00")).getDay();
    for (let h = b.start_hour; h < b.end_hour; h++) {
      const cell = grid.find((g) => g.day === dow && g.hour === h);
      if (cell) cell.count += 1;
    }
  });
  return grid;
});
const ownerListVenues_createServerFn_handler = createServerRpc({
  id: "abe44f6c0672bb113c7b4ee3aef6da7a4842dad279c337a7449783e3c14d1de7",
  name: "ownerListVenues",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerListVenues.__executeServer(opts));
const ownerListVenues = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(ownerListVenues_createServerFn_handler, async ({
  context
}) => {
  await assertApprovedOwner(context.userId);
  const {
    data,
    error
  } = await supabaseAdmin.from("venues").select("*, sport:sports(name, slug, icon)").eq("owner_id", context.userId).order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const ownerUpsertVenue_createServerFn_handler = createServerRpc({
  id: "b126f66d084ba162acbb9e33005dedea4451bd456385d19e95de5aa07749aba6",
  name: "ownerUpsertVenue",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerUpsertVenue.__executeServer(opts));
const ownerUpsertVenue = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid().optional(),
  values: venueSchema
}).parse(i)).handler(ownerUpsertVenue_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertApprovedOwner(context.userId);
  const payload = {
    ...data.values,
    owner_id: context.userId,
    approval_status: "approved",
    is_active: data.values.is_active ?? true,
    rejection_reason: null
  };
  if (data.id) {
    await assertOwnerVenue(context.userId, data.id);
    const {
      error: error2
    } = await supabaseAdmin.from("venues").update(payload).eq("id", data.id);
    if (error2) throw new Error(error2.message);
    return {
      id: data.id
    };
  }
  const {
    data: row,
    error
  } = await supabaseAdmin.from("venues").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return {
    id: row.id
  };
});
const ownerDeleteVenue_createServerFn_handler = createServerRpc({
  id: "aa3ce454c53abbee4e751f13d9bc86051888f55c9c28ffc7202979e67f67ed7d",
  name: "ownerDeleteVenue",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerDeleteVenue.__executeServer(opts));
const ownerDeleteVenue = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(ownerDeleteVenue_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertOwnerVenue(context.userId, data.id);
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
const ownerListSlots_createServerFn_handler = createServerRpc({
  id: "b7530b165fc7873aa3eb3cd0520e7e4afe82048d23ee9cb8e52a642036477ce9",
  name: "ownerListSlots",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerListSlots.__executeServer(opts));
const ownerListSlots = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  venueId: stringType().uuid(),
  month: stringType().regex(/^\d{4}-\d{2}$/)
}).parse(i)).handler(ownerListSlots_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertOwnerVenue(context.userId, data.venueId);
  const start = `${data.month}-01`;
  const endMonth = data.month.split("-");
  const lastDay = new Date(Number(endMonth[0]), Number(endMonth[1]), 0).getDate();
  const end = `${data.month}-${String(lastDay).padStart(2, "0")}`;
  const [{
    data: bookings
  }, {
    data: blocks
  }] = await Promise.all([supabaseAdmin.from("bookings").select("booking_date, start_hour, end_hour, status").eq("venue_id", data.venueId).gte("booking_date", start).lte("booking_date", end), supabaseAdmin.from("slot_blocks").select("*").eq("venue_id", data.venueId)]);
  return {
    bookings: bookings ?? [],
    blocks: blocks ?? []
  };
});
const ownerBlockSlot_createServerFn_handler = createServerRpc({
  id: "53f5118ac7924a5a6a496f3386a82bc0c029c4d8cde8d6174e62e07847644f4c",
  name: "ownerBlockSlot",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerBlockSlot.__executeServer(opts));
const ownerBlockSlot = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  venueId: stringType().uuid(),
  date: stringType().optional(),
  startTime: stringType(),
  endTime: stringType(),
  reason: stringType().max(200).optional(),
  isRecurring: booleanType().optional(),
  recurrenceDay: numberType().int().min(0).max(6).optional()
}).parse(i)).handler(ownerBlockSlot_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertOwnerVenue(context.userId, data.venueId);
  const {
    error
  } = await supabaseAdmin.from("slot_blocks").insert({
    venue_id: data.venueId,
    block_date: data.date ?? null,
    start_time: data.startTime,
    end_time: data.endTime,
    reason: data.reason ?? null,
    is_recurring: data.isRecurring ?? false,
    recurrence_day: data.recurrenceDay ?? null,
    created_by_owner_id: context.userId
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const ownerUnblockSlot_createServerFn_handler = createServerRpc({
  id: "69e2ebd524df003fdeb86c4af83e841dce91fbe322f1f43452a4f76055449320",
  name: "ownerUnblockSlot",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerUnblockSlot.__executeServer(opts));
const ownerUnblockSlot = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid(),
  venueId: stringType().uuid()
}).parse(i)).handler(ownerUnblockSlot_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertOwnerVenue(context.userId, data.venueId);
  const {
    error
  } = await supabaseAdmin.from("slot_blocks").delete().eq("id", data.id).eq("venue_id", data.venueId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const ownerGetPricing_createServerFn_handler = createServerRpc({
  id: "bcbd20ae16bef03c472875eec43b683566ba207637675d6b872cfd43014ccbd7",
  name: "ownerGetPricing",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerGetPricing.__executeServer(opts));
const ownerGetPricing = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  venueId: stringType().uuid()
}).parse(i)).handler(ownerGetPricing_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertOwnerVenue(context.userId, data.venueId);
  const [peak, day, date, duration] = await Promise.all([supabaseAdmin.from("venue_peak_pricing").select("*").eq("venue_id", data.venueId), supabaseAdmin.from("venue_day_pricing").select("*").eq("venue_id", data.venueId), supabaseAdmin.from("venue_date_pricing").select("*").eq("venue_id", data.venueId).order("date"), supabaseAdmin.from("venue_duration_discounts").select("*").eq("venue_id", data.venueId).order("min_hours")]);
  return {
    peak: peak.data ?? [],
    day: day.data ?? [],
    date: date.data ?? [],
    duration: duration.data ?? []
  };
});
const ownerSavePeakPricing_createServerFn_handler = createServerRpc({
  id: "a24cbcbab342cba3958559ec9958bd76d188c2449dea8adc0f1ea0013920c44c",
  name: "ownerSavePeakPricing",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerSavePeakPricing.__executeServer(opts));
const ownerSavePeakPricing = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  venueId: stringType().uuid(),
  rules: arrayType(anyType())
}).parse(i)).handler(ownerSavePeakPricing_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertOwnerVenue(context.userId, data.venueId);
  await supabaseAdmin.from("venue_peak_pricing").delete().eq("venue_id", data.venueId);
  if (data.rules.length) {
    const rows = data.rules.map((r) => ({
      venue_id: data.venueId,
      day_of_week: r.day_of_week ?? null,
      start_time: r.start_time,
      end_time: r.end_time,
      surcharge_type: r.surcharge_type ?? "percent",
      surcharge_value: r.surcharge_value ?? 0
    }));
    const {
      error
    } = await supabaseAdmin.from("venue_peak_pricing").insert(rows);
    if (error) throw new Error(error.message);
  }
  return {
    ok: true
  };
});
const ownerSaveDayPricing_createServerFn_handler = createServerRpc({
  id: "f1c6b97216bdea5ff9559abfcbce739fb26bc956f0212742c8bfc96b81bdde3f",
  name: "ownerSaveDayPricing",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerSaveDayPricing.__executeServer(opts));
const ownerSaveDayPricing = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  venueId: stringType().uuid(),
  rules: arrayType(objectType({
    day_of_week: numberType(),
    price_override: numberType()
  }))
}).parse(i)).handler(ownerSaveDayPricing_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertOwnerVenue(context.userId, data.venueId);
  await supabaseAdmin.from("venue_day_pricing").delete().eq("venue_id", data.venueId);
  if (data.rules.length) {
    const {
      error
    } = await supabaseAdmin.from("venue_day_pricing").insert(data.rules.map((r) => ({
      venue_id: data.venueId,
      ...r
    })));
    if (error) throw new Error(error.message);
  }
  return {
    ok: true
  };
});
const ownerAddDatePricing_createServerFn_handler = createServerRpc({
  id: "63129899c7373563dbf8f825dc440c2d6ed9ba77f413e1be65d8bef65baed0d8",
  name: "ownerAddDatePricing",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerAddDatePricing.__executeServer(opts));
const ownerAddDatePricing = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  venueId: stringType().uuid(),
  date: stringType(),
  price_override: numberType().int().min(0)
}).parse(i)).handler(ownerAddDatePricing_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertOwnerVenue(context.userId, data.venueId);
  const {
    error
  } = await supabaseAdmin.from("venue_date_pricing").upsert({
    venue_id: data.venueId,
    date: data.date,
    price_override: data.price_override
  }, {
    onConflict: "venue_id,date"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const ownerSaveDurationDiscounts_createServerFn_handler = createServerRpc({
  id: "37636103b84a648fd3247edf27dec05bc8bf35c2cebca500df4b667cfc3009c5",
  name: "ownerSaveDurationDiscounts",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerSaveDurationDiscounts.__executeServer(opts));
const ownerSaveDurationDiscounts = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  venueId: stringType().uuid(),
  rules: arrayType(objectType({
    min_hours: numberType(),
    discount_percent: numberType()
  }))
}).parse(i)).handler(ownerSaveDurationDiscounts_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertOwnerVenue(context.userId, data.venueId);
  await supabaseAdmin.from("venue_duration_discounts").delete().eq("venue_id", data.venueId);
  if (data.rules.length) {
    const {
      error
    } = await supabaseAdmin.from("venue_duration_discounts").insert(data.rules.map((r) => ({
      venue_id: data.venueId,
      ...r
    })));
    if (error) throw new Error(error.message);
  }
  return {
    ok: true
  };
});
const ownerListCoupons_createServerFn_handler = createServerRpc({
  id: "d13f97afd2670f1576506bc651107158b43d778cd8963ea3fc0419153b28baab",
  name: "ownerListCoupons",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerListCoupons.__executeServer(opts));
const ownerListCoupons = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(ownerListCoupons_createServerFn_handler, async ({
  context
}) => {
  await assertApprovedOwner(context.userId);
  const {
    data,
    error
  } = await supabaseAdmin.from("coupons").select("*").eq("owner_id", context.userId).order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const ownerUpsertCoupon_createServerFn_handler = createServerRpc({
  id: "fd3436e44911c8b72546ddfc0d40375cdf4a239723aadf40ff71388d0b84c86c",
  name: "ownerUpsertCoupon",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerUpsertCoupon.__executeServer(opts));
const ownerUpsertCoupon = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid().optional(),
  values: objectType({
    code: stringType().min(3).max(20),
    discount_type: enumType(["flat", "percent"]),
    discount_value: numberType().min(0),
    min_booking_amount: numberType().int().min(0).default(0),
    max_uses: numberType().int().optional().nullable(),
    expiry_date: stringType().optional().nullable(),
    venue_id: stringType().uuid().optional().nullable(),
    is_active: booleanType().default(true)
  })
}).parse(i)).handler(ownerUpsertCoupon_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertApprovedOwner(context.userId);
  const row = {
    owner_id: context.userId,
    ...data.values,
    code: data.values.code.toUpperCase()
  };
  if (data.id) {
    const {
      error: error2
    } = await supabaseAdmin.from("coupons").update(row).eq("id", data.id).eq("owner_id", context.userId);
    if (error2) throw new Error(error2.message);
    return {
      id: data.id
    };
  }
  const {
    data: inserted,
    error
  } = await supabaseAdmin.from("coupons").insert(row).select("id").single();
  if (error) throw new Error(error.message);
  return {
    id: inserted.id
  };
});
const ownerDeleteCoupon_createServerFn_handler = createServerRpc({
  id: "e1af5226e7aece69bde5721b0fc9e72528b2c6272e1d819c6581f8928668a8d3",
  name: "ownerDeleteCoupon",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerDeleteCoupon.__executeServer(opts));
const ownerDeleteCoupon = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(ownerDeleteCoupon_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertApprovedOwner(context.userId);
  const {
    error
  } = await supabaseAdmin.from("coupons").delete().eq("id", data.id).eq("owner_id", context.userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const ownerListBookings_createServerFn_handler = createServerRpc({
  id: "5180592779454dd921e43e656065b4a9dff1f785790979772265d43bd7265a80",
  name: "ownerListBookings",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerListBookings.__executeServer(opts));
const ownerListBookings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  status: enumType(["all", "confirmed", "cancelled", "pending"]).default("all"),
  venueId: stringType().uuid().optional()
}).parse(i ?? {})).handler(ownerListBookings_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertApprovedOwner(context.userId);
  const {
    data: venues
  } = await supabaseAdmin.from("venues").select("id, name").eq("owner_id", context.userId);
  const ids = (venues ?? []).map((v) => v.id);
  if (!ids.length) return [];
  let q = supabaseAdmin.from("bookings").select("*, venue:venues(name, slug)").in("venue_id", data.venueId ? [data.venueId] : ids).order("created_at", {
    ascending: false
  }).limit(100);
  if (data.status !== "all") q = q.eq("status", data.status);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
  const {
    data: profiles
  } = await supabaseAdmin.from("profiles").select("id, full_name, email, phone").in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
  const pmap = new Map((profiles ?? []).map((p) => [p.id, p]));
  return (rows ?? []).map((r) => ({
    ...r,
    profile: pmap.get(r.user_id)
  }));
});
const ownerConfirmBooking_createServerFn_handler = createServerRpc({
  id: "feb60e4f9f52944e41c96d29e7bb73052f2497d5d6e3c00f9953f6bb3eb61e49",
  name: "ownerConfirmBooking",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerConfirmBooking.__executeServer(opts));
const ownerConfirmBooking = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(ownerConfirmBooking_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: b
  } = await supabaseAdmin.from("bookings").select("venue_id, user_id").eq("id", data.id).maybeSingle();
  if (!b) throw new Error("Not found");
  await assertOwnerVenue(context.userId, b.venue_id);
  await supabaseAdmin.from("bookings").update({
    status: "confirmed"
  }).eq("id", data.id);
  await supabaseAdmin.from("notifications").insert({
    user_id: b.user_id,
    title: "Booking confirmed",
    message: "Your booking was confirmed by the venue.",
    type: "booking"
  });
  return {
    ok: true
  };
});
const ownerRejectBooking_createServerFn_handler = createServerRpc({
  id: "0ff447337385f7522ba58b2b3e49330911ef514b08d3ebd5460e0c1d59ab0737",
  name: "ownerRejectBooking",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerRejectBooking.__executeServer(opts));
const ownerRejectBooking = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(ownerRejectBooking_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: b
  } = await supabaseAdmin.from("bookings").select("venue_id, user_id, payment_id").eq("id", data.id).maybeSingle();
  if (!b) throw new Error("Not found");
  await assertOwnerVenue(context.userId, b.venue_id);
  await supabaseAdmin.from("bookings").update({
    status: "cancelled"
  }).eq("id", data.id);
  if (b.payment_id) {
    const {
      data: pay
    } = await supabaseAdmin.from("payments").select("razorpay_payment_id").eq("id", b.payment_id).maybeSingle();
    if (pay?.razorpay_payment_id) await refundRazorpayPayment(pay.razorpay_payment_id);
    await supabaseAdmin.from("payments").update({
      status: "refunded"
    }).eq("id", b.payment_id);
  }
  return {
    ok: true
  };
});
const ownerGetPayouts_createServerFn_handler = createServerRpc({
  id: "3d9c2798d7c6097b451d9f79fe6988ca76eeec9c849feb29d148415e0f63507f",
  name: "ownerGetPayouts",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerGetPayouts.__executeServer(opts));
const ownerGetPayouts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(ownerGetPayouts_createServerFn_handler, async ({
  context
}) => {
  await assertApprovedOwner(context.userId);
  const {
    data: settings
  } = await supabaseAdmin.from("site_settings").select("value").eq("key", "platform_commission_rate").maybeSingle();
  const {
    data: owner
  } = await supabaseAdmin.from("owners").select("platform_commission_override").eq("id", context.userId).maybeSingle();
  const rate = Number(owner?.platform_commission_override ?? settings?.value ?? 10);
  const {
    data: venues
  } = await supabaseAdmin.from("venues").select("id").eq("owner_id", context.userId);
  const ids = (venues ?? []).map((v) => v.id);
  let lifetime = 0;
  if (ids.length) {
    const {
      data: bookings
    } = await supabaseAdmin.from("bookings").select("total_price").in("venue_id", ids).eq("status", "confirmed");
    lifetime = (bookings ?? []).reduce((s, b) => s + (b.total_price ?? 0), 0);
  }
  const commission = Math.round(lifetime * (rate / 100));
  const {
    data: payouts
  } = await supabaseAdmin.from("payouts").select("*").eq("owner_id", context.userId).order("created_at", {
    ascending: false
  });
  const paid = (payouts ?? []).filter((p) => p.status === "paid").reduce((s, p) => s + p.net_amount, 0);
  const {
    data: bank
  } = await supabaseAdmin.from("owner_payout_details").select("*").eq("owner_id", context.userId).maybeSingle();
  return {
    commissionRate: rate,
    lifetimeEarned: lifetime,
    commissionDeducted: commission,
    netEarned: lifetime - commission,
    pendingPayout: lifetime - commission - paid,
    lastPayout: payouts?.[0] ?? null,
    payouts: payouts ?? [],
    bank: bank ?? null
  };
});
const ownerSavePayoutDetails_createServerFn_handler = createServerRpc({
  id: "3fd93392f18749f7ff390ffa7915f14b0f0c660019794664fbcb84a10a1aa64e",
  name: "ownerSavePayoutDetails",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerSavePayoutDetails.__executeServer(opts));
const ownerSavePayoutDetails = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  account_holder_name: stringType().min(2),
  account_number: stringType().min(8),
  ifsc_code: stringType().min(8),
  bank_name: stringType().optional()
}).parse(i)).handler(ownerSavePayoutDetails_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertApprovedOwner(context.userId);
  const {
    error
  } = await supabaseAdmin.from("owner_payout_details").upsert({
    owner_id: context.userId,
    ...data,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }, {
    onConflict: "owner_id"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const ownerUpdateProfile_createServerFn_handler = createServerRpc({
  id: "8b3043cebd5065f02577f8cd63e1a5895a4ac65e632d3190b38880bb791105c8",
  name: "ownerUpdateProfile",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerUpdateProfile.__executeServer(opts));
const ownerUpdateProfile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  name: stringType().optional(),
  phone: stringType().optional(),
  business_name: stringType().optional()
}).parse(i)).handler(ownerUpdateProfile_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertApprovedOwner(context.userId);
  const {
    error
  } = await supabaseAdmin.from("owners").update(data).eq("id", context.userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const ownerExportAnalyticsCsv_createServerFn_handler = createServerRpc({
  id: "335ed4d79bb8d3b453798d1c1f83002bab247c6bbd1dd634479a9b79264dbdb8",
  name: "ownerExportAnalyticsCsv",
  filename: "src/lib/owner.functions.ts"
}, (opts) => ownerExportAnalyticsCsv.__executeServer(opts));
const ownerExportAnalyticsCsv = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(ownerExportAnalyticsCsv_createServerFn_handler, async ({
  context
}) => {
  await assertApprovedOwner(context.userId);
  const {
    data: venues
  } = await supabaseAdmin.from("venues").select("id").eq("owner_id", context.userId);
  const ids = (venues ?? []).map((v) => v.id);
  const start = daysAgoISO(29);
  const map = /* @__PURE__ */ new Map();
  for (let i = 0; i < 30; i++) map.set(daysAgoISO(29 - i), 0);
  if (ids.length) {
    const {
      data: rows
    } = await supabaseAdmin.from("bookings").select("booking_date, total_price, status").in("venue_id", ids).gte("booking_date", start).eq("status", "confirmed");
    rows?.forEach((r) => map.set(r.booking_date, (map.get(r.booking_date) ?? 0) + (r.total_price ?? 0)));
  }
  const csvRows = Array.from(map.entries()).map(([date, revenue]) => ({
    date,
    revenue
  }));
  return {
    csv: toCsv(csvRows),
    filename: `owner-analytics-${todayISO()}.csv`
  };
});
const adminListOwnerRequests_createServerFn_handler = createServerRpc({
  id: "544de65ab25ef37823feaa360c503161fa9652fbb879bac81f64edd25cd3fdc8",
  name: "adminListOwnerRequests",
  filename: "src/lib/owner.functions.ts"
}, (opts) => adminListOwnerRequests.__executeServer(opts));
const adminListOwnerRequests = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminListOwnerRequests_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    data,
    error
  } = await supabaseAdmin.from("owners").select("*").eq("status", "pending").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const adminReviewOwnerRequest_createServerFn_handler = createServerRpc({
  id: "1ed73261f21ecd97913c41f0b9c8820738f03b2bc846c1db8484810e9b0b81bd",
  name: "adminReviewOwnerRequest",
  filename: "src/lib/owner.functions.ts"
}, (opts) => adminReviewOwnerRequest.__executeServer(opts));
const adminReviewOwnerRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid(),
  action: enumType(["approve", "reject"]),
  reason: stringType().optional()
}).parse(i)).handler(adminReviewOwnerRequest_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context.userId);
  const {
    data: owner
  } = await supabaseAdmin.from("owners").select("email, name").eq("id", data.id).maybeSingle();
  const status = data.action === "approve" ? "approved" : "rejected";
  await supabaseAdmin.from("owners").update({
    status,
    rejection_reason: data.action === "reject" ? data.reason ?? "Not approved" : null,
    approved_at: data.action === "approve" ? (/* @__PURE__ */ new Date()).toISOString() : null,
    approved_by: data.action === "approve" ? context.userId : null
  }).eq("id", data.id);
  if (data.action === "approve") {
    await supabaseAdmin.from("user_roles").upsert({
      user_id: data.id,
      role: "owner"
    }, {
      onConflict: "user_id,role"
    });
  }
  if (owner?.email) {
    await sendEmail({
      to: owner.email,
      subject: data.action === "approve" ? "Good Bookies | Partner approved" : "Good Bookies | Application update",
      html: data.action === "approve" ? `<p>Hi ${owner.name},</p><p>Your venue partner account is approved. <a href="${process.env.APP_URL ?? ""}/owner/login">Log in to your dashboard</a>.</p>` : `<p>Hi ${owner.name},</p><p>Your application was not approved. ${data.reason ?? ""}</p>`
    });
  }
  return {
    ok: true
  };
});
const adminListVenueApprovals_createServerFn_handler = createServerRpc({
  id: "19976818765c238133340e9dd1751506c6c4f0dd80817332882c6e5f4ac7431a",
  name: "adminListVenueApprovals",
  filename: "src/lib/owner.functions.ts"
}, (opts) => adminListVenueApprovals.__executeServer(opts));
const adminListVenueApprovals = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminListVenueApprovals_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    data,
    error
  } = await supabaseAdmin.from("venues").select("*, sport:sports(name), owner:owners(name, email)").eq("approval_status", "pending").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const adminReviewVenue_createServerFn_handler = createServerRpc({
  id: "a38ad06f5d96d3a73ed40e7682c4a2079de5b1b4c5f6309771e7dd48aeaf51e8",
  name: "adminReviewVenue",
  filename: "src/lib/owner.functions.ts"
}, (opts) => adminReviewVenue.__executeServer(opts));
const adminReviewVenue = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid(),
  action: enumType(["approve", "reject"]),
  reason: stringType().optional()
}).parse(i)).handler(adminReviewVenue_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context.userId);
  const patch = data.action === "approve" ? {
    approval_status: "approved",
    is_active: true,
    rejection_reason: null
  } : {
    approval_status: "rejected",
    is_active: false,
    rejection_reason: data.reason ?? "Not approved"
  };
  const {
    error
  } = await supabaseAdmin.from("venues").update(patch).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const adminListOwners_createServerFn_handler = createServerRpc({
  id: "06bb53ab2d1db753cdacfea38ae8762648ac319b63049417ef7b1735596971b8",
  name: "adminListOwners",
  filename: "src/lib/owner.functions.ts"
}, (opts) => adminListOwners.__executeServer(opts));
const adminListOwners = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminListOwners_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    data,
    error
  } = await supabaseAdmin.from("owners").select("*").neq("status", "pending").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  const owners = data ?? [];
  const ids = owners.map((o) => o.id);
  const {
    data: venueCounts
  } = await supabaseAdmin.from("venues").select("owner_id").in("owner_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  const counts = /* @__PURE__ */ new Map();
  (venueCounts ?? []).forEach((v) => counts.set(v.owner_id, (counts.get(v.owner_id) ?? 0) + 1));
  return owners.map((o) => ({
    ...o,
    venueCount: counts.get(o.id) ?? 0
  }));
});
const adminUpdateOwner_createServerFn_handler = createServerRpc({
  id: "4429266d5eb1ba2f548da37f7fda35137a229c1abd367a47f0512920f1998aa7",
  name: "adminUpdateOwner",
  filename: "src/lib/owner.functions.ts"
}, (opts) => adminUpdateOwner.__executeServer(opts));
const adminUpdateOwner = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid(),
  status: enumType(["approved", "suspended", "rejected"]).optional(),
  platform_commission_override: numberType().nullable().optional()
}).parse(i)).handler(adminUpdateOwner_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context.userId);
  const patch = {};
  if (data.status) patch.status = data.status;
  if (data.platform_commission_override !== void 0) patch.platform_commission_override = data.platform_commission_override;
  const {
    error
  } = await supabaseAdmin.from("owners").update(patch).eq("id", data.id);
  if (error) throw new Error(error.message);
  if (data.status === "suspended") {
    await supabaseAdmin.from("venues").update({
      is_active: false
    }).eq("owner_id", data.id);
  }
  return {
    ok: true
  };
});
export {
  adminListOwnerRequests_createServerFn_handler,
  adminListOwners_createServerFn_handler,
  adminListVenueApprovals_createServerFn_handler,
  adminReviewOwnerRequest_createServerFn_handler,
  adminReviewVenue_createServerFn_handler,
  adminUpdateOwner_createServerFn_handler,
  getOwnerStatus_createServerFn_handler,
  ownerAddDatePricing_createServerFn_handler,
  ownerBlockSlot_createServerFn_handler,
  ownerBookingsVolume_createServerFn_handler,
  ownerConfirmBooking_createServerFn_handler,
  ownerDeleteCoupon_createServerFn_handler,
  ownerDeleteVenue_createServerFn_handler,
  ownerExportAnalyticsCsv_createServerFn_handler,
  ownerGetPayouts_createServerFn_handler,
  ownerGetPricing_createServerFn_handler,
  ownerListBookings_createServerFn_handler,
  ownerListCoupons_createServerFn_handler,
  ownerListSlots_createServerFn_handler,
  ownerListVenues_createServerFn_handler,
  ownerPeakHours_createServerFn_handler,
  ownerRejectBooking_createServerFn_handler,
  ownerRevenueSeries_createServerFn_handler,
  ownerSaveDayPricing_createServerFn_handler,
  ownerSaveDurationDiscounts_createServerFn_handler,
  ownerSavePayoutDetails_createServerFn_handler,
  ownerSavePeakPricing_createServerFn_handler,
  ownerSummary_createServerFn_handler,
  ownerUnblockSlot_createServerFn_handler,
  ownerUpdateProfile_createServerFn_handler,
  ownerUpsertCoupon_createServerFn_handler,
  ownerUpsertVenue_createServerFn_handler,
  registerOwner_createServerFn_handler
};
