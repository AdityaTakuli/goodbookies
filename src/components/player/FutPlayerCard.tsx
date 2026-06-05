import type { PlayerCardView } from "@/lib/player-card.types";
import { resolveAvatarDisplay } from "@/lib/player-card.utils";
import { getSportConfig } from "@/lib/sports/player-sports";
import { cn } from "@/lib/utils";

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
  const attrOrder =
    data.sportSlug === "football"
      ? ["PAC", "DRI", "SHO", "DEF", "PAS", "PHY"]
      : config.attributes.map((a) => a.key);

  return (
    <div
      id={captureId}
      className={cn("fut-player-card relative mx-auto w-[280px] select-none", className)}
    >
      <div
        className="relative overflow-hidden rounded-[24px] border border-primary/25 p-4 shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
        style={{
          background: `linear-gradient(165deg, ${clubColors[0]} 0%, #1E3A27 38%, #142219 62%, #0B130E 100%)`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(16,185,129,0.28),transparent_42%)]" />

        {/* Top row: OVR + flag */}
        <div className="relative flex items-start justify-between">
          <div>
            <p className="font-display text-5xl font-black leading-none text-white">{overall}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-primary">{data.position}</p>
          </div>
          <div className="flex h-8 w-12 items-center justify-center rounded-md border border-white/20 bg-black/30 text-lg">
            {data.flag.emoji}
          </div>
        </div>

        {/* Portrait */}
        <div className="relative mx-auto mt-3 flex h-36 w-28 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-[#0B130E]/80">
          {avatar.type === "url" ? (
            <img src={avatar.value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-5xl">{avatar.value.emoji}</span>
          )}
        </div>

        {/* Card name */}
        <p className="relative mt-3 text-center font-display text-lg font-black uppercase tracking-wide text-white">
          {cardName}
        </p>

        {/* Club badge */}
        {data.club && (
          <div className="relative mx-auto mt-2 flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-[#0B130E] text-sm">
            {data.club.badgeEmoji}
          </div>
        )}

        {/* FIFA attributes — 2 columns × 3 rows */}
        <div className="relative mt-4 grid grid-cols-2 gap-x-4 gap-y-2 px-2">
          {attrOrder.map((key, i) => (
            <div key={key} className={cn("flex items-baseline justify-between", i % 2 === 0 ? "pr-2" : "pl-2")}>
              <span className="font-display text-xl font-bold text-white">{data.cardRatings[key] ?? 50}</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary/90">{key}</span>
            </div>
          ))}
        </div>

        <p className="relative mt-4 text-center text-[9px] font-semibold uppercase tracking-[0.25em] text-white/35">
          Good Bookies · {config.name}
        </p>
      </div>
    </div>
  );
}
