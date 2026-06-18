import { g as getAvatarById } from "./catalog-yFqo9-Pm.js";
import { r as resolveMediaUrl } from "./urls-IKbc85gj.js";
const PLAYER_SKILL_LEVELS = ["beginner", "advanced", "professional"];
const PLAYER_SKILL_LEVEL_LABELS = {
  beginner: "Beginner",
  advanced: "Advanced",
  professional: "Professional"
};
function parseSkillLevel(value) {
  if (value === "advanced" || value === "professional") return value;
  return "beginner";
}
function getCardSkillLevel(card) {
  return parseSkillLevel(card.sportSettings.skill_level);
}
function resolveAvatarDisplay(card) {
  if (card.player.avatarUrl) {
    return { type: "url", value: resolveMediaUrl(card.player.avatarUrl) };
  }
  const inv = getAvatarById(card.player.avatarInventoryId);
  return { type: "inventory", value: inv };
}
export {
  PLAYER_SKILL_LEVELS as P,
  PLAYER_SKILL_LEVEL_LABELS as a,
  getCardSkillLevel as g,
  parseSkillLevel as p,
  resolveAvatarDisplay as r
};
