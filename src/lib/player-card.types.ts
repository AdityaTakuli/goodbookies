import type { PlayerSportSlug } from "@/lib/sports/player-sports";
import type { InventoryClub, InventoryFlag } from "@/lib/inventory/catalog";

export type PlayerCardView = {
  sportSlug: PlayerSportSlug;
  club: InventoryClub | null;
  flag: InventoryFlag;
  position: string;
  jerseyNumber: number | null;
  preferredFoot: string | null;
  sportSettings: Record<string, unknown>;
  cardRatings: Record<string, number>;
  isPublic: boolean;
  verifiedStats: Record<string, number>;
  player: {
    id: string;
    username: string;
    fullName: string;
    bio: string | null;
    city: string | null;
    avatarUrl: string | null;
    avatarInventoryId: string | null;
  };
};

export type MatchHistoryRow = {
  id: string;
  sportSlug: PlayerSportSlug;
  matchDate: string;
  teamName: string;
  teamIcon: string | null;
  playerScore: number;
  opponentName: string;
  opponentIcon: string | null;
  opponentScore: number;
  source?: "verified" | "scoring";
};
