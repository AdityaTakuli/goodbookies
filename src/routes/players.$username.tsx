import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { z } from "zod";
import { getPublicPlayerProfile } from "@/lib/player-card.functions";
import { FutPlayerCard } from "@/components/player/FutPlayerCard";
import { MatchHistoryList } from "@/components/player/MatchHistoryList";
import { ShareCardButton } from "@/components/player/ShareCardButton";
import { PLAYER_SPORT_SLUGS, SPORT_CONFIGS, isPlayerSportSlug, type PlayerSportSlug } from "@/lib/sports/player-sports";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  sport: z.string().optional(),
});

const profileQO = (username: string, sport?: string) =>
  queryOptions({
    queryKey: ["public-player", username, sport],
    queryFn: () => getPublicPlayerProfile({ data: { username, sport } }),
  });

export const Route = createFileRoute("/players/$username")({
  validateSearch: searchSchema,
  loader: async ({ context, params, search }) => {
    const profile = await context.queryClient.ensureQueryData(
      profileQO(params.username, search.sport),
    );
    if (!profile) throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} · Player Card` },
      { name: "description", content: `Public multi-sport player profile for @${params.username}` },
      { property: "og:type", content: "profile" },
    ],
  }),
  component: PublicPlayerPage,
});

function PublicPlayerPage() {
  const { username } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(profileQO(username, search.sport));

  if (!data) return null;

  const availableSports = PLAYER_SPORT_SLUGS.filter((s) => data.cards[s]);
  const activeSport: PlayerSportSlug = isPlayerSportSlug(search.sport ?? "") && data.cards[search.sport as PlayerSportSlug]
    ? (search.sport as PlayerSportSlug)
    : data.activeSport;
  const card = data.cards[activeSport];
  if (!card) return null;

  const setSport = (slug: PlayerSportSlug) => {
    navigate({ to: "/players/$username", params: { username }, search: { sport: slug }, replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0B130E]">
      <div className="container mx-auto px-3 py-8 sm:px-4 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto flex w-full max-w-4xl flex-col gap-6 sm:gap-8"
        >
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#10B981] sm:text-xs sm:tracking-[0.25em]">My Player Card</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl md:text-4xl">{card.player.fullName}</h1>
            <p className="mt-1 text-white/60">@{card.player.username}</p>
            {card.player.bio && <p className="mx-auto mt-3 max-w-lg text-sm text-white/75">{card.player.bio}</p>}
          </div>

          {availableSports.length > 1 && (
            <div className="-mx-1 flex justify-start gap-2 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] sm:mx-0 sm:justify-center sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
              {availableSports.map((slug) => (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setSport(slug)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold sm:py-2",
                    activeSport === slug ? "bg-[#10B981] text-[#0B130E]" : "bg-[#142219] text-white/70",
                  )}
                >
                  {SPORT_CONFIGS[slug].icon} {SPORT_CONFIGS[slug].name}
                </button>
              ))}
            </div>
          )}

          <div className="flex w-full flex-col items-center gap-4 overflow-visible px-4 py-6 sm:gap-6 sm:px-2 sm:py-4">
            <FutPlayerCard data={card} captureId="public-fut-card" className="w-full" />
            <ShareCardButton captureId="public-fut-card" publicPath={`/players/${username}?sport=${activeSport}`} />
          </div>

          <section className="rounded-xl border border-[#1E3A27] bg-[#142219] p-4 sm:rounded-2xl sm:p-6">
            <h2 className="font-display text-xl font-bold text-white">Match history</h2>
            <div className="mt-4">
              <MatchHistoryList matches={data.matches} sportFilter={activeSport} />
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
