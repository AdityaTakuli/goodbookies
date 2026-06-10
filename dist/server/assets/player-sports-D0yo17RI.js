const PLAYER_SPORT_SLUGS = ["football", "cricket", "basketball", "badminton"];
const SPORT_CONFIGS = {
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
      { key: "PHY", label: "Physicality" }
    ],
    defaultRatings: { PAC: 72, SHO: 70, PAS: 68, DRI: 71, DEF: 65, PHY: 74 }
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
      { key: "SKL", label: "Skill" }
    ],
    defaultRatings: { BAT: 75, BWL: 68, FLD: 70, PWR: 72, RUN: 74, SKL: 71 }
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
      { key: "DEF", label: "Defense" }
    ],
    defaultRatings: { PTS: 74, AST: 70, REB: 72, STL: 68, BLK: 66, DEF: 71 }
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
      { key: "DEF", label: "Defense" }
    ],
    defaultRatings: { SMT: 76, AGY: 78, STM: 74, ACC: 73, NET: 72, DEF: 70 }
  }
};
function isPlayerSportSlug(v) {
  return PLAYER_SPORT_SLUGS.includes(v);
}
function getSportConfig(slug) {
  return SPORT_CONFIGS[slug];
}
const VERIFIED_STAT_KEYS = {
  football: ["matches", "goals", "minutes", "assists"],
  cricket: ["matches", "runs", "wickets", "catches", "fours", "sixes", "win_pct"],
  basketball: ["matches", "points", "assists", "rebounds", "blocks", "steals", "win_pct"],
  badminton: ["matches", "matches_won", "win_pct"]
};
export {
  PLAYER_SPORT_SLUGS as P,
  SPORT_CONFIGS as S,
  VERIFIED_STAT_KEYS as V,
  getSportConfig as g,
  isPlayerSportSlug as i
};
