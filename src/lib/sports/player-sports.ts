export const PLAYER_SPORT_SLUGS = ["football", "cricket", "basketball", "badminton"] as const;
export type PlayerSportSlug = (typeof PLAYER_SPORT_SLUGS)[number];

export type SportAttributeDef = { key: string; label: string };

export type SportConfig = {
  slug: PlayerSportSlug;
  name: string;
  icon: string;
  showClub: boolean;
  positions: readonly string[];
  attributes: SportAttributeDef[];
  defaultRatings: Record<string, number>;
};

export const SPORT_CONFIGS: Record<PlayerSportSlug, SportConfig> = {
  football: {
    slug: "football",
    name: "Football",
    icon: "⚽",
    showClub: true,
    positions: ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"],
    attributes: [
      { key: "PAC", label: "Pace" },
      { key: "SHO", label: "Shooting" },
      { key: "PAS", label: "Passing" },
      { key: "DRI", label: "Dribbling" },
      { key: "DEF", label: "Defense" },
      { key: "PHY", label: "Physicality" },
    ],
    defaultRatings: { PAC: 72, SHO: 70, PAS: 68, DRI: 71, DEF: 65, PHY: 74 },
  },
  cricket: {
    slug: "cricket",
    name: "Cricket",
    icon: "🏏",
    showClub: true,
    positions: ["BAT", "BWL", "ALL", "WK"],
    attributes: [
      { key: "BAT", label: "Batting" },
      { key: "BWL", label: "Bowling" },
      { key: "FLD", label: "Fielding" },
      { key: "PWR", label: "Power" },
      { key: "RUN", label: "Running" },
      { key: "SKL", label: "Skill" },
    ],
    defaultRatings: { BAT: 75, BWL: 68, FLD: 70, PWR: 72, RUN: 74, SKL: 71 },
  },
  basketball: {
    slug: "basketball",
    name: "Basketball",
    icon: "🏀",
    showClub: true,
    positions: ["PG", "SG", "SF", "PF", "C"],
    attributes: [
      { key: "PTS", label: "Points" },
      { key: "AST", label: "Assists" },
      { key: "REB", label: "Rebounds" },
      { key: "STL", label: "Steals" },
      { key: "BLK", label: "Blocks" },
      { key: "DEF", label: "Defense" },
    ],
    defaultRatings: { PTS: 74, AST: 70, REB: 72, STL: 68, BLK: 66, DEF: 71 },
  },
  badminton: {
    slug: "badminton",
    name: "Badminton",
    icon: "🏸",
    showClub: false,
    positions: ["SINGLES", "DOUBLES", "MIXED"],
    attributes: [
      { key: "SMT", label: "Smash" },
      { key: "AGY", label: "Agility" },
      { key: "STM", label: "Stamina" },
      { key: "ACC", label: "Accuracy" },
      { key: "NET", label: "Net Play" },
      { key: "DEF", label: "Defense" },
    ],
    defaultRatings: { SMT: 76, AGY: 78, STM: 74, ACC: 73, NET: 72, DEF: 70 },
  },
};

export function isPlayerSportSlug(v: string): v is PlayerSportSlug {
  return (PLAYER_SPORT_SLUGS as readonly string[]).includes(v);
}

export function getSportConfig(slug: PlayerSportSlug) {
  return SPORT_CONFIGS[slug];
}

/** Verified stat keys aggregated per sport (read-only for players). */
export const VERIFIED_STAT_KEYS: Record<PlayerSportSlug, string[]> = {
  football: ["matches", "goals", "minutes", "assists"],
  cricket: ["matches", "runs", "wickets", "catches", "fours", "sixes", "win_pct"],
  basketball: ["matches", "points", "assists", "rebounds", "blocks", "steals", "win_pct"],
  badminton: ["matches", "matches_won", "win_pct"],
};

export const VERIFIED_STAT_LABELS: Record<string, string> = {
  matches: "Matches",
  goals: "Goals",
  minutes: "Minutes",
  assists: "Assists",
  runs: "Runs",
  wickets: "Wickets",
  catches: "Catches",
  fours: "4s",
  sixes: "6s",
  win_pct: "Win %",
  points: "Points",
  rebounds: "Rebounds",
  blocks: "Blocks",
  steals: "Steals",
  matches_won: "Won",
};
