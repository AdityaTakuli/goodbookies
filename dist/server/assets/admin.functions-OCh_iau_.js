import { l as createSsrRpc } from "./router-D_GlHo_6.js";
import { l as createServerFn } from "./server-Cnaa2j9o.js";
import { d as requireSupabaseAuth, o as objectType, n as numberType, s as stringType, e as enumType, c as booleanType, r as recordType } from "./auth-middleware-BhOaLnug.js";
import { i as isAllowedImageReference } from "./paths-BeoFimim.js";
const adminSummary = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("6ef41fefe1c66f448832c899f30dd530b784c2262114118afbd370eeb4ac323f"));
const adminRevenueSeries = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  days: numberType().int().min(7).max(365).default(30)
}).parse(i ?? {})).handler(createSsrRpc("a458638e7fe689022f65315cbc5592625dc8a3ec81d1d2a4f431bae82f72faad"));
const adminBookingsBySport = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("dbdc71ccaf169500e54adcc176eabf65ccaa22529f9b4708faa626f52954de95"));
const adminTopVenues = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("121a9ea8060825a9ba35224b32025c8b110bdc4e731c096ba8f130b566bfd5f1"));
const adminListBookings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  limit: numberType().int().min(1).max(100).default(50),
  status: enumType(["all", "confirmed", "cancelled", "pending"]).default("all"),
  sport: stringType().optional()
}).parse(i ?? {})).handler(createSsrRpc("c9a9a52b5fc63be3d469bba72091278aa72096a847ce75d9e200e278f3d5cea4"));
const adminCancelBooking = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(createSsrRpc("4a945698f50b46db0b9240d971919d39e65dc0bf6c9d5410554d2f42736b7e68"));
const adminListVenues = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("b9b144f73d121490531cbb0a984ffac09dcf86e9d3d8e9e70040c6648e428a4e"));
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
const adminUpsertVenue = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid().optional(),
  values: venueInputSchema
}).parse(i)).handler(createSsrRpc("246a0a9d09f775d5eb34172c46a18c3d842670e74df0efa91f5e49358f8ce34b"));
const adminDeleteVenue = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(createSsrRpc("5149a7b6223787943e515a7529593293a20cf08be3d28fcea58eab52a3dc536f"));
const adminListSports = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("d2003c22a53a7a4f6454ba41abead9c98473c8a24cb86310975c9d9175eaf66b"));
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
}).parse(i)).handler(createSsrRpc("e5b260efea14a64b8b493c0040675e148d4d423d78dcbb176afa8e72673a6315"));
const adminListUsers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("35cf6cc28f61c798a570ec39672552de8ed250f60706565e25b34a66f0c5b240"));
const adminBookingsVolume = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  days: numberType().int().min(7).max(365).default(30)
}).parse(i ?? {})).handler(createSsrRpc("d46e9d1217410616bafd0f9118ebb4b9ee91b4997ff2e8142eeeb39b3df197c0"));
const adminMonthlyRevenue = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  year: numberType().int().min(2020).max(2100).default((/* @__PURE__ */ new Date()).getFullYear())
}).parse(i ?? {})).handler(createSsrRpc("69ad42758ce566fc7e772f358993afce59091101d6969a2c8dfafab6a3f999b8"));
const adminUserGrowth = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  days: numberType().int().min(30).max(365).default(90)
}).parse(i ?? {})).handler(createSsrRpc("e3ca80351fab202bac9eb0203bb88edfade3d8c6aa19165c06880b3cc8469350"));
const adminCancellationTrend = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  days: numberType().int().min(7).max(90).default(30)
}).parse(i ?? {})).handler(createSsrRpc("98a3e230c9f4d180096935324ce9235c0b9e5b1c8ba6bdaab41575005266b352"));
const adminRevenueByVenue = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("dfd5a08f6f48db85a09a2103fad2bbe434314e8fd3778d0b8eef2850492131d9"));
const adminListPayments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  status: enumType(["all", "success", "cancelled", "pending"]).default("all")
}).parse(i ?? {})).handler(createSsrRpc("ab1d9b925bf8ae271cad14c587a163d23f2635fccee442b9c9a7b9875b259a8c"));
const adminPaymentsSummary = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("4185a881f07fa7d0274896eb04b9035566c20950be9e4c1179713a4411201547"));
const adminGetSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("6b533370e07b251c5a5dd40ac56f2ab94fcc70285fb22480d29bdd6508c382b9"));
const adminUpdateSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => recordType(stringType(), stringType()).parse(i)).handler(createSsrRpc("e078a971dab9be475414606cb4b44659a840b7f88ab7bd2113fd0b66f57db84a"));
const adminSendNotification = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  title: stringType().min(1).max(120),
  message: stringType().min(1).max(2e3),
  target_type: enumType(["all", "sport", "user"]).default("all"),
  channel: enumType(["in-app", "email", "sms"]).default("in-app")
}).parse(i)).handler(createSsrRpc("2ce335996f2b07a5db45e1394010b15094588b453097d464a8e3d8f8b1ac8a00"));
const adminNotificationLog = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("fdc4092a839496272208bf37c48a0a5cf776dfc4cc04f1901c0547b0c9d883f8"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  bookingId: stringType().uuid()
}).parse(i)).handler(createSsrRpc("6157dfc2215c04ae826570437f53037d98cc21b44722110bbfe4e7cf92754bdb"));
const adminExportAnalyticsCsv = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("c938e969b14951d8c495a01ac1b675d85c1d65fe731c6ab9b22153f3b4a4880c"));
const adminBanUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid(),
  banned: booleanType()
}).parse(i)).handler(createSsrRpc("3bba96bfc803ffdceb8e317d49ead43f2463bee72ef9463446d363dc12f76f2a"));
export {
  adminBanUser as a,
  adminBookingsBySport as b,
  adminBookingsVolume as c,
  adminCancelBooking as d,
  adminCancellationTrend as e,
  adminDeleteVenue as f,
  adminExportAnalyticsCsv as g,
  adminGetSettings as h,
  adminListBookings as i,
  adminListPayments as j,
  adminListSports as k,
  adminListUsers as l,
  adminListVenues as m,
  adminMonthlyRevenue as n,
  adminNotificationLog as o,
  adminPaymentsSummary as p,
  adminRevenueByVenue as q,
  adminRevenueSeries as r,
  adminSendNotification as s,
  adminSummary as t,
  adminTopVenues as u,
  adminUpdateSettings as v,
  adminUpsertSport as w,
  adminUpsertVenue as x,
  adminUserGrowth as y
};
