import type { FootballGoalEvent, FootballState } from "./types";

export function createFootballState(gameLengthMinutes: number): FootballState {
  return {
    gameLengthMinutes,
    teamAScore: 0,
    teamBScore: 0,
    elapsedMinute: 0,
    goals: [],
    completed: false,
  };
}

export function addFootballGoal(
  state: FootballState,
  team: "a" | "b",
  playerId: string,
  playerName: string,
  minute: number,
  type: "goal" | "own_goal" = "goal",
): FootballState {
  const next = structuredClone(state);
  const event: FootballGoalEvent = { team, playerId, playerName, minute, type };
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

export function setFootballMinute(state: FootballState, minute: number): FootballState {
  const next = structuredClone(state);
  next.elapsedMinute = Math.min(Math.max(0, minute), next.gameLengthMinutes);
  if (next.elapsedMinute >= next.gameLengthMinutes) next.completed = true;
  return next;
}

export function completeFootballMatch(state: FootballState): FootballState {
  return { ...structuredClone(state), completed: true, elapsedMinute: state.gameLengthMinutes };
}

export function computeFootballPlayerStats(
  state: FootballState,
  players: { userId: string; team: "a" | "b" }[],
) {
  const stats: Record<string, { goals: number; matches: number }> = {};
  for (const p of players) stats[p.userId] = { goals: 0, matches: 1 };
  for (const g of state.goals) {
    if (g.type === "goal" && stats[g.playerId]) stats[g.playerId].goals += 1;
  }
  return stats;
}
