import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizeIndianPhone } from "@/lib/phone";
import {
  addCricketBall,
  computeCricketPlayerStats,
  createCricketState,
  undoCricketBall,
} from "./cricket-engine";
import {
  addFootballGoal,
  completeFootballMatch,
  computeFootballPlayerStats,
  createFootballState,
  setFootballMinute,
} from "./football-engine";
import type { CricketBallOutcome, ScoringHistoryRow, ScoringMatchRow, ScoringSportSlug } from "./types";
import type { CricketState, FootballState } from "./types";

function mapMatch(row: Record<string, unknown>, players: Record<string, unknown>[]): ScoringMatchRow {
  return {
    id: row.id as string,
    sportSlug: row.sport_slug as ScoringSportSlug,
    status: row.status as ScoringMatchRow["status"],
    teamAName: row.team_a_name as string,
    teamBName: row.team_b_name as string,
    config: (row.config as Record<string, unknown>) ?? {},
    state: (row.state as Record<string, unknown>) ?? {},
    summary: (row.summary as Record<string, unknown>) ?? {},
    matchDate: row.match_date as string,
    createdBy: row.created_by as string,
    players: players.map((p) => ({
      id: p.id as string,
      userId: p.user_id as string,
      team: p.team as "a" | "b",
      displayName: p.display_name as string,
      username: (p.username as string) ?? null,
    })),
  };
}

async function loadMatch(matchId: string): Promise<ScoringMatchRow | null> {
  const { data: row, error } = await supabaseAdmin
    .from("scoring_matches")
    .select("*")
    .eq("id", matchId)
    .maybeSingle();
  if (error || !row) return null;
  const { data: players } = await supabaseAdmin
    .from("scoring_match_players")
    .select("*")
    .eq("match_id", matchId);
  return mapMatch(row, players ?? []);
}

async function mergePlayerStats(
  userId: string,
  sport: ScoringSportSlug,
  delta: Record<string, number>,
) {
  const { data: existing } = await supabaseAdmin
    .from("scoring_player_stats")
    .select("stats")
    .eq("user_id", userId)
    .eq("sport_slug", sport)
    .maybeSingle();

  const prev = (existing?.stats as Record<string, number>) ?? {};
  const next: Record<string, number> = { ...prev };
  for (const [k, v] of Object.entries(delta)) {
    next[k] = (next[k] ?? 0) + v;
  }
  await supabaseAdmin.from("scoring_player_stats").upsert(
    { user_id: userId, sport_slug: sport, stats: next, updated_at: new Date().toISOString() },
    { onConflict: "user_id,sport_slug" },
  );
}

export const searchScoringPlayers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ q: z.string().min(2).max(80) }).parse(input))
  .handler(async ({ data, context }) => {
    const q = data.q.trim();
    const digits = q.replace(/\D/g, "");

    let query = supabaseAdmin
      .from("profiles")
      .select("id, username, full_name, phone, avatar_url")
      .neq("id", context.userId)
      .limit(12);

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

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      id: r.id as string,
      username: (r.username as string) ?? null,
      fullName: (r.full_name as string) ?? "Player",
      phone: (r.phone as string) ?? null,
      avatarUrl: (r.avatar_url as string) ?? null,
    }));
  });

export const listMyScoringMatches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: created } = await supabaseAdmin
      .from("scoring_matches")
      .select("*")
      .eq("created_by", context.userId)
      .order("created_at", { ascending: false })
      .limit(30);

    const { data: joined } = await supabaseAdmin
      .from("scoring_match_players")
      .select("match_id")
      .eq("user_id", context.userId);

    const joinedIds = (joined ?? []).map((j) => j.match_id as string).filter(Boolean);
    let participated: Record<string, unknown>[] = [];
    if (joinedIds.length) {
      const { data } = await supabaseAdmin
        .from("scoring_matches")
        .select("*")
        .in("id", joinedIds)
        .order("created_at", { ascending: false });
      participated = data ?? [];
    }

    const byId = new Map<string, Record<string, unknown>>();
    for (const row of [...(created ?? []), ...participated]) byId.set(row.id as string, row);

    const results: ScoringMatchRow[] = [];
    for (const row of byId.values()) {
      const { data: players } = await supabaseAdmin
        .from("scoring_match_players")
        .select("*")
        .eq("match_id", row.id as string);
      results.push(mapMatch(row, players ?? []));
    }
    return results.sort((a, b) => b.matchDate.localeCompare(a.matchDate));
  });

export const createScoringMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        sport: z.enum(["cricket", "football"]),
        teamAName: z.string().min(1).max(60),
        teamBName: z.string().min(1).max(60),
        totalOvers: z.number().int().min(1).max(50).optional(),
        gameLengthMinutes: z.number().int().min(10).max(120).optional(),
        players: z.array(
          z.object({
            userId: z.string().uuid(),
            team: z.enum(["a", "b"]),
            displayName: z.string().min(1).max(80),
            username: z.string().optional().nullable(),
          }),
        ),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    if (data.players.length < 2) throw new Error("Add at least 2 registered players");

    const creatorInTeam = data.players.some((p) => p.userId === context.userId);
    if (!creatorInTeam) {
      const { data: profile } = await context.supabase
        .from("profiles")
        .select("full_name, username")
        .eq("id", context.userId)
        .maybeSingle();
      data.players.push({
        userId: context.userId,
        team: "a",
        displayName: (profile?.full_name as string) ?? "You",
        username: (profile?.username as string) ?? null,
      });
    }

    const config =
      data.sport === "cricket"
        ? { totalOvers: data.totalOvers ?? 10 }
        : { gameLengthMinutes: data.gameLengthMinutes ?? 60 };

    const state =
      data.sport === "cricket"
        ? createCricketState(data.totalOvers ?? 10)
        : createFootballState(data.gameLengthMinutes ?? 60);

    const { data: match, error } = await supabaseAdmin
      .from("scoring_matches")
      .insert({
        sport_slug: data.sport,
        created_by: context.userId,
        status: "setup",
        team_a_name: data.teamAName,
        team_b_name: data.teamBName,
        config,
        state,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    const squad = data.players.map((p) => ({
      match_id: match.id,
      user_id: p.userId,
      team: p.team,
      display_name: p.displayName,
      username: p.username ?? null,
    }));
    const { error: squadErr } = await supabaseAdmin.from("scoring_match_players").insert(squad);
    if (squadErr) throw new Error(squadErr.message);

    return mapMatch(match, squad);
  });

export const startScoringMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ matchId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const match = await loadMatch(data.matchId);
    if (!match || match.createdBy !== context.userId) throw new Error("Match not found");
    if (match.status !== "setup") throw new Error("Match already started");

    const { data: row, error } = await supabaseAdmin
      .from("scoring_matches")
      .update({ status: "live", started_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", data.matchId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapMatch(row, match.players as unknown as Record<string, unknown>[]);
  });

export const getScoringMatch = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ matchId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const match = await loadMatch(data.matchId);
    if (!match) throw new Error("Match not found");
    return match;
  });

export const recordCricketBall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        matchId: z.string().uuid(),
        outcome: z.enum(["0", "1", "2", "3", "4", "6", "wide", "noball", "bye", "legbye", "wicket"]),
        batsmanId: z.string().uuid().optional(),
        bowlerId: z.string().uuid().optional(),
        wicketType: z.string().optional(),
        extraRuns: z.number().int().min(0).max(6).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const match = await loadMatch(data.matchId);
    if (!match || match.createdBy !== context.userId) throw new Error("Not allowed");
    if (match.status !== "live") throw new Error("Match is not live");

    const state = addCricketBall(match.state as unknown as CricketState, data.outcome as CricketBallOutcome, {
      batsmanId: data.batsmanId,
      bowlerId: data.bowlerId,
      wicketType: data.wicketType,
      extraRuns: data.extraRuns,
    });

    const { data: row, error } = await supabaseAdmin
      .from("scoring_matches")
      .update({
        state,
        updated_at: new Date().toISOString(),
        status: state.completed ? "completed" : "live",
        completed_at: state.completed ? new Date().toISOString() : null,
      })
      .eq("id", data.matchId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("scoring_events").insert({
      match_id: data.matchId,
      sport_slug: "cricket",
      event_type: "ball",
      payload: { outcome: data.outcome, batsmanId: data.batsmanId, bowlerId: data.bowlerId },
      seq: ((match.state as CricketState).innings1?.balls?.length ?? 0) + 1,
      created_by: context.userId,
    });

    if (state.completed) await finalizeScoringMatch(data.matchId, match, state);
    return mapMatch(row, match.players as unknown as Record<string, unknown>[]);
  });

export const undoScoringCricketBall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ matchId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const match = await loadMatch(data.matchId);
    if (!match || match.createdBy !== context.userId) throw new Error("Not allowed");
    const state = undoCricketBall(match.state as unknown as CricketState);
    const { data: row, error } = await supabaseAdmin
      .from("scoring_matches")
      .update({ state, status: "live", completed_at: null, updated_at: new Date().toISOString() })
      .eq("id", data.matchId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapMatch(row, match.players as unknown as Record<string, unknown>[]);
  });

export const recordFootballGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        matchId: z.string().uuid(),
        team: z.enum(["a", "b"]),
        playerId: z.string().uuid(),
        playerName: z.string().min(1),
        minute: z.number().int().min(0).max(120),
        type: z.enum(["goal", "own_goal"]).default("goal"),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const match = await loadMatch(data.matchId);
    if (!match || match.createdBy !== context.userId) throw new Error("Not allowed");
    if (match.status !== "live") throw new Error("Match is not live");

    let state = addFootballGoal(
      match.state as unknown as FootballState,
      data.team,
      data.playerId,
      data.playerName,
      data.minute,
      data.type,
    );
    state = setFootballMinute(state, data.minute);

    const { data: row, error } = await supabaseAdmin
      .from("scoring_matches")
      .update({
        state,
        updated_at: new Date().toISOString(),
        status: state.completed ? "completed" : "live",
        completed_at: state.completed ? new Date().toISOString() : null,
      })
      .eq("id", data.matchId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    if (state.completed) await finalizeScoringMatch(data.matchId, match, state);
    return mapMatch(row, match.players as unknown as Record<string, unknown>[]);
  });

export const completeScoringMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ matchId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const match = await loadMatch(data.matchId);
    if (!match || match.createdBy !== context.userId) throw new Error("Not allowed");
    const state =
      match.sportSlug === "football"
        ? completeFootballMatch(match.state as unknown as FootballState)
        : { ...(match.state as CricketState), completed: true };

    const { data: row, error } = await supabaseAdmin
      .from("scoring_matches")
      .update({
        state,
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.matchId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await finalizeScoringMatch(data.matchId, match, state);
    return mapMatch(row, match.players as unknown as Record<string, unknown>[]);
  });

async function finalizeScoringMatch(matchId: string, match: ScoringMatchRow, state: unknown) {
  const players = match.players.map((p) => ({
    userId: p.userId,
    team: p.team,
    displayName: p.displayName,
  }));

  let summary: Record<string, unknown> = {};
  if (match.sportSlug === "cricket") {
    const stats = computeCricketPlayerStats(state as CricketState, players);
    summary = { playerStats: stats, innings1: (state as CricketState).innings1, innings2: (state as CricketState).innings2 };
    for (const [userId, s] of Object.entries(stats)) {
      await mergePlayerStats(userId, "cricket", {
        matches: 1,
        runs: s.runs,
        wickets: s.wickets,
        fours: s.fours,
        sixes: s.sixes,
      });
    }
  } else {
    const fb = state as FootballState;
    const stats = computeFootballPlayerStats(fb, players);
    summary = { playerStats: stats, score: { a: fb.teamAScore, b: fb.teamBScore } };
    for (const [userId, s] of Object.entries(stats)) {
      await mergePlayerStats(userId, "football", { matches: 1, goals: s.goals });
    }
  }

  await supabaseAdmin.from("scoring_matches").update({ summary }).eq("id", matchId);
}

export const getScoringPlayerStats = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ userId: z.string().uuid(), sport: z.enum(["football", "cricket"]).optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    let q = supabaseAdmin.from("scoring_player_stats").select("sport_slug, stats").eq("user_id", data.userId);
    if (data.sport) q = q.eq("sport_slug", data.sport);
    const { data: rows } = await q;
    const out: Partial<Record<string, Record<string, number>>> = {};
    for (const r of rows ?? []) out[r.sport_slug as string] = r.stats as Record<string, number>;
    return out;
  });

export async function listScoringHistoryForUser(userId: string, sport?: string): Promise<ScoringHistoryRow[]> {
  const { data: squad } = await supabaseAdmin
    .from("scoring_match_players")
    .select("match_id, team, display_name")
    .eq("user_id", userId);

  if (!squad?.length) return [];
  const matchIds = squad.map((s) => s.match_id as string);
  let mq = supabaseAdmin
    .from("scoring_matches")
    .select("*")
    .in("id", matchIds)
    .eq("status", "completed")
    .order("match_date", { ascending: false })
    .limit(20);
  if (sport) mq = mq.eq("sport_slug", sport);

  const { data: matches } = await mq;
  const rows: ScoringHistoryRow[] = [];

  for (const m of matches ?? []) {
    const mySquad = squad.find((s) => s.match_id === m.id);
    if (!mySquad) continue;
    const myTeam = mySquad.team as "a" | "b";
    const state = m.state as Record<string, unknown>;
    let myScore = 0;
    let oppScore = 0;

    if (m.sport_slug === "cricket") {
      const inn1 = state.innings1 as { battingTeam: string; score: number } | undefined;
      const inn2 = state.innings2 as { battingTeam: string; score: number } | undefined;
      const aRuns = (inn1?.battingTeam === "a" ? inn1.score : 0) + (inn2?.battingTeam === "a" ? inn2?.score ?? 0 : 0);
      const bRuns = (inn1?.battingTeam === "b" ? inn1.score : 0) + (inn2?.battingTeam === "b" ? inn2?.score ?? 0 : 0);
      myScore = myTeam === "a" ? aRuns : bRuns;
      oppScore = myTeam === "a" ? bRuns : aRuns;
    } else {
      myScore = myTeam === "a" ? Number(state.teamAScore ?? 0) : Number(state.teamBScore ?? 0);
      oppScore = myTeam === "a" ? Number(state.teamBScore ?? 0) : Number(state.teamAScore ?? 0);
    }

    rows.push({
      id: m.id as string,
      sportSlug: m.sport_slug as ScoringHistoryRow["sportSlug"],
      matchDate: m.match_date as string,
      teamName: myTeam === "a" ? (m.team_a_name as string) : (m.team_b_name as string),
      teamIcon: m.sport_slug === "cricket" ? "🏏" : "⚽",
      playerScore: myScore,
      opponentName: myTeam === "a" ? (m.team_b_name as string) : (m.team_a_name as string),
      opponentIcon: "🔴",
      opponentScore: oppScore,
      source: "scoring",
    });
  }
  return rows;
}
