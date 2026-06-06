import { l as createSsrRpc } from "./router-CTX0SWVZ.js";
import { l as createServerFn } from "./server-DhhSyQbI.js";
import { d as requireSupabaseAuth, o as objectType, s as stringType } from "./auth-middleware-DMywVex_.js";
const getMyProfile = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("7137c45c66e2762097026ceecb6dd952f95d83288f96d03621061209a6008b8a"));
const updateMyProfile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  full_name: stringType().min(2).max(120).optional(),
  phone: stringType().max(20).optional()
}).parse(i)).handler(createSsrRpc("a9a93b35b4fca3d47286ae52b9b8e588b5785c8c5eb7ec53518c1d73941bb2b9"));
const cancelMyBooking = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(createSsrRpc("6cbddeb7e11591da000d994a17d572bffc49d765e5edfeeccfd5a7738a03d586"));
const listMyNotifications = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("80b0a4bbf573cf3966716cdc655a6487e49dd8182e44f1e876aa9f10f89f24c4"));
const markNotificationsRead = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("c87ea2d8ea7b5701200fb3d9a67d099edd07cf7c7c4e6d40f22e6d358e6f4a86"));
const listMyPayments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("9ee81fa046072effef2d37d3ae6bc0a5386ef421025b04ada2cd0c62eba58694"));
export {
  listMyPayments as a,
  cancelMyBooking as c,
  getMyProfile as g,
  listMyNotifications as l,
  markNotificationsRead as m,
  updateMyProfile as u
};
