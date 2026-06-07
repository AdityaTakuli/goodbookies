import { getAvatarById } from "@/lib/inventory/catalog";
import { resolveMediaUrl } from "@/lib/media/urls";
import type { PlayerCardView } from "@/lib/player-card.types";

export const PLAYER_SKILL_LEVELS = ["beginner", "advanced", "professional"] as const;
export type PlayerSkillLevel = (typeof PLAYER_SKILL_LEVELS)[number];

export const PLAYER_SKILL_LEVEL_LABELS: Record<PlayerSkillLevel, string> = {
  beginner: "Beginner",
  advanced: "Advanced",
  professional: "Professional",
};

export function parseSkillLevel(value: unknown): PlayerSkillLevel {
  if (value === "advanced" || value === "professional") return value;
  return "beginner";
}

export function getCardSkillLevel(card: Pick<PlayerCardView, "sportSettings">): PlayerSkillLevel {
  return parseSkillLevel(card.sportSettings.skill_level);
}

export function resolveAvatarDisplay(card: PlayerCardView) {
  if (card.player.avatarUrl) {
    return { type: "url" as const, value: resolveMediaUrl(card.player.avatarUrl) };
  }
  const inv = getAvatarById(card.player.avatarInventoryId);
  return { type: "inventory" as const, value: inv };
}
