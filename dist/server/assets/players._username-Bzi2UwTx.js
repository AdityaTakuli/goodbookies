import { Q as jsxRuntimeExports } from "./server-CYzZ9eUw.js";
import { l as Route, ab as useNavigate, U as profileQO, p as cn } from "./router-C0WOwQSW.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BErD2DCH.js";
import { F as FutPlayerCard, S as ShareCardButton, M as MatchHistoryList } from "./ShareCardButton-fbk5bTAb.js";
import { P as PLAYER_SPORT_SLUGS, i as isPlayerSportSlug, S as SPORT_CONFIGS } from "./player-sports-D0yo17RI.js";
import { m as motion } from "./proxy-CcIhZlrG.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./cancellation-policy-Be0g0_Zy.js";
import "./pricing-DOPRXSDA.js";
import "./client.server-CQTuKCic.js";
import "./urls-IKbc85gj.js";
import "./auth-middleware-CL6_siGS.js";
import "./types-DeUvCBv7.js";
import "./useBaseQuery-DHNf7B_D.js";
import "./player-card.utils-CVQ3C6LZ.js";
import "./catalog-yFqo9-Pm.js";
function PublicPlayerPage() {
  const {
    username
  } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const {
    data
  } = useSuspenseQuery(profileQO(username, search.sport));
  if (!data) return null;
  const availableSports = PLAYER_SPORT_SLUGS.filter((s) => data.cards[s]);
  const activeSport = isPlayerSportSlug(search.sport ?? "") && data.cards[search.sport] ? search.sport : data.activeSport;
  const card = data.cards[activeSport];
  if (!card) return null;
  const setSport = (slug) => {
    navigate({
      to: "/players/$username",
      params: {
        username
      },
      search: {
        sport: slug
      },
      replace: true
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-[#0B130E]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto px-3 py-8 sm:px-4 sm:py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
    opacity: 0,
    y: 12
  }, animate: {
    opacity: 1,
    y: 0
  }, className: "mx-auto flex w-full max-w-4xl flex-col gap-6 sm:gap-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-[0.2em] text-[#10B981] sm:text-xs sm:tracking-[0.25em]", children: "My Player Card" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 font-display text-2xl font-bold text-white sm:text-3xl md:text-4xl", children: card.player.fullName }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-white/60", children: [
        "@",
        card.player.username
      ] }),
      card.player.bio && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-3 max-w-lg text-sm text-white/75", children: card.player.bio })
    ] }),
    availableSports.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "-mx-1 flex justify-start gap-2 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] sm:mx-0 sm:justify-center sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden", children: availableSports.map((slug) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setSport(slug), className: cn("shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold sm:py-2", activeSport === slug ? "bg-[#10B981] text-[#0B130E]" : "bg-[#142219] text-white/70"), children: [
      SPORT_CONFIGS[slug].icon,
      " ",
      SPORT_CONFIGS[slug].name
    ] }, slug)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full flex-col items-center gap-4 overflow-visible px-4 py-6 sm:gap-6 sm:px-2 sm:py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FutPlayerCard, { data: card, captureId: "public-fut-card", className: "w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShareCardButton, { captureId: "public-fut-card", publicPath: `/players/${username}?sport=${activeSport}` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-xl border border-[#1E3A27] bg-[#142219] p-4 sm:rounded-2xl sm:p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-bold text-white", children: "Match history" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MatchHistoryList, { matches: data.matches, sportFilter: activeSport }) })
    ] })
  ] }) }) });
}
export {
  PublicPlayerPage as component
};
