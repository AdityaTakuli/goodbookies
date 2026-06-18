import { c as createServerRpc } from "./createServerRpc-Dkjri-iY.js";
import { l as createServerFn } from "./server-kUsPFTeq.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DPQHMA7I.js";
import { s as supabaseAdmin } from "./client.server-CQTuKCic.js";
import { n as normalizeIndianPhone } from "./phone-DJVzxjRj.js";
import { b as createCricketState, a as addCricketBall, u as undoCricketBall, c as computeCricketPlayerStats } from "./cricket-engine-B8C0PNEx.js";
import { o as objectType, s as stringType, b as arrayType, e as enumType, n as numberType } from "./types-DeUvCBv7.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-BlRNeFf7.js";
function createFootballState(gameLengthMinutes) {
  return {
    gameLengthMinutes,
    teamAScore: 0,
    teamBScore: 0,
    elapsedMinute: 0,
    goals: [],
    completed: false
  };
}
function addFootballGoal(state, team, playerId, playerName, minute, type = "goal") {
  const next = structuredClone(state);
  const event = { team, playerId, playerName, minute, type };
  next.goals.push(event);
  if (type === "own_goal") {
    if (team === "a") next.teamBScore += 1;
    else next.teamAScore += 1;
  } else {
    if (team === "a") next.teamAScore += 1;
    else next.teamBScore += 1;
  }
  next.elapsedMinute = Math.max(next.elapsedMinute, minute);
  return next;
}
function setFootballMinute(state, minute) {
  const next = structuredClone(state);
  next.elapsedMinute = Math.min(Math.max(0, minute), next.gameLengthMinutes);
  if (next.elapsedMinute >= next.gameLengthMinutes) next.completed = true;
  return next;
}
function completeFootballMatch(state) {
  return { ...structuredClone(state), completed: true, elapsedMinute: state.gameLengthMinutes };
}
function computeFootballPlayerStats(state, players) {
  const stats = {};
  for (const p of players) stats[p.userId] = { goals: 0, matches: 1 };
  for (const g of state.goals) {
    if (g.type === "goal" && stats[g.playerId]) stats[g.playerId].goals += 1;
  }
  return stats;
}
function mapMatch(row, players) {
  return {
    id: row.id,
    sportSlug: row.sport_slug,
    status: row.status,
    teamAName: row.team_a_name,
    teamBName: row.team_b_name,
    config: row.config ?? {},
    state: row.state ?? {},
    summary: row.summary ?? {},
    matchDate: row.match_date,
    createdBy: row.created_by,
    players: players.map((p) => ({
      id: p.id,
      userId: p.user_id,
      team: p.team,
      displayName: p.display_name,
      username: p.username ?? null
    }))
  };
}
async function loadMatch(matchId) {
  const {
    data: row,
    error
  } = await supabaseAdmin.from("scoring_matches").select("*").eq("id", matchId).maybeSingle();
  if (error || !row) return null;
  const {
    data: players
  } = await supabaseAdmin.from("scoring_match_players").select("*").eq("match_id", matchId);
  return mapMatch(row, players ?? []);
}
async function mergePlayerStats(userId, sport, delta) {
  const {
    data: existing
  } = await supabaseAdmin.from("scoring_player_stats").select("stats").eq("user_id", userId).eq("sport_slug", sport).maybeSingle();
  const prev = existing?.stats ?? {};
  const next = {
    ...prev
  };
  for (const [k, v] of Object.entries(delta)) {
    next[k] = (next[k] ?? 0) + v;
  }
  await supabaseAdmin.from("scoring_player_stats").upsert({
    user_id: userId,
    sport_slug: sport,
    stats: next,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }, {
    onConflict: "user_id,sport_slug"
  });
}
const searchScoringPlayers_createServerFn_handler = createServerRpc({
  id: "d4f992728347aaff760cb95d9ff047db362eb5934c4db0211723ba1ce0098a92",
  name: "searchScoringPlayers",
  filename: "src/lib/scoring/scoring.functions.ts"
}, (opts) => searchScoringPlayers.__executeServer(opts));
const searchScoringPlayers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  q: stringType().min(2).max(80)
}).parse(input)).handler(searchScoringPlayers_createServerFn_handler, async ({
  data,
  context
}) => {
  const q = data.q.trim();
  const digits = q.replace(/\D/g, "");
  let query = supabaseAdmin.from("profiles").select("id, username, full_name, phone, avatar_url").neq("id", context.userId).limit(12);
  if (digits.length >= 6) {
    try {
      const normalized = normalizeIndianPhone(q);
      query = query.or(`phone_normalized.eq.${normalized},phone.ilike.%${digits}%`);
    } catch {
      query = query.or(`phone.ilike.%${digits}%,username.ilike.%${q.toLowerCase()}%`);
    }
  } else {
    query = query.or(`username.ilike.%${q.toLowerCase()}%,full_name.ilike.%${q}%`);
  }
  const {
    data: rows,
    error
  } = await query;
  if (error) throw new Error(error.message);
  return (rows ?? []).map((r) => ({
    id: r.id,
    username: r.username ?? null,
    fullName: r.full_name ?? "Player",
    phone: r.phone ?? null,
    avatarUrl: r.avatar_url ?? null
  }));
});
const listMyScoringMatches_createServerFn_handler = createServerRpc({
  id: "ea5e7c58a6a8b7b488daeeacd17d4d2fcb99f68a5356c0dd02e71ce8a9628798",
  name: "listMyScoringMatches",
  filename: "src/lib/scoring/scoring.functions.ts"
}, (opts) => listMyScoringMatches.__executeServer(opts));
const listMyScoringMatches = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyScoringMatches_createServerFn_handler, async ({
  context
}) => {
  const {
    data: created
  } = await supabaseAdmin.from("scoring_matches").select("*").eq("created_by", context.userId).order("created_at", {
    ascending: false
  }).limit(30);
  const {
    data: joined
  } = await supabaseAdmin.from("scoring_match_players").select("match_id").eq("user_id", context.userId);
  const joinedIds = (joined ?? []).map((j) => j.match_id).filter(Boolean);
  let participated = [];
  if (joinedIds.length) {
    const {
      data
    } = await supabaseAdmin.from("scoring_matches").select("*").in("id", joinedIds).order("created_at", {
      ascending: false
    });
    participated = data ?? [];
  }
  const byId = /* @__PURE__ */ new Map();
  for (const row of [...created ?? [], ...participated]) byId.set(row.id, row);
  const results = [];
  for (const row of byId.values()) {
    const {
      data: players
    } = await supabaseAdmin.from("scoring_match_players").select("*").eq("match_id", row.id);
    results.push(mapMatch(row, players ?? []));
  }
  return results.sort((a, b) => b.matchDate.localeCompare(a.matchDate));
});
const createScoringMatch_createServerFn_handler = createServerRpc({
  id: "fc64a251b27b2c76e7e628ad7269043c51f7a7b6e73b361efbdd649207bda3ad",
  name: "createScoringMatch",
  filename: "src/lib/scoring/scoring.functions.ts"
}, (opts) => createScoringMatch.__executeServer(opts));
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
}).parse(input)).handler(createScoringMatch_createServerFn_handler, async ({
  context,
  data
}) => {
  if (data.players.length < 2) throw new Error("Add at least 2 registered players");
  const creatorInTeam = data.players.some((p) => p.userId === context.userId);
  if (!creatorInTeam) {
    const {
      data: profile
    } = await context.supabase.from("profiles").select("full_name, username").eq("id", context.userId).maybeSingle();
    data.players.push({
      userId: context.userId,
      team: "a",
      displayName: profile?.full_name ?? "You",
      username: profile?.username ?? null
    });
  }
  const config = data.sport === "cricket" ? {
    totalOvers: data.totalOvers ?? 10
  } : {
    gameLengthMinutes: data.gameLengthMinutes ?? 60
  };
  const state = data.sport === "cricket" ? createCricketState(data.totalOvers ?? 10) : createFootballState(data.gameLengthMinutes ?? 60);
  const {
    data: match,
    error
  } = await supabaseAdmin.from("scoring_matches").insert({
    sport_slug: data.sport,
    created_by: context.userId,
    status: "setup",
    team_a_name: data.teamAName,
    team_b_name: data.teamBName,
    config,
    state
  }).select("*").single();
  if (error) throw new Error(error.message);
  const squad = data.players.map((p) => ({
    match_id: match.id,
    user_id: p.userId,
    team: p.team,
    display_name: p.displayName,
    username: p.username ?? null
  }));
  const {
    error: squadErr
  } = await supabaseAdmin.from("scoring_match_players").insert(squad);
  if (squadErr) throw new Error(squadErr.message);
  return mapMatch(match, squad);
});
const startScoringMatch_createServerFn_handler = createServerRpc({
  id: "199d99b89f28b8627adac351b9e0ae9adae72bf084a694f4b470ca1b774e7fd5",
  name: "startScoringMatch",
  filename: "src/lib/scoring/scoring.functions.ts"
}, (opts) => startScoringMatch.__executeServer(opts));
const startScoringMatch = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  matchId: stringType().uuid()
}).parse(input)).handler(startScoringMatch_createServerFn_handler, async ({
  context,
  data
}) => {
  const match = await loadMatch(data.matchId);
  if (!match || match.createdBy !== context.userId) throw new Error("Match not found");
  if (match.status !== "setup") throw new Error("Match already started");
  const {
    data: row,
    error
  } = await supabaseAdmin.from("scoring_matches").update({
    status: "live",
    started_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.matchId).select("*").single();
  if (error) throw new Error(error.message);
  return mapMatch(row, match.players);
});
const getScoringMatch_createServerFn_handler = createServerRpc({
  id: "8d7e80416c8ee14b3f06b89697efb1c6d87e5b6af8ee2e6e642f8fd2f8e0fc6d",
  name: "getScoringMatch",
  filename: "src/lib/scoring/scoring.functions.ts"
}, (opts) => getScoringMatch.__executeServer(opts));
const getScoringMatch = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  matchId: stringType().uuid()
}).parse(input)).handler(getScoringMatch_createServerFn_handler, async ({
  data
}) => {
  const match = await loadMatch(data.matchId);
  if (!match) throw new Error("Match not found");
  return match;
});
const recordCricketBall_createServerFn_handler = createServerRpc({
  id: "07849806fab3dcec307d96148a25aafa4139ead8a708725a85957767138a71d3",
  name: "recordCricketBall",
  filename: "src/lib/scoring/scoring.functions.ts"
}, (opts) => recordCricketBall.__executeServer(opts));
const recordCricketBall = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  matchId: stringType().uuid(),
  outcome: enumType(["0", "1", "2", "3", "4", "6", "wide", "noball", "bye", "legbye", "wicket"]),
  batsmanId: stringType().uuid().optional(),
  bowlerId: stringType().uuid().optional(),
  wicketType: stringType().optional(),
  extraRuns: numberType().int().min(0).max(6).optional()
}).parse(input)).handler(recordCricketBall_createServerFn_handler, async ({
  context,
  data
}) => {
  const match = await loadMatch(data.matchId);
  if (!match || match.createdBy !== context.userId) throw new Error("Not allowed");
  if (match.status !== "live") throw new Error("Match is not live");
  const state = addCricketBall(match.state, data.outcome, {
    batsmanId: data.batsmanId,
    bowlerId: data.bowlerId,
    wicketType: data.wicketType,
    extraRuns: data.extraRuns
  });
  const {
    data: row,
    error
  } = await supabaseAdmin.from("scoring_matches").update({
    state,
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    status: state.completed ? "completed" : "live",
    completed_at: state.completed ? (/* @__PURE__ */ new Date()).toISOString() : null
  }).eq("id", data.matchId).select("*").single();
  if (error) throw new Error(error.message);
  await supabaseAdmin.from("scoring_events").insert({
    match_id: data.matchId,
    sport_slug: "cricket",
    event_type: "ball",
    payload: {
      outcome: data.outcome,
      batsmanId: data.batsmanId,
      bowlerId: data.bowlerId
    },
    seq: (match.state.innings1?.balls?.length ?? 0) + 1,
    created_by: context.userId
  });
  if (state.completed) await finalizeScoringMatch(data.matchId, match, state);
  return mapMatch(row, match.players);
});
const undoScoringCricketBall_createServerFn_handler = createServerRpc({
  id: "bbbc5fe29d8b05faa3c8c1340ad16ec569be9c7ccc7e91b82953cd7db9b0c58f",
  name: "undoScoringCricketBall",
  filename: "src/lib/scoring/scoring.functions.ts"
}, (opts) => undoScoringCricketBall.__executeServer(opts));
const undoScoringCricketBall = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  matchId: stringType().uuid()
}).parse(input)).handler(undoScoringCricketBall_createServerFn_handler, async ({
  context,
  data
}) => {
  const match = await loadMatch(data.matchId);
  if (!match || match.createdBy !== context.userId) throw new Error("Not allowed");
  const state = undoCricketBall(match.state);
  const {
    data: row,
    error
  } = await supabaseAdmin.from("scoring_matches").update({
    state,
    status: "live",
    completed_at: null,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.matchId).select("*").single();
  if (error) throw new Error(error.message);
  return mapMatch(row, match.players);
});
const recordFootballGoal_createServerFn_handler = createServerRpc({
  id: "a03636245814e48e544bbb1a253c8883445412c3422f6eefad299d4dde3dee86",
  name: "recordFootballGoal",
  filename: "src/lib/scoring/scoring.functions.ts"
}, (opts) => recordFootballGoal.__executeServer(opts));
const recordFootballGoal = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  matchId: stringType().uuid(),
  team: enumType(["a", "b"]),
  playerId: stringType().uuid(),
  playerName: stringType().min(1),
  minute: numberType().int().min(0).max(120),
  type: enumType(["goal", "own_goal"]).default("goal")
}).parse(input)).handler(recordFootballGoal_createServerFn_handler, async ({
  context,
  data
}) => {
  const match = await loadMatch(data.matchId);
  if (!match || match.createdBy !== context.userId) throw new Error("Not allowed");
  if (match.status !== "live") throw new Error("Match is not live");
  let state = addFootballGoal(match.state, data.team, data.playerId, data.playerName, data.minute, data.type);
  state = setFootballMinute(state, data.minute);
  const {
    data: row,
    error
  } = await supabaseAdmin.from("scoring_matches").update({
    state,
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    status: state.completed ? "completed" : "live",
    completed_at: state.completed ? (/* @__PURE__ */ new Date()).toISOString() : null
  }).eq("id", data.matchId).select("*").single();
  if (error) throw new Error(error.message);
  if (state.completed) await finalizeScoringMatch(data.matchId, match, state);
  return mapMatch(row, match.players);
});
const completeScoringMatch_createServerFn_handler = createServerRpc({
  id: "a3c9c42544c92a76c03619fc25374b1bf6b62c8c61f221ca08faff1e6c92efcf",
  name: "completeScoringMatch",
  filename: "src/lib/scoring/scoring.functions.ts"
}, (opts) => completeScoringMatch.__executeServer(opts));
const completeScoringMatch = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  matchId: stringType().uuid()
}).parse(input)).handler(completeScoringMatch_createServerFn_handler, async ({
  context,
  data
}) => {
  const match = await loadMatch(data.matchId);
  if (!match || match.createdBy !== context.userId) throw new Error("Not allowed");
  const state = match.sportSlug === "football" ? completeFootballMatch(match.state) : {
    ...match.state,
    completed: true
  };
  const {
    data: row,
    error
  } = await supabaseAdmin.from("scoring_matches").update({
    state,
    status: "completed",
    completed_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.matchId).select("*").single();
  if (error) throw new Error(error.message);
  await finalizeScoringMatch(data.matchId, match, state);
  return mapMatch(row, match.players);
});
async function finalizeScoringMatch(matchId, match, state) {
  const players = match.players.map((p) => ({
    userId: p.userId,
    team: p.team,
    displayName: p.displayName
  }));
  let summary = {};
  if (match.sportSlug === "cricket") {
    const stats = computeCricketPlayerStats(state, players);
    summary = {
      playerStats: stats,
      innings1: state.innings1,
      innings2: state.innings2
    };
    for (const [userId, s] of Object.entries(stats)) {
      await mergePlayerStats(userId, "cricket", {
        matches: 1,
        runs: s.runs,
        wickets: s.wickets,
        fours: s.fours,
        sixes: s.sixes
      });
    }
  } else {
    const fb = state;
    const stats = computeFootballPlayerStats(fb, players);
    summary = {
      playerStats: stats,
      score: {
        a: fb.teamAScore,
        b: fb.teamBScore
      }
    };
    for (const [userId, s] of Object.entries(stats)) {
      await mergePlayerStats(userId, "football", {
        matches: 1,
        goals: s.goals
      });
    }
  }
  await supabaseAdmin.from("scoring_matches").update({
    summary
  }).eq("id", matchId);
}
const getScoringPlayerStats_createServerFn_handler = createServerRpc({
  id: "4e6b74a350e311c211dd046db5f780361c74b09852a5ba9af992ac740aec1e4c",
  name: "getScoringPlayerStats",
  filename: "src/lib/scoring/scoring.functions.ts"
}, (opts) => getScoringPlayerStats.__executeServer(opts));
const getScoringPlayerStats = createServerFn({
  method: "GET"
}).inputValidator((input) => objectType({
  userId: stringType().uuid(),
  sport: enumType(["football", "cricket"]).optional()
}).parse(input)).handler(getScoringPlayerStats_createServerFn_handler, async ({
  data
}) => {
  let q = supabaseAdmin.from("scoring_player_stats").select("sport_slug, stats").eq("user_id", data.userId);
  if (data.sport) q = q.eq("sport_slug", data.sport);
  const {
    data: rows
  } = await q;
  const out = {};
  for (const r of rows ?? []) out[r.sport_slug] = r.stats;
  return out;
});
export {
  completeScoringMatch_createServerFn_handler,
  createScoringMatch_createServerFn_handler,
  getScoringMatch_createServerFn_handler,
  getScoringPlayerStats_createServerFn_handler,
  listMyScoringMatches_createServerFn_handler,
  recordCricketBall_createServerFn_handler,
  recordFootballGoal_createServerFn_handler,
  searchScoringPlayers_createServerFn_handler,
  startScoringMatch_createServerFn_handler,
  undoScoringCricketBall_createServerFn_handler
};
