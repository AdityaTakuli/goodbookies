import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  getMyPlayerDashboard,
  updatePlayerProfileSettings,
  listInventoryClubs,
  listInventoryFlags,
  listAvatarInventory,
} from "@/lib/player-card.functions";
import {
  PLAYER_SPORT_SLUGS,
  SPORT_CONFIGS,
  type PlayerSportSlug,
} from "@/lib/sports/player-sports";
import type { PlayerCardView } from "@/lib/player-card.types";
import { FutPlayerCard } from "@/components/player/FutPlayerCard";
import { MatchHistoryList } from "@/components/player/MatchHistoryList";
import { ShareCardButton } from "@/components/player/ShareCardButton";
import { CardBuilderSection, Pill, PillGroup } from "@/components/player/CardBuilderPill";
import { CardBuilderStatsPanel } from "@/components/player/CardBuilderStatsPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  parseSkillLevel,
  PLAYER_SKILL_LEVEL_LABELS,
  PLAYER_SKILL_LEVELS,
  type PlayerSkillLevel,
} from "@/lib/player-card.utils";
import { cn } from "@/lib/utils";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export const Route = createFileRoute("/account/card")({
  component: MyBookiesDashboard,
});

function MyBookiesDashboard() {
  const getFn = useServerFn(getMyPlayerDashboard);
  const saveFn = useServerFn(updatePlayerProfileSettings);
  const clubsFn = useServerFn(listInventoryClubs);
  const flagsFn = useServerFn(listInventoryFlags);
  const avatarsFn = useServerFn(listAvatarInventory);
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [sport, setSport] = useState<PlayerSportSlug>("football");
  const { data, isLoading } = useQuery({ queryKey: ["my-player-dashboard"], queryFn: () => getFn() });
  const { data: clubs } = useQuery({ queryKey: ["inventory-clubs", sport], queryFn: () => clubsFn({ data: { sport } }) });
  const { data: flags } = useQuery({ queryKey: ["inventory-flags"], queryFn: () => flagsFn() });
  const { data: avatars } = useQuery({ queryKey: ["avatar-inventory"], queryFn: () => avatarsFn() });

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [cardName, setCardName] = useState("");
  const [clubId, setClubId] = useState("");
  const [flagId, setFlagId] = useState("in");
  const [position, setPosition] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [preferredFoot, setPreferredFoot] = useState<"left" | "right" | "both">("right");
  const [avatarInventoryId, setAvatarInventoryId] = useState<string | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [cardRatings, setCardRatings] = useState<Record<string, number>>({});
  const [skillLevel, setSkillLevel] = useState<PlayerSkillLevel>("beginner");
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  const config = SPORT_CONFIGS[sport];

  useEffect(() => {
    if (!data?.profile) return;
    setUsername(data.profile.username ?? "");
    setFullName(data.profile.full_name ?? "");
    setAvatarInventoryId(data.profile.avatar_inventory_id ?? null);
    setAvatarPreviewUrl(data.profile.avatar_url ?? null);
  }, [data?.profile]);

  useEffect(() => {
    const card = data?.cards?.[sport];
    if (card) {
      setClubId(card.club?.id ?? "");
      setFlagId(card.flag.id);
      setPosition(card.position);
      setJerseyNumber(card.jerseyNumber ? String(card.jerseyNumber) : "");
      setPreferredFoot((card.preferredFoot as "left" | "right" | "both") ?? "right");
      setCardRatings(card.cardRatings);
      setIsPublic(card.isPublic);
      setCardName((card.sportSettings.card_name as string) ?? "");
      setSkillLevel(parseSkillLevel(card.sportSettings.skill_level));
    } else {
      setPosition(config.positions[0]);
      setCardRatings({ ...config.defaultRatings });
      setClubId(clubs?.clubs?.[0]?.id ?? "");
      setCardName("");
      setSkillLevel("beginner");
    }
  }, [data?.cards, sport, config, clubs?.clubs]);

  const preview: PlayerCardView | null = useMemo(() => {
    if (!data?.profile) return null;
    const existing = data.cards?.[sport];
    const club = clubs?.clubs?.find((c) => c.id === clubId) ?? existing?.club ?? null;
    const flag = flags?.flags?.find((f) => f.id === flagId) ?? existing?.flag;
    if (!flag) return null;
    return {
      sportSlug: sport,
      club: config.showClub ? club : null,
      flag,
      position: position || config.positions[0],
      jerseyNumber: jerseyNumber ? Number(jerseyNumber) : null,
      preferredFoot: sport === "football" ? preferredFoot : null,
      sportSettings: {
        ...(existing?.sportSettings ?? {}),
        card_name: cardName.toUpperCase(),
        skill_level: skillLevel,
      },
      cardRatings: { ...config.defaultRatings, ...cardRatings },
      isPublic,
      verifiedStats: existing?.verifiedStats ?? {},
      player: {
        id: data.profile.id,
        username: username || data.profile.username || "player",
        fullName: fullName || data.profile.full_name || "Player",
        bio: data.profile.bio ?? null,
        city: data.profile.city ?? null,
        avatarUrl: avatarPreviewUrl,
        avatarInventoryId,
      },
    };
  }, [
    data,
    sport,
    clubs,
    flags,
    clubId,
    flagId,
    position,
    jerseyNumber,
    preferredFoot,
    cardRatings,
    isPublic,
    username,
    fullName,
    cardName,
    skillLevel,
    avatarInventoryId,
    avatarPreviewUrl,
    config,
  ]);

  const onAvatarPick = (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Use JPEG or PNG");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreviewUrl(reader.result as string);
      setAvatarInventoryId(null);
    };
    reader.readAsDataURL(file);
  };

  const onSave = async () => {
    if (!username || username.length < 3) {
      toast.error("Set a public username for your profile URL");
      return;
    }
    if (!fullName.trim()) {
      toast.error("Enter your full name");
      return;
    }
    setSaving(true);
    try {
      const existing = data?.cards?.[sport];
      await saveFn({
        data: {
          sport,
          username: username.toLowerCase(),
          full_name: fullName.trim(),
          avatar_inventory_id: avatarInventoryId,
          avatar_url: avatarPreviewUrl?.startsWith("data:") ? avatarPreviewUrl : undefined,
          club_id: config.showClub ? clubId : null,
          flag_id: flagId,
          position,
          jersey_number: jerseyNumber ? Number(jerseyNumber) : null,
          preferred_foot: sport === "football" ? preferredFoot : undefined,
          card_ratings: cardRatings,
          sport_settings: {
            ...(existing?.sportSettings ?? {}),
            card_name: cardName.toUpperCase(),
            skill_level: skillLevel,
          },
          is_public: isPublic,
        },
      });
      toast.success(`${config.name} card saved`);
      qc.invalidateQueries({ queryKey: ["my-player-dashboard"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  if (data?.migrationRequired) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
        <h1 className="font-display text-2xl font-bold">My Player Card</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Run migrations in Supabase SQL editor:
          <code className="mx-1 rounded bg-muted px-1">20260605120000_player_cards_football.sql</code>
          then
          <code className="mx-1 rounded bg-muted px-1">20260606120000_multisport_player_cards.sql</code>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">My Player Card</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Build your multi-sport player card — stats are turf-verified, aesthetics are yours.
          </p>
        </div>
        {username && (
          <Link
            to="/players/$username"
            params={{ username: username.toLowerCase() }}
            search={{ sport }}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Public page <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto overscroll-x-contain px-1 pb-2 pr-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0 md:pr-0 [&::-webkit-scrollbar]:hidden">
        {PLAYER_SPORT_SLUGS.map((slug) => (
          <button
            key={slug}
            type="button"
            onClick={() => setSport(slug)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors sm:py-2",
              sport === slug ? "bg-primary text-primary-foreground" : "bg-[#142219] text-muted-foreground hover:text-foreground",
            )}
          >
            {SPORT_CONFIGS[slug].icon} {SPORT_CONFIGS[slug].name}
          </button>
        ))}
      </div>

      <div className="mt-2 grid gap-5 md:mt-0 md:grid-cols-[minmax(0,18.75rem)_1fr] md:gap-6 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-8">
        {/* Preview — top on mobile, sticky sidebar on tablet+ */}
        <div className="order-1 md:sticky md:top-20 md:self-start lg:top-24">
          <div className="space-y-3 sm:space-y-4">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Live preview</p>
            {preview && (
              <div className="player-card-preview-shell flex flex-col items-center gap-3 sm:gap-4">
                <FutPlayerCard data={preview} captureId="dashboard-fut-card" />
                {username && (
                  <ShareCardButton
                    captureId="dashboard-fut-card"
                    publicPath={`/players/${username.toLowerCase()}?sport=${sport}`}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Configuration workspace */}
        <div className="order-2 min-w-0 space-y-4 sm:space-y-5">
          <CardBuilderSection title="Identity">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative mx-auto flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-primary/40 bg-[#0B130E] hover:border-primary sm:mx-0"
              >
                {avatarPreviewUrl ? (
                  <img src={avatarPreviewUrl} alt="" className="h-full w-full object-cover" />
                ) : avatarInventoryId ? (
                  <span className="text-3xl">
                    {avatars?.avatars?.find((a) => a.id === avatarInventoryId)?.emoji ?? "👤"}
                  </span>
                ) : (
                  <Camera className="h-7 w-7 text-primary/70" />
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => onAvatarPick(e.target.files?.[0])}
                />
              </button>
              <div className="grid flex-1 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Card name</Label>
                  <Input
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase().slice(0, 18))}
                    placeholder="MESSI"
                    className="bg-[#0B130E]"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Full name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name"
                    className="bg-[#0B130E]"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Public username</Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="yourname"
                    className="bg-[#0B130E]"
                  />
                  <p className="text-xs text-muted-foreground">/players/{username || "username"}</p>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Or pick avatar</Label>
                  <select
                    value={avatarInventoryId ?? ""}
                    onChange={(e) => {
                      setAvatarInventoryId(e.target.value || null);
                      if (e.target.value) setAvatarPreviewUrl(null);
                    }}
                    className="h-10 w-full rounded-lg border border-[#1E3A27] bg-[#0B130E] px-3 text-sm"
                  >
                    <option value="">Upload custom photo</option>
                    {(avatars?.avatars ?? []).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.emoji} {a.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardBuilderSection>

          <CardBuilderSection title="Nationality">
            <PillGroup scroll>
              {(flags?.flags ?? []).map((f) => (
                <Pill key={f.id} selected={flagId === f.id} onClick={() => setFlagId(f.id)}>
                  <span>{f.emoji}</span>
                  <span>{f.name}</span>
                </Pill>
              ))}
            </PillGroup>
          </CardBuilderSection>

          <CardBuilderSection title="Position">
            <PillGroup scroll>
              {config.positions.map((p) => (
                <Pill key={p} selected={position === p} onClick={() => setPosition(p)}>
                  {p}
                </Pill>
              ))}
            </PillGroup>
          </CardBuilderSection>

          <CardBuilderSection title="Skill level">
            <p className="mb-3 text-xs text-muted-foreground">Self-selected tag shown on your player card.</p>
            <PillGroup>
              {PLAYER_SKILL_LEVELS.map((level) => (
                <Pill key={level} selected={skillLevel === level} onClick={() => setSkillLevel(level)}>
                  {PLAYER_SKILL_LEVEL_LABELS[level]}
                </Pill>
              ))}
            </PillGroup>
          </CardBuilderSection>

          {config.showClub && (
            <CardBuilderSection title="Club / Team">
              <PillGroup scroll>
                {(clubs?.clubs ?? []).map((c) => (
                  <Pill key={c.id} selected={clubId === c.id} onClick={() => setClubId(c.id)}>
                    <span>{c.badgeEmoji}</span>
                    <span>{c.name}</span>
                  </Pill>
                ))}
              </PillGroup>
            </CardBuilderSection>
          )}

          <CardBuilderSection title="Stats">
            {preview && (
              <CardBuilderStatsPanel
                sport={sport}
                card={preview}
                matches={data?.matches ?? []}
                goalsByTurf={data?.goalsByTurf ?? []}
              />
            )}
          </CardBuilderSection>

          <CardBuilderSection title="Card attributes">
            <p className="mb-3 text-xs text-muted-foreground">FIFA-style ratings — cosmetic only, separate from verified match stats.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {config.attributes.map((attr) => (
                <div key={attr.key}>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{attr.key}</Label>
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    value={cardRatings[attr.key] ?? config.defaultRatings[attr.key]}
                    onChange={(e) => setCardRatings((prev) => ({ ...prev, [attr.key]: Number(e.target.value) }))}
                    className="mt-1 bg-[#0B130E]"
                  />
                </div>
              ))}
            </div>
          </CardBuilderSection>

          {sport === "football" && (
            <CardBuilderSection title="Jersey & foot">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">Jersey #</Label>
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    value={jerseyNumber}
                    onChange={(e) => setJerseyNumber(e.target.value)}
                    className="bg-[#0B130E]"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">Preferred foot</Label>
                  <select
                    value={preferredFoot}
                    onChange={(e) => setPreferredFoot(e.target.value as "left" | "right" | "both")}
                    className="h-10 rounded-lg border border-[#1E3A27] bg-[#0B130E] px-3 text-sm"
                  >
                    <option value="right">Right</option>
                    <option value="left">Left</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
            </CardBuilderSection>
          )}

          <label className="flex items-center justify-between gap-3 rounded-xl border border-[#1E3A27] bg-[#142219] p-4 sm:rounded-2xl">
            <span className="text-sm font-medium">Show this sport card on public profile</span>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </label>

          <div className="sticky bottom-3 z-10 -mx-1 rounded-xl border border-[#1E3A27]/80 bg-[#0B130E]/95 p-3 backdrop-blur-sm sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none md:static">
            <Button onClick={onSave} disabled={saving} className="glow-primary h-11 w-full sm:h-10 md:w-auto">
              {saving ? "Saving…" : `Save ${config.name} card`}
            </Button>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-[#1E3A27]/80 bg-[#142219] p-4 sm:rounded-2xl sm:p-6">
        <h2 className="font-display text-lg font-semibold">Match history</h2>
        <p className="mt-1 text-sm text-muted-foreground">Verified scorelines from partner turfs</p>
        <div className="mt-4">
          <MatchHistoryList matches={data?.matches ?? []} sportFilter={sport} />
        </div>
      </section>
    </div>
  );
}
