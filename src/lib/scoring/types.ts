import type { PlayerSportSlug } from "@/lib/sports/player-sports";

export type ScoringSportSlug = "cricket" | "football";

export type ScoringMatchStatus = "setup" | "live" | "completed";

export type ScoringPlayerRow = {
  id: string;
  userId: string;
  team: "a" | "b";
  displayName: string;
  username: string | null;
};

export type ScoringMatchRow = {
  id: string;
  sportSlug: ScoringSportSlug;
  status: ScoringMatchStatus;
  teamAName: string;
  teamBName: string;
  config: Record<string, unknown>;
  state: Record<string, unknown>;
  summary: Record<string, unknown>;
  matchDate: string;
  createdBy: string;
  players: ScoringPlayerRow[];
};

export type CricketBallOutcome =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "6"
  | "wide"
  | "noball"
  | "bye"
  | "legbye"
  | "wicket";

export type CricketBallEvent = {
  over: number;
  ballInOver: number;
  outcome: CricketBallOutcome;
  runs: number;
  batsmanId?: string;
  bowlerId?: string;
  wicketType?: string;
  extraRuns?: number;
};

export type CricketInningsState = {
  battingTeam: "a" | "b";
  score: number;
  wickets: number;
  balls: CricketBallEvent[];
  strikerId?: string;
  nonStrikerId?: string;
  bowlerId?: string;
};

export type CricketState = {
  totalOvers: number;
  innings: 1 | 2;
  innings1: CricketInningsState;
  innings2?: CricketInningsState;
  completed: boolean;
};

export type FootballGoalEvent = {
  team: "a" | "b";
  playerId: string;
  playerName: string;
  minute: number;
  type: "goal" | "own_goal";
};

export type FootballState = {
  gameLengthMinutes: number;
  teamAScore: number;
  teamBScore: number;
  elapsedMinute: number;
  goals: FootballGoalEvent[];
  completed: boolean;
};

export type ScoringHistoryRow = {
  id: string;
  sportSlug: PlayerSportSlug;
  matchDate: string;
  teamName: string;
  teamIcon: string | null;
  playerScore: number;
  opponentName: string;
  opponentIcon: string | null;
  opponentScore: number;
  source: "scoring";
};

export const CRICKET_BALL_BUTTONS: { outcome: CricketBallOutcome; label: string; runs: number }[] = [
  { outcome: "0", label: "0", runs: 0 },
  { outcome: "1", label: "1", runs: 1 },
  { outcome: "2", label: "2", runs: 2 },
  { outcome: "3", label: "3", runs: 3 },
  { outcome: "4", label: "4", runs: 4 },
  { outcome: "6", label: "6", runs: 6 },
  { outcome: "wide", label: "Wide", runs: 1 },
  { outcome: "noball", label: "No ball", runs: 1 },
  { outcome: "bye", label: "Bye", runs: 1 },
  { outcome: "legbye", label: "Leg bye", runs: 1 },
  { outcome: "wicket", label: "Out", runs: 0 },
];

export const FOOTBALL_LENGTHS = [30, 40, 45, 60, 70, 90] as const;
