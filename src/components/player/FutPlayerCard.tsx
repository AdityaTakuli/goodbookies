import type { PlayerCardView } from "@/lib/player-card.types";
import { getCardSkillLevel, PLAYER_SKILL_LEVEL_LABELS, resolveAvatarDisplay } from "@/lib/player-card.utils";
import { getSportConfig } from "@/lib/sports/player-sports";
import { cn } from "@/lib/utils";
import { ElectricCardBorder } from "@/components/player/ElectricCardBorder";

export function FutPlayerCard({
  data,
  captureId,
  className,
}: {
  data: PlayerCardView;
  captureId?: string;
  className?: string;
}) {
  const config = getSportConfig(data.sportSlug);
  const avatar = resolveAvatarDisplay(data);
  const clubColors = data.club?.colors ?? ["#142219", "#10B981"];
  const overall = Math.round(
    Object.values(data.cardRatings).reduce((s, v) => s + v, 0) / Math.max(1, Object.values(data.cardRatings).length),
  );
  const cardName =
    (data.sportSettings.card_name as string) ||
    data.player.fullName.split(" ").pop()?.toUpperCase() ||
    "PLAYER";
  const skillLevel = getCardSkillLevel(data);
  const attrOrder =
    data.sportSlug === "football"
      ? ["PAC", "DRI", "SHO", "DEF", "PAS", "PHY"]
      : config.attributes.map((a) => a.key);

  return (
    <ElectricCardBorder captureId={captureId} className={cn("fut-player-card select-none", className)}>
      <div
        className="relative overflow-hidden rounded-[20px] p-3 sm:rounded-[24px] sm:p-4 md:p-5"
        style={{
          background: `linear-gradient(165deg, ${clubColors[0]} 0%, #1E3A27 38%, #142219 62%, #0B130E 100%)`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(16,185,129,0.42),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_95%,rgba(16,185,129,0.18),transparent_40%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.08] to-transparent max-md:from-white/[0.1]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="font-display text-4xl font-black leading-none text-white sm:text-5xl">{overall}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-primary sm:text-xs">{data.position}</p>
          </div>
          <div className="flex h-7 w-10 items-center justify-center rounded-md border border-white/20 bg-black/30 text-base sm:h-8 sm:w-12 sm:text-lg">
            {data.flag.emoji}
          </div>
        </div>

        <div className="relative mx-auto mt-2 flex h-28 w-24 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-[#0B130E]/80 sm:mt-3 sm:h-36 sm:w-28">
          {avatar.type === "url" ? (
            <img src={avatar.value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-4xl sm:text-5xl">{avatar.value.emoji}</span>
          )}
        </div>

        <p className="relative mt-2 text-center font-display text-base font-black uppercase tracking-wide text-white sm:mt-3 sm:text-lg">
          {cardName}
        </p>
        <div className="relative mt-2 flex justify-center">
          <span className="rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            {PLAYER_SKILL_LEVEL_LABELS[skillLevel]}
          </span>
        </div>

        {data.club && (
          <div className="relative mx-auto mt-2 flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-[#0B130E] text-sm">
            {data.club.badgeEmoji}
          </div>
        )}

        <div className="relative mt-3 grid grid-cols-2 gap-x-2 gap-y-2 px-1 sm:mt-4 sm:gap-x-6 sm:px-2">
          {attrOrder.map((key, i) => (
            <div
              key={key}
              className={cn(
                "flex items-baseline gap-1.5 sm:gap-2",
                i % 2 === 0 ? "justify-start pr-1 sm:pr-2" : "justify-end pl-1 sm:pl-2",
              )}
            >
              <span className="w-6 shrink-0 text-right font-display text-lg font-bold tabular-nums text-white sm:w-7 sm:text-xl">
                {data.cardRatings[key] ?? 50}
              </span>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary/90 sm:text-[11px]">
                {key}
              </span>
            </div>
          ))}
        </div>

        <p className="relative mt-4 text-center text-[9px] font-semibold uppercase tracking-[0.25em] text-white/35">
          Good Bookies · {config.name}
        </p>
      </div>
    </ElectricCardBorder>
  );
}
