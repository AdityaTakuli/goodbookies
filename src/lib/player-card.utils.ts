import { getAvatarById } from "@/lib/inventory/catalog";
import type { PlayerCardView } from "@/lib/player-card.types";

export function resolveAvatarDisplay(card: PlayerCardView) {
  if (card.player.avatarUrl) return { type: "url" as const, value: card.player.avatarUrl };
  const inv = getAvatarById(card.player.avatarInventoryId);
  return { type: "inventory" as const, value: inv };
}
