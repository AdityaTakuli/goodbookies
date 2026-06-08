function createCricketState(totalOvers) {
  return {
    totalOvers,
    innings: 1,
    innings1: emptyInnings("a"),
    completed: false
  };
}
function emptyInnings(battingTeam) {
  return { battingTeam, score: 0, wickets: 0, balls: [] };
}
function legalBallsInInnings(innings) {
  return innings.balls.filter((b) => !["wide", "noball"].includes(b.outcome)).length;
}
function cricketOversDisplay(innings) {
  const legal = legalBallsInInnings(innings);
  const overs = Math.floor(legal / 6);
  const balls = legal % 6;
  return `${overs}.${balls}`;
}
function cricketMaxLegalBalls(totalOvers) {
  return totalOvers * 6;
}
function addCricketBall(state, outcome, opts) {
  const next = structuredClone(state);
  const innings = next.innings === 1 ? next.innings1 : next.innings2 ?? emptyInnings(next.innings === 2 ? "b" : "a");
  if (next.innings === 2 && !next.innings2) next.innings2 = innings;
  const legalSoFar = legalBallsInInnings(innings);
  const over = Math.floor(legalSoFar / 6) + 1;
  const ballInOver = legalSoFar % 6 + 1;
  const isExtra = outcome === "wide" || outcome === "noball";
  const runs = outcome === "wicket" ? 0 : outcome === "wide" || outcome === "noball" ? 1 + (opts?.extraRuns ?? 0) : outcome === "bye" || outcome === "legbye" ? opts?.extraRuns ?? 1 : Number(outcome);
  const ball = {
    over: isExtra ? Math.max(1, Math.floor(legalSoFar / 6) + 1) : over,
    ballInOver: isExtra ? Math.max(1, legalSoFar % 6 || 6) : ballInOver,
    outcome,
    runs,
    batsmanId: opts?.batsmanId,
    bowlerId: opts?.bowlerId,
    wicketType: outcome === "wicket" ? opts?.wicketType ?? "out" : void 0,
    extraRuns: opts?.extraRuns
  };
  innings.balls.push(ball);
  innings.score += runs;
  if (outcome === "wicket") innings.wickets += 1;
  if (opts?.batsmanId) innings.strikerId = opts.batsmanId;
  if (opts?.bowlerId) innings.bowlerId = opts.bowlerId;
  const maxBalls = cricketMaxLegalBalls(next.totalOvers);
  const inningsDone = innings.wickets >= 10 || legalBallsInInnings(innings) >= maxBalls;
  if (inningsDone) {
    if (next.innings === 1) {
      next.innings = 2;
      next.innings2 = emptyInnings(innings.battingTeam === "a" ? "b" : "a");
    } else {
      next.completed = true;
    }
  }
  return next;
}
function undoCricketBall(state) {
  const next = structuredClone(state);
  const innings = next.innings === 1 ? next.innings1 : next.innings2;
  if (!innings?.balls.length) return state;
  const removed = innings.balls.pop();
  innings.score = Math.max(0, innings.score - removed.runs);
  if (removed.outcome === "wicket") innings.wickets = Math.max(0, innings.wickets - 1);
  if (next.completed) next.completed = false;
  return next;
}
function computeCricketPlayerStats(state, players) {
  const stats = {};
  for (const p of players) {
    stats[p.userId] = { runs: 0, balls: 0, wickets: 0, fours: 0, sixes: 0 };
  }
  const allBalls = [...state.innings1.balls, ...state.innings2?.balls ?? []];
  for (const ball of allBalls) {
    if (ball.batsmanId && stats[ball.batsmanId]) {
      if (!["wide", "noball"].includes(ball.outcome)) stats[ball.batsmanId].balls += 1;
      if (["0", "1", "2", "3", "4", "6"].includes(ball.outcome)) {
        stats[ball.batsmanId].runs += Number(ball.outcome);
        if (ball.outcome === "4") stats[ball.batsmanId].fours += 1;
        if (ball.outcome === "6") stats[ball.batsmanId].sixes += 1;
      }
      if (ball.outcome === "bye" || ball.outcome === "legbye") {
        stats[ball.batsmanId].runs += ball.runs;
      }
    }
    if (ball.outcome === "wicket" && ball.bowlerId && stats[ball.bowlerId]) {
      stats[ball.bowlerId].wickets += 1;
    }
  }
  return stats;
}
export {
  addCricketBall as a,
  createCricketState as b,
  computeCricketPlayerStats as c,
  cricketOversDisplay as d,
  undoCricketBall as u
};
