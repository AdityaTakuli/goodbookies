import { BadgeCheck, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export type FootballCardData = {
  sportSlug: "football";
  club: { id: string; name: string; shortName: string; city: string; colors: [string, string]; badgeEmoji: string };
  flag: { id: string; name: string; emoji: string; colors: [string, string] };
  position: string;
  jerseyNumber: number | null;
  preferredFoot: string | null;
  isPublic: boolean;
  selfReported: { goals: number; assists: number; matches: number };
  verified: { goals: number; assists: number; matches: number };
  player: {
    id: string;
    username: string;
    fullName: string;
    bio: string | null;
    city: string | null;
    avatarUrl: string | null;
  };
};

function StatBlock({
  label,
  verified,
  self,
  compact,
}: {
  label: string;
  verified: number;
  self: number;
  compact?: boolean;
}) {
  return (
    <div className={cn("rounded-xl border border-white/10 bg-black/20 p-3", compact && "p-2")}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">{label}</p>
      <p className={cn("font-display font-bold text-white", compact ? "text-2xl" : "text-3xl")}>{verified}</p>
      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-300">
        <BadgeCheck className="h-3 w-3" />
        <span>Turf verified</span>
      </div>
      {self > 0 && (
        <p className="mt-1 text-[10px] text-white/45">
          +{self} self-reported <span className="italic">(unverified)</span>
        </p>
      )}
    </div>
  );
}

export function FootballPlayerCard({
  data,
  captureId,
  variant = "full",
}: {
  data: FootballCardData;
  captureId?: string;
  variant?: "full" | "share";
}) {
  const [primary, secondary] = data.club.colors;
  const initials = data.player.fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      id={captureId}
      className={cn(
        "relative overflow-hidden rounded-3xl text-white shadow-2xl",
        variant === "share" ? "w-[360px]" : "w-full max-w-md",
      )}
      style={{
        background: `linear-gradient(145deg, ${primary} 0%, ${secondary} 55%, #0b0f19 100%)`,
      }}
    >
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-10 -left-6 h-44 w-44 rounded-full bg-black/20 blur-2xl" />

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black/25 text-2xl font-bold ring-2 ring-white/20">
              {data.player.avatarUrl ? (
                <img src={data.player.avatarUrl} alt="" className="h-full w-full rounded-2xl object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Football Card</p>
              <h2 className="font-display text-2xl font-bold leading-tight">{data.player.fullName}</h2>
              <p className="text-sm text-white/75">@{data.player.username}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl">{data.flag.emoji}</p>
            <p className="text-[10px] text-white/70">{data.flag.name}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            {data.club.badgeEmoji} {data.club.name}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
            {data.position}
            {data.jerseyNumber ? ` · #${data.jerseyNumber}` : ""}
          </span>
          {data.player.city && (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">{data.player.city}</span>
          )}
        </div>

        {data.player.bio && variant === "full" && (
          <p className="mt-4 text-sm leading-relaxed text-white/85">{data.player.bio}</p>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2">
          <StatBlock label="Goals" verified={data.verified.goals} self={data.selfReported.goals} compact={variant === "share"} />
          <StatBlock label="Assists" verified={data.verified.assists} self={data.selfReported.assists} compact={variant === "share"} />
          <StatBlock label="Matches" verified={data.verified.matches} self={data.selfReported.matches} compact={variant === "share"} />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-200">
            <Shield className="h-3.5 w-3.5" />
            Turf-verified stats are recorded by venue owners after matches
          </span>
          <span className="font-semibold text-white/80">goodbookies</span>
        </div>
      </div>
    </div>
  );
}
