import type { PlayerSportSlug } from "@/lib/sports/player-sports";

export type InventoryFlag = {
  id: string;
  name: string;
  emoji: string;
  colors: [string, string];
};

export type InventoryClub = {
  id: string;
  sport: PlayerSportSlug | "all";
  name: string;
  shortName: string;
  city: string;
  colors: [string, string];
  badgeEmoji: string;
};

export type AvatarInventoryItem = {
  id: string;
  label: string;
  emoji: string;
  gradient: [string, string];
};

export const INVENTORY_FLAGS: InventoryFlag[] = [
  { id: "in", name: "India", emoji: "🇮🇳", colors: ["#FF9933", "#138808"] },
  { id: "gb-eng", name: "England", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", colors: ["#FFFFFF", "#CE1124"] },
  { id: "es", name: "Spain", emoji: "🇪🇸", colors: ["#AA151B", "#F1BF00"] },
  { id: "br", name: "Brazil", emoji: "🇧🇷", colors: ["#009C3B", "#FFDF00"] },
  { id: "ar", name: "Argentina", emoji: "🇦🇷", colors: ["#74ACDF", "#FFFFFF"] },
  { id: "pt", name: "Portugal", emoji: "🇵🇹", colors: ["#006600", "#FF0000"] },
  { id: "au", name: "Australia", emoji: "🇦🇺", colors: ["#00008B", "#FFCD00"] },
];

export const INVENTORY_CLUBS: InventoryClub[] = [
  // Football — European & Indian
  { id: "mumbai-strikers", sport: "football", name: "Mumbai Strikers FC", shortName: "STR", city: "Mumbai", colors: ["#0B1F3A", "#10B981"], badgeEmoji: "⚽" },
  { id: "delhi-dynamos", sport: "football", name: "Delhi Dynamos", shortName: "DYN", city: "Delhi", colors: ["#1A0B2E", "#10B981"], badgeEmoji: "🔥" },
  { id: "bengaluru-blues", sport: "football", name: "Bengaluru Blues", shortName: "BLU", city: "Bengaluru", colors: ["#0033A0", "#10B981"], badgeEmoji: "💙" },
  { id: "man-city", sport: "football", name: "Manchester City", shortName: "MCI", city: "Manchester", colors: ["#6CABDD", "#1C2C5B"], badgeEmoji: "🌙" },
  { id: "real-madrid", sport: "football", name: "Real Madrid", shortName: "RMA", city: "Madrid", colors: ["#FEBE10", "#00529F"], badgeEmoji: "👑" },
  { id: "fc-barcelona", sport: "football", name: "FC Barcelona", shortName: "BAR", city: "Barcelona", colors: ["#A50044", "#004D98"], badgeEmoji: "🔵" },
  { id: "free-agent-fb", sport: "football", name: "Free Agent", shortName: "FA", city: "—", colors: ["#142219", "#10B981"], badgeEmoji: "🆓" },
  // Cricket — IPL
  { id: "mi", sport: "cricket", name: "Mumbai Indians", shortName: "MI", city: "Mumbai", colors: ["#004BA0", "#D1AB3E"], badgeEmoji: "💙" },
  { id: "csk", sport: "cricket", name: "Chennai Super Kings", shortName: "CSK", city: "Chennai", colors: ["#F9CD05", "#0081E9"], badgeEmoji: "🦁" },
  { id: "rcb", sport: "cricket", name: "Royal Challengers", shortName: "RCB", city: "Bengaluru", colors: ["#EC1C24", "#2B2A29"], badgeEmoji: "🔴" },
  { id: "kkr", sport: "cricket", name: "Kolkata Knight Riders", shortName: "KKR", city: "Kolkata", colors: ["#3A225D", "#B9975B"], badgeEmoji: "🟣" },
  { id: "free-agent-cr", sport: "cricket", name: "Unaffiliated", shortName: "UA", city: "—", colors: ["#142219", "#10B981"], badgeEmoji: "🏏" },
  // Basketball — NBA style
  { id: "lakers", sport: "basketball", name: "Lakers", shortName: "LAL", city: "Los Angeles", colors: ["#552583", "#FDB927"], badgeEmoji: "💜" },
  { id: "warriors", sport: "basketball", name: "Warriors", shortName: "GSW", city: "San Francisco", colors: ["#1D428A", "#FFC72C"], badgeEmoji: "🌉" },
  { id: "celtics", sport: "basketball", name: "Celtics", shortName: "BOS", city: "Boston", colors: ["#007A33", "#BA9653"], badgeEmoji: "☘️" },
  { id: "free-agent-bb", sport: "basketball", name: "Free Agent", shortName: "FA", city: "—", colors: ["#142219", "#10B981"], badgeEmoji: "🏀" },
];

export const AVATAR_INVENTORY: AvatarInventoryItem[] = [
  { id: "avatar-striker", label: "Striker", emoji: "⚡", gradient: ["#10B981", "#0B130E"] },
  { id: "avatar-keeper", label: "Keeper", emoji: "🧤", gradient: ["#1E3A27", "#142219"] },
  { id: "avatar-captain", label: "Captain", emoji: "©️", gradient: ["#065F46", "#0B130E"] },
  { id: "avatar-rookie", label: "Rookie", emoji: "🌟", gradient: ["#10B981", "#1E3A27"] },
  { id: "avatar-veteran", label: "Veteran", emoji: "🏅", gradient: ["#142219", "#10B981"] },
  { id: "avatar-flash", label: "Flash", emoji: "💨", gradient: ["#0B130E", "#34D399"] },
];

export function getFlagById(id?: string | null) {
  return INVENTORY_FLAGS.find((f) => f.id === id) ?? INVENTORY_FLAGS[0];
}

export function getClubById(id?: string | null, sport?: PlayerSportSlug) {
  const found = INVENTORY_CLUBS.find((c) => c.id === id);
  if (found) return found;
  const fallback = INVENTORY_CLUBS.find((c) => c.sport === sport && c.id.startsWith("free-agent"));
  return fallback ?? INVENTORY_CLUBS[0];
}

export function getClubsForSport(sport: PlayerSportSlug) {
  return INVENTORY_CLUBS.filter((c) => c.sport === sport);
}

export function getAvatarById(id?: string | null) {
  return AVATAR_INVENTORY.find((a) => a.id === id) ?? AVATAR_INVENTORY[0];
}
