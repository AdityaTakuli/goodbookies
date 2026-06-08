import { l as createSsrRpc } from "./router-B-HLs4zM.js";
import { l as createServerFn } from "./server-BB13nDRL.js";
import { r as requireSupabaseAuth } from "./auth-middleware-5muUp2Nu.js";
import { i as isAllowedImageReference } from "./paths-BeoFimim.js";
import { o as objectType, n as numberType, s as stringType, e as enumType, c as booleanType, b as arrayType, a as anyType } from "./types-DeUvCBv7.js";
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
const registerOwner = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  name: stringType().min(2).max(120),
  email: stringType().email(),
  phone: stringType().min(10).max(15),
  password: stringType().min(8).max(72),
  business_name: stringType().max(120).optional(),
  city: stringType().min(2).max(80)
}).parse(i)).handler(createSsrRpc("2cb06ef96d716c256227af563752d5880b03112faacc08bb745ebc59ab35921a"));
const getOwnerStatus = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("cf544636187fc988f5d6a284e3f5322e49d2ed8d3b2a254d2103192a15e47dd7"));
const ownerSummary = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("8d1309036a77b2ae6f4c94d7257a5acc849837f137a564497b3e3bf302b5afeb"));
const ownerRevenueSeries = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  days: numberType().int().min(7).max(90).default(30)
}).parse(i ?? {})).handler(createSsrRpc("117e856707ddd5e3fa4a60b300994c9ebaf2ceceae4af9abe7ccf268f663f021"));
const ownerBookingsVolume = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  days: numberType().int().min(7).max(90).default(30)
}).parse(i ?? {})).handler(createSsrRpc("0a4e519d874aad274890bb32072cd938cbf62f63ee4489ee1340e3fa5a9069e4"));
const ownerPeakHours = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  venueId: stringType().uuid().optional()
}).parse(i ?? {})).handler(createSsrRpc("e9b3835b58aa9b054b6418be4b5b2de396b70f772d9dbbb4da77b9a1403e6a91"));
const ownerListVenues = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("abe44f6c0672bb113c7b4ee3aef6da7a4842dad279c337a7449783e3c14d1de7"));
const ownerUpsertVenue = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid().optional(),
  values: venueSchema
}).parse(i)).handler(createSsrRpc("b126f66d084ba162acbb9e33005dedea4451bd456385d19e95de5aa07749aba6"));
const ownerDeleteVenue = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(createSsrRpc("aa3ce454c53abbee4e751f13d9bc86051888f55c9c28ffc7202979e67f67ed7d"));
const ownerListSlots = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  venueId: stringType().uuid(),
  month: stringType().regex(/^\d{4}-\d{2}$/)
}).parse(i)).handler(createSsrRpc("b7530b165fc7873aa3eb3cd0520e7e4afe82048d23ee9cb8e52a642036477ce9"));
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
}).parse(i)).handler(createSsrRpc("53f5118ac7924a5a6a496f3386a82bc0c029c4d8cde8d6174e62e07847644f4c"));
const ownerUnblockSlot = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid(),
  venueId: stringType().uuid()
}).parse(i)).handler(createSsrRpc("69e2ebd524df003fdeb86c4af83e841dce91fbe322f1f43452a4f76055449320"));
const ownerGetPricing = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  venueId: stringType().uuid()
}).parse(i)).handler(createSsrRpc("bcbd20ae16bef03c472875eec43b683566ba207637675d6b872cfd43014ccbd7"));
const ownerSavePeakPricing = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  venueId: stringType().uuid(),
  rules: arrayType(anyType())
}).parse(i)).handler(createSsrRpc("a24cbcbab342cba3958559ec9958bd76d188c2449dea8adc0f1ea0013920c44c"));
const ownerSaveDayPricing = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  venueId: stringType().uuid(),
  rules: arrayType(objectType({
    day_of_week: numberType(),
    price_override: numberType()
  }))
}).parse(i)).handler(createSsrRpc("f1c6b97216bdea5ff9559abfcbce739fb26bc956f0212742c8bfc96b81bdde3f"));
const ownerAddDatePricing = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  venueId: stringType().uuid(),
  date: stringType(),
  price_override: numberType().int().min(0)
}).parse(i)).handler(createSsrRpc("63129899c7373563dbf8f825dc440c2d6ed9ba77f413e1be65d8bef65baed0d8"));
const ownerSaveDurationDiscounts = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  venueId: stringType().uuid(),
  rules: arrayType(objectType({
    min_hours: numberType(),
    discount_percent: numberType()
  }))
}).parse(i)).handler(createSsrRpc("37636103b84a648fd3247edf27dec05bc8bf35c2cebca500df4b667cfc3009c5"));
const ownerListCoupons = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("d13f97afd2670f1576506bc651107158b43d778cd8963ea3fc0419153b28baab"));
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
}).parse(i)).handler(createSsrRpc("fd3436e44911c8b72546ddfc0d40375cdf4a239723aadf40ff71388d0b84c86c"));
const ownerDeleteCoupon = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(createSsrRpc("e1af5226e7aece69bde5721b0fc9e72528b2c6272e1d819c6581f8928668a8d3"));
const ownerListBookings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  status: enumType(["all", "confirmed", "cancelled", "pending"]).default("all"),
  venueId: stringType().uuid().optional()
}).parse(i ?? {})).handler(createSsrRpc("5180592779454dd921e43e656065b4a9dff1f785790979772265d43bd7265a80"));
const ownerConfirmBooking = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(createSsrRpc("feb60e4f9f52944e41c96d29e7bb73052f2497d5d6e3c00f9953f6bb3eb61e49"));
const ownerRejectBooking = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(createSsrRpc("0ff447337385f7522ba58b2b3e49330911ef514b08d3ebd5460e0c1d59ab0737"));
const ownerGetPayouts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("3d9c2798d7c6097b451d9f79fe6988ca76eeec9c849feb29d148415e0f63507f"));
const ownerSavePayoutDetails = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  account_holder_name: stringType().min(2),
  account_number: stringType().min(8),
  ifsc_code: stringType().min(8),
  bank_name: stringType().optional()
}).parse(i)).handler(createSsrRpc("3fd93392f18749f7ff390ffa7915f14b0f0c660019794664fbcb84a10a1aa64e"));
const ownerUpdateProfile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  name: stringType().optional(),
  phone: stringType().optional(),
  business_name: stringType().optional()
}).parse(i)).handler(createSsrRpc("8b3043cebd5065f02577f8cd63e1a5895a4ac65e632d3190b38880bb791105c8"));
const ownerExportAnalyticsCsv = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("335ed4d79bb8d3b453798d1c1f83002bab247c6bbd1dd634479a9b79264dbdb8"));
const adminListOwnerRequests = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("544de65ab25ef37823feaa360c503161fa9652fbb879bac81f64edd25cd3fdc8"));
const adminReviewOwnerRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid(),
  action: enumType(["approve", "reject"]),
  reason: stringType().optional()
}).parse(i)).handler(createSsrRpc("1ed73261f21ecd97913c41f0b9c8820738f03b2bc846c1db8484810e9b0b81bd"));
const adminListVenueApprovals = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("19976818765c238133340e9dd1751506c6c4f0dd80817332882c6e5f4ac7431a"));
const adminReviewVenue = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid(),
  action: enumType(["approve", "reject"]),
  reason: stringType().optional()
}).parse(i)).handler(createSsrRpc("a38ad06f5d96d3a73ed40e7682c4a2079de5b1b4c5f6309771e7dd48aeaf51e8"));
const adminListOwners = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("06bb53ab2d1db753cdacfea38ae8762648ac319b63049417ef7b1735596971b8"));
const adminUpdateOwner = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid(),
  status: enumType(["approved", "suspended", "rejected"]).optional(),
  platform_commission_override: numberType().nullable().optional()
}).parse(i)).handler(createSsrRpc("4429266d5eb1ba2f548da37f7fda35137a229c1abd367a47f0512920f1998aa7"));
export {
  ownerSavePeakPricing as A,
  ownerSummary as B,
  ownerUnblockSlot as C,
  ownerUpdateProfile as D,
  ownerUpsertCoupon as E,
  ownerUpsertVenue as F,
  registerOwner as G,
  adminListOwnerRequests as a,
  adminListOwners as b,
  adminListVenueApprovals as c,
  adminReviewOwnerRequest as d,
  adminReviewVenue as e,
  adminUpdateOwner as f,
  getOwnerStatus as g,
  ownerBlockSlot as h,
  ownerBookingsVolume as i,
  ownerConfirmBooking as j,
  ownerDeleteCoupon as k,
  ownerDeleteVenue as l,
  ownerExportAnalyticsCsv as m,
  ownerGetPayouts as n,
  ownerAddDatePricing as o,
  ownerGetPricing as p,
  ownerListBookings as q,
  ownerListCoupons as r,
  ownerListSlots as s,
  ownerListVenues as t,
  ownerPeakHours as u,
  ownerRejectBooking as v,
  ownerRevenueSeries as w,
  ownerSaveDayPricing as x,
  ownerSaveDurationDiscounts as y,
  ownerSavePayoutDetails as z
};
