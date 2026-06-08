import { _ as reactExports, Q as jsxRuntimeExports } from "./server-CK6FPf7f.js";
import { r as resolveAvatarDisplay, g as getCardSkillLevel, a as PLAYER_SKILL_LEVEL_LABELS } from "./player-card.utils-Dn3fVHr0.js";
import { g as getSportConfig, S as SPORT_CONFIGS } from "./player-sports-D0yo17RI.js";
import { k as createLucideIcon, h as cn, B as Button, P as toast } from "./router-50lD0_tQ.js";
const __iconNode$2 = [
  ["path", { d: "M12 15V3", key: "m9g1x1" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["path", { d: "m7 10 5 5 5-5", key: "brsn70" }]
];
const Download = createLucideIcon("download", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M9 17H7A5 5 0 0 1 7 7h2", key: "8i5ue5" }],
  ["path", { d: "M15 7h2a5 5 0 1 1 0 10h-2", key: "1b9ql8" }],
  ["line", { x1: "8", x2: "16", y1: "12", y2: "12", key: "1jonct" }]
];
const Link2 = createLucideIcon("link-2", __iconNode$1);
const __iconNode = [
  ["circle", { cx: "18", cy: "5", r: "3", key: "gq8acd" }],
  ["circle", { cx: "6", cy: "12", r: "3", key: "w7nqdw" }],
  ["circle", { cx: "18", cy: "19", r: "3", key: "1xt0gg" }],
  ["line", { x1: "8.59", x2: "15.42", y1: "13.51", y2: "17.49", key: "47mynk" }],
  ["line", { x1: "15.41", x2: "8.59", y1: "6.51", y2: "10.49", key: "1n3mei" }]
];
const Share2 = createLucideIcon("share-2", __iconNode);
function ElectricCardBorder({ children, className, captureId }) {
  const uid = reactExports.useId().replace(/:/g, "");
  const filterId = `electric-border-${uid}`;
  const mobileFilterId = `electric-border-mobile-${uid}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      id: captureId,
      className: cn(
        "electric-player-card mx-auto w-full max-w-[min(100%,17.5rem)] sm:max-w-[18.75rem] md:max-w-[20rem]",
        className
      ),
      style: { ["--electric-filter"]: `url(#${filterId})` },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "electric-player-card__svg", "aria-hidden": true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "filter",
            {
              id: filterId,
              colorInterpolationFilters: "sRGB",
              x: "-20%",
              y: "-20%",
              width: "140%",
              height: "140%",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("feTurbulence", { type: "turbulence", baseFrequency: "0.02", numOctaves: "4", result: "noise1", seed: "1" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("feOffset", { in: "noise1", dx: "0", dy: "0", result: "offsetNoise1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("animate", { attributeName: "dy", values: "700; 0", dur: "6s", repeatCount: "indefinite", calcMode: "linear" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("feTurbulence", { type: "turbulence", baseFrequency: "0.02", numOctaves: "4", result: "noise2", seed: "1" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("feOffset", { in: "noise2", dx: "0", dy: "0", result: "offsetNoise2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("animate", { attributeName: "dy", values: "0; -700", dur: "6s", repeatCount: "indefinite", calcMode: "linear" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("feTurbulence", { type: "turbulence", baseFrequency: "0.02", numOctaves: "4", result: "noise3", seed: "2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("feOffset", { in: "noise3", dx: "0", dy: "0", result: "offsetNoise3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("animate", { attributeName: "dx", values: "490; 0", dur: "6s", repeatCount: "indefinite", calcMode: "linear" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("feTurbulence", { type: "turbulence", baseFrequency: "0.02", numOctaves: "4", result: "noise4", seed: "2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("feOffset", { in: "noise4", dx: "0", dy: "0", result: "offsetNoise4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("animate", { attributeName: "dx", values: "0; -490", dur: "6s", repeatCount: "indefinite", calcMode: "linear" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("feComposite", { in: "offsetNoise1", in2: "offsetNoise2", result: "part1" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("feComposite", { in: "offsetNoise3", in2: "offsetNoise4", result: "part2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("feBlend", { in: "part1", in2: "part2", mode: "color-dodge", result: "combinedNoise" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "feDisplacementMap",
                  {
                    in: "SourceGraphic",
                    in2: "combinedNoise",
                    scale: "18",
                    xChannelSelector: "R",
                    yChannelSelector: "B"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "filter",
            {
              id: mobileFilterId,
              colorInterpolationFilters: "sRGB",
              x: "-30%",
              y: "-30%",
              width: "160%",
              height: "160%",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("feTurbulence", { type: "turbulence", baseFrequency: "0.035", numOctaves: "3", result: "noise1", seed: "4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("animate", { attributeName: "seed", values: "4;9;4", dur: "3s", repeatCount: "indefinite" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("feTurbulence", { type: "turbulence", baseFrequency: "0.05", numOctaves: "2", result: "noise2", seed: "7", children: /* @__PURE__ */ jsxRuntimeExports.jsx("animate", { attributeName: "baseFrequency", values: "0.05;0.09;0.05", dur: "2.5s", repeatCount: "indefinite" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("feBlend", { in: "noise1", in2: "noise2", mode: "screen", result: "combinedNoise" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "feDisplacementMap",
                  {
                    in: "SourceGraphic",
                    in2: "combinedNoise",
                    scale: "30",
                    xChannelSelector: "R",
                    yChannelSelector: "B"
                  }
                )
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "electric-player-card__frame", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "electric-player-card__effects", "aria-hidden": true, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "electric-player-card__inner", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "electric-player-card__border-outer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "electric-player-card__border-main" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "svg",
                {
                  className: "electric-player-card__lightning-border",
                  viewBox: "0 0 100 100",
                  preserveAspectRatio: "none",
                  "aria-hidden": true,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "rect",
                    {
                      x: "1.8",
                      y: "1.8",
                      width: "96.4",
                      height: "96.4",
                      rx: "8.5",
                      ry: "8.5",
                      fill: "none",
                      stroke: "var(--electric-border-color)",
                      strokeWidth: "1.4",
                      vectorEffect: "non-scaling-stroke",
                      filter: `url(#${mobileFilterId})`
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "electric-player-card__glow-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "electric-player-card__glow-2" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "electric-player-card__overlay-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "electric-player-card__overlay-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "electric-player-card__bg-glow" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "electric-player-card__ambient" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "electric-player-card__content", children })
        ] })
      ]
    }
  );
}
function FutPlayerCard({
  data,
  captureId,
  className
}) {
  const config = getSportConfig(data.sportSlug);
  const avatar = resolveAvatarDisplay(data);
  const clubColors = data.club?.colors ?? ["#142219", "#10B981"];
  const overall = Math.round(
    Object.values(data.cardRatings).reduce((s, v) => s + v, 0) / Math.max(1, Object.values(data.cardRatings).length)
  );
  const cardName = data.sportSettings.card_name || data.player.fullName.split(" ").pop()?.toUpperCase() || "PLAYER";
  const skillLevel = getCardSkillLevel(data);
  const attrOrder = data.sportSlug === "football" ? ["PAC", "DRI", "SHO", "DEF", "PAS", "PHY"] : config.attributes.map((a) => a.key);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ElectricCardBorder, { captureId, className: cn("fut-player-card select-none", className), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative overflow-hidden rounded-[20px] p-3 sm:rounded-[24px] sm:p-4 md:p-5",
      style: {
        background: `linear-gradient(165deg, ${clubColors[0]} 0%, #1E3A27 38%, #142219 62%, #0B130E 100%)`
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(16,185,129,0.42),transparent_45%)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_95%,rgba(16,185,129,0.18),transparent_40%)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.08] to-transparent max-md:from-white/[0.1]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-4xl font-black leading-none text-white sm:text-5xl", children: overall }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[10px] font-bold uppercase tracking-widest text-primary sm:text-xs", children: data.position })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-7 w-10 items-center justify-center rounded-md border border-white/20 bg-black/30 text-base sm:h-8 sm:w-12 sm:text-lg", children: data.flag.emoji })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mx-auto mt-2 flex h-28 w-24 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-[#0B130E]/80 sm:mt-3 sm:h-36 sm:w-28", children: avatar.type === "url" ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatar.value, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl sm:text-5xl", children: avatar.value.emoji }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "relative mt-2 text-center font-display text-base font-black uppercase tracking-wide text-white sm:mt-3 sm:text-lg", children: cardName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mt-2 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary", children: PLAYER_SKILL_LEVEL_LABELS[skillLevel] }) }),
        data.club && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mx-auto mt-2 flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-[#0B130E] text-sm", children: data.club.badgeEmoji }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mt-3 grid grid-cols-2 gap-x-2 gap-y-2 px-1 sm:mt-4 sm:gap-x-6 sm:px-2", children: attrOrder.map((key, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: cn(
              "flex items-baseline gap-1.5 sm:gap-2",
              i % 2 === 0 ? "justify-start pr-1 sm:pr-2" : "justify-end pl-1 sm:pl-2"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 shrink-0 text-right font-display text-lg font-bold tabular-nums text-white sm:w-7 sm:text-xl", children: data.cardRatings[key] ?? 50 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary/90 sm:text-[11px]", children: key })
            ]
          },
          key
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "relative mt-4 text-center text-[9px] font-semibold uppercase tracking-[0.25em] text-white/35", children: [
          "Good Bookies · ",
          config.name
        ] })
      ]
    }
  ) });
}
function MatchHistoryList({
  matches,
  sportFilter
}) {
  const rows = sportFilter ? matches.filter((m) => m.sportSlug === sportFilter) : matches;
  if (rows.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground", children: "No match results yet. Use Match Scoring for friendly games, or play at partner turfs for verified scorelines." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: rows.map((m) => {
    const sport = SPORT_CONFIGS[m.sportSlug];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col gap-2 rounded-xl border border-border/60 bg-[#142219] px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-4",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs sm:gap-x-2 sm:text-sm md:text-base", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-lg", children: m.teamIcon ?? sport.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate font-semibold", children: [
              "You (",
              m.teamName,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-lg font-bold text-primary sm:text-xl", children: m.playerScore }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-1 sm:text-xs", children: "vs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-lg font-bold text-foreground/80 sm:text-xl", children: m.opponentScore }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-lg", children: m.opponentIcon ?? "🔴" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate text-muted-foreground", children: [
              "Opponent (",
              m.opponentName,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            m.source === "scoring" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary", children: "Self-scored" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: m.matchDate })
          ] })
        ]
      },
      m.id
    );
  }) });
}
function ShareCardButton({
  captureId,
  publicPath
}) {
  const [busy, setBusy] = reactExports.useState(false);
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${publicPath}` : publicPath;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("Profile link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };
  const downloadPng = async () => {
    const node = document.getElementById(captureId);
    if (!node) {
      toast.error("Card not ready to export");
      return;
    }
    setBusy(true);
    try {
      const { default: html2canvas } = await import("./html2canvas.esm-C17pzFXx.js");
      const canvas = await html2canvas(node, {
        backgroundColor: null,
        scale: 2,
        useCORS: true
      });
      const link = document.createElement("a");
      link.download = "goodbookies-football-card.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Card image downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Could not generate image");
    } finally {
      setBusy(false);
    }
  };
  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Good Bookies player card", url: fullUrl });
      } catch {
      }
      return;
    }
    copyLink();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid w-full max-w-sm grid-cols-1 gap-2 sm:max-w-none sm:grid-cols-3 md:flex md:flex-wrap", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", className: "h-11 w-full gap-2 sm:h-10 sm:w-auto", onClick: copyLink, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-4 w-4" }),
      "Copy link"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", className: "h-11 w-full gap-2 sm:h-10 sm:w-auto", onClick: downloadPng, disabled: busy, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
      busy ? "Generating…" : "Download PNG"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "secondary", className: "h-11 w-full gap-2 sm:h-10 sm:w-auto", onClick: nativeShare, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-4 w-4" }),
      "Share"
    ] })
  ] });
}
export {
  FutPlayerCard as F,
  MatchHistoryList as M,
  ShareCardButton as S
};
