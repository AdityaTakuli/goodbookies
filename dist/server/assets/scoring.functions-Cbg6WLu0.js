import { c as createSsrRpc } from "./urls-BavgGbyt.js";
import { l as createServerFn } from "./server-smmP3SnT.js";
import { r as requireSupabaseAuth } from "./auth-middleware-mpWMl7qI.js";
import { s as supabaseAdmin } from "./client.server-CQTuKCic.js";
import { o as objectType, s as stringType, b as arrayType, e as enumType, n as numberType } from "./types-DeUvCBv7.js";
const searchScoringPlayers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  q: stringType().min(2).max(80)
}).parse(input)).handler(createSsrRpc("d4f992728347aaff760cb95d9ff047db362eb5934c4db0211723ba1ce0098a92"));
const listMyScoringMatches = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("ea5e7c58a6a8b7b488daeeacd17d4d2fcb99f68a5356c0dd02e71ce8a9628798"));
const createScoringMatch = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  sport: enumType(["cricket", "football"]),
  teamAName: stringType().min(1).max(60),
  teamBName: stringType().min(1).max(60),
  totalOvers: numberType().int().min(1).max(50).optional(),
  gameLengthMinutes: numberType().int().min(10).max(120).optional(),
  players: arrayType(objectType({
    userId: stringType().uuid(),
    team: enumType(["a", "b"]),
    displayName: stringType().min(1).max(80),
    username: stringType().optional().nullable()
  }))
}).parse(input)).handler(createSsrRpc("fc64a251b27b2c76e7e628ad7269043c51f7a7b6e73b361efbdd649207bda3ad"));
const startScoringMatch = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  matchId: stringType().uuid()
}).parse(input)).handler(createSsrRpc("199d99b89f28b8627adac351b9e0ae9adae72bf084a694f4b470ca1b774e7fd5"));
const getScoringMatch = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  matchId: stringType().uuid()
}).parse(input)).handler(createSsrRpc("8d7e80416c8ee14b3f06b89697efb1c6d87e5b6af8ee2e6e642f8fd2f8e0fc6d"));
const recordCricketBall = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  matchId: stringType().uuid(),
  outcome: enumType(["0", "1", "2", "3", "4", "6", "wide", "noball", "bye", "legbye", "wicket"]),
  batsmanId: stringType().uuid().optional(),
  bowlerId: stringType().uuid().optional(),
  wicketType: stringType().optional(),
  extraRuns: numberType().int().min(0).max(6).optional()
}).parse(input)).handler(createSsrRpc("07849806fab3dcec307d96148a25aafa4139ead8a708725a85957767138a71d3"));
const undoScoringCricketBall = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  matchId: stringType().uuid()
}).parse(input)).handler(createSsrRpc("bbbc5fe29d8b05faa3c8c1340ad16ec569be9c7ccc7e91b82953cd7db9b0c58f"));
const recordFootballGoal = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  matchId: stringType().uuid(),
  team: enumType(["a", "b"]),
  playerId: stringType().uuid(),
  playerName: stringType().min(1),
  minute: numberType().int().min(0).max(120),
  type: enumType(["goal", "own_goal"]).default("goal")
}).parse(input)).handler(createSsrRpc("a03636245814e48e544bbb1a253c8883445412c3422f6eefad299d4dde3dee86"));
const completeScoringMatch = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  matchId: stringType().uuid()
}).parse(input)).handler(createSsrRpc("a3c9c42544c92a76c03619fc25374b1bf6b62c8c61f221ca08faff1e6c92efcf"));
createServerFn({
  method: "GET"
}).inputValidator((input) => objectType({
  userId: stringType().uuid(),
  sport: enumType(["football", "cricket"]).optional()
}).parse(input)).handler(createSsrRpc("4e6b74a350e311c211dd046db5f780361c74b09852a5ba9af992ac740aec1e4c"));
async function listScoringHistoryForUser(userId, sport) {
  const {
    data: squad
  } = await supabaseAdmin.from("scoring_match_players").select("match_id, team, display_name").eq("user_id", userId);
  if (!squad?.length) return [];
  const matchIds = squad.map((s) => s.match_id);
  let mq = supabaseAdmin.from("scoring_matches").select("*").in("id", matchIds).eq("status", "completed").order("match_date", {
    ascending: false
  }).limit(20);
  const {
    data: matches
  } = await mq;
  const rows = [];
  for (const m of matches ?? []) {
    const mySquad = squad.find((s) => s.match_id === m.id);
    if (!mySquad) continue;
    const myTeam = mySquad.team;
    const state = m.state;
    let myScore = 0;
    let oppScore = 0;
    if (m.sport_slug === "cricket") {
      const inn1 = state.innings1;
      const inn2 = state.innings2;
      const aRuns = (inn1?.battingTeam === "a" ? inn1.score : 0) + (inn2?.battingTeam === "a" ? inn2?.score ?? 0 : 0);
      const bRuns = (inn1?.battingTeam === "b" ? inn1.score : 0) + (inn2?.battingTeam === "b" ? inn2?.score ?? 0 : 0);
      myScore = myTeam === "a" ? aRuns : bRuns;
      oppScore = myTeam === "a" ? bRuns : aRuns;
    } else {
      myScore = myTeam === "a" ? Number(state.teamAScore ?? 0) : Number(state.teamBScore ?? 0);
      oppScore = myTeam === "a" ? Number(state.teamBScore ?? 0) : Number(state.teamAScore ?? 0);
    }
    rows.push({
      id: m.id,
      sportSlug: m.sport_slug,
      matchDate: m.match_date,
      teamName: myTeam === "a" ? m.team_a_name : m.team_b_name,
      teamIcon: m.sport_slug === "cricket" ? "🏏" : "⚽",
      playerScore: myScore,
      opponentName: myTeam === "a" ? m.team_b_name : m.team_a_name,
      opponentIcon: "🔴",
      opponentScore: oppScore,
      source: "scoring"
    });
  }
  return rows;
}
export {
  createScoringMatch as a,
  listScoringHistoryForUser as b,
  completeScoringMatch as c,
  recordFootballGoal as d,
  startScoringMatch as e,
  getScoringMatch as g,
  listMyScoringMatches as l,
  recordCricketBall as r,
  searchScoringPlayers as s,
  undoScoringCricketBall as u
};
