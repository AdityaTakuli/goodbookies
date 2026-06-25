import { c as createSsrRpc } from "./urls-uO1kTBh4.js";
import { l as createServerFn } from "./server-Cad_iNdE.js";
import { r as requireSupabaseAuth } from "./auth-middleware-CmzxxATK.js";
import { o as objectType, s as stringType, b as arrayType, n as numberType } from "./types-DeUvCBv7.js";
const listOpenLobbies = createServerFn({
  method: "GET"
}).inputValidator((input) => objectType({
  sport: stringType().optional(),
  date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
}).parse(input ?? {})).handler(createSsrRpc("935e9ed4bf288633bf020f86bbde98f9dde5828686a2587dc16ebf5ab725d993"));
const submitLobbyQuery = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  bookingId: stringType().uuid(),
  playerCount: numberType().int().min(1).max(100),
  playerNames: arrayType(stringType().trim().min(1).max(60))
}).refine((v) => v.playerNames.length === v.playerCount, {
  message: "Provide one name per player"
}).parse(input)).handler(createSsrRpc("293ee13157740e5d3f3f624e5c4ac8d387bd5856c402f1b5ea71d90185017737"));
const acceptLobbyQuery = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  queryId: stringType().uuid()
}).parse(input)).handler(createSsrRpc("6fcdff62938a004312bca1ede1ff796eecd88da10b0236c7a673c2cbcb38ef13"));
const declineLobbyQuery = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  queryId: stringType().uuid()
}).parse(input)).handler(createSsrRpc("37147384698a6c99370205aa64e0c96d7429d007ec90015b7093842ba93fba71"));
const listPendingQueriesForHost = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("b08b1b66039be2767405aaeae095c73cd59f6f1e2ba961592d4fc442ba67d348"));
const listMyLobbyQueries = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("21958eddd19d201430455822fd30e5165ec95b250ccfd6bfb812746bcf794ec9"));
export {
  acceptLobbyQuery as a,
  listOpenLobbies as b,
  listPendingQueriesForHost as c,
  declineLobbyQuery as d,
  listMyLobbyQueries as l,
  submitLobbyQuery as s
};
