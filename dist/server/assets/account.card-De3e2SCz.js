import { P as jsxRuntimeExports, Z as reactExports } from "./server-DZ-HHBSO.js";
import { j as createLucideIcon, g as cn, U as useComposedRefs, q as getMyPlayerDashboard, Q as updatePlayerProfileSettings, u as listInventoryClubs, v as listInventoryFlags, t as listAvatarInventory, W as useQueryClient, L as Link, B as Button, P as toast } from "./router-Hx5xDr3C.js";
import { u as useQuery } from "./useQuery-DHLOOWr5.js";
import { u as useServerFn } from "./useServerFn-vlAfTLJk.js";
import { S as SPORT_CONFIGS, P as PLAYER_SPORT_SLUGS } from "./player-sports-D0yo17RI.js";
import { F as FutPlayerCard, S as ShareCardButton, M as MatchHistoryList } from "./ShareCardButton-DgE1g1Vw.js";
import { I as Input } from "./input-fMTv4SO3.js";
import { L as Label } from "./label-CacOriZ2.js";
import { u as useControllableState, P as Primitive, c as composeEventHandlers, b as createContextScope } from "./index-DifuhPSS.js";
import { u as usePrevious, a as useSize } from "./index-CHultF6F.js";
import { p as parseSkillLevel, P as PLAYER_SKILL_LEVELS, a as PLAYER_SKILL_LEVEL_LABELS } from "./player-card.utils-BjTbZwr2.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-BIT182qO.js";
import "./index-BlRNeFf7.js";
import "./auth-middleware-Dlzf4XC9.js";
import "./useBaseQuery-Dli0nawq.js";
import "./catalog-Du0eftkI.js";
const __iconNode$3 = [
  [
    "path",
    {
      d: "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",
      key: "18u6gg"
    }
  ],
  ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }]
];
const Camera = createLucideIcon("camera", __iconNode$3);
const __iconNode$2 = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]];
const ChevronDown = createLucideIcon("chevron-down", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
const ExternalLink = createLucideIcon("external-link", __iconNode$1);
const __iconNode = [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
];
const Lock = createLucideIcon("lock", __iconNode);
function CardBuilderSection({
  title,
  children,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: cn("rounded-xl border border-[#1E3A27]/80 bg-[#142219] p-4 sm:rounded-2xl sm:p-5", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children })
  ] });
}
function PillGroup({
  children,
  scroll
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "flex flex-wrap gap-2",
        scroll && "flex-nowrap overflow-x-auto overscroll-x-contain pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0 sm:snap-none"
      ),
      children
    }
  );
}
function Pill({
  selected,
  onClick,
  children,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      onClick,
      className: cn(
        "inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full border px-3.5 py-2.5 text-sm font-medium transition-colors sm:min-h-0 sm:px-3 sm:py-2",
        selected ? "border-primary bg-primary/15 text-primary shadow-[0_0_0_1px_rgba(16,185,129,0.35)]" : "border-[#1E3A27] bg-[#0B130E] text-foreground/80 hover:border-primary/40 hover:text-foreground",
        className
      ),
      children
    }
  );
}
function StatCard({
  label,
  value,
  hint
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[#1E3A27] bg-[#0B130E] p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-display text-2xl font-bold text-primary", children: value }),
    hint && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[10px] text-muted-foreground", children: hint })
  ] });
}
function footballDerived(stats, matches) {
  const m = stats.matches ?? 0;
  const mins = stats.minutes ?? 0;
  const sportMatches = matches.filter((x) => x.sportSlug === "football");
  const wins = sportMatches.filter((x) => x.playerScore > x.opponentScore).length;
  const winPct = sportMatches.length > 0 ? Math.round(wins / sportMatches.length * 100) : stats.win_pct ?? 0;
  const avgGame = m > 0 ? Math.round(mins / m) : 0;
  return { winPct, avgGame };
}
function basketballDerived(stats, matches) {
  const m = stats.matches ?? 0;
  const sportMatches = matches.filter((x) => x.sportSlug === "basketball");
  const wins = sportMatches.filter((x) => x.playerScore > x.opponentScore).length;
  const winPct = sportMatches.length > 0 ? Math.round(wins / sportMatches.length * 100) : stats.win_pct ?? 0;
  return {
    ppg: m > 0 ? (stats.points / m).toFixed(1) : "0.0",
    apg: m > 0 ? (stats.assists / m).toFixed(1) : "0.0",
    rpg: m > 0 ? (stats.rebounds / m).toFixed(1) : "0.0",
    stlBlk: `${stats.steals ?? 0} / ${stats.blocks ?? 0}`,
    winPct
  };
}
function CardBuilderStatsPanel({
  sport,
  card,
  matches,
  goalsByTurf = []
}) {
  const [turfOpen, setTurfOpen] = reactExports.useState(false);
  const s = card.verifiedStats;
  const fb = footballDerived(s, matches);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3.5 w-3.5" }),
      "Turf-verified only — updated when venue owners confirm matches"
    ] }),
    sport === "football" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Goals", value: s.goals ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Matches", value: s.matches ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Position", value: card.position }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Win %", value: `${fb.winPct}%`, hint: "from verified scorelines" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Minutes", value: (s.minutes ?? 0).toLocaleString(), hint: "total played" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Avg / Game", value: fb.avgGame, hint: "minutes" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setTurfOpen((v) => !v),
          className: "flex w-full items-center justify-between rounded-xl border border-[#1E3A27] bg-[#0B130E] px-4 py-3 text-sm font-medium text-foreground hover:border-primary/40",
          children: [
            "Goals by turf",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: cn("h-4 w-4 transition-transform", turfOpen && "rotate-180") })
          ]
        }
      ),
      turfOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-[#1E3A27] bg-[#0B130E] p-3", children: goalsByTurf.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No turf breakdown yet" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: goalsByTurf.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex justify-between text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.venueName }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-primary", children: [
          t.goals,
          " goals"
        ] })
      ] }, t.venueName)) }) })
    ] }),
    sport === "cricket" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Runs", value: s.runs ?? 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Wickets", value: s.wickets ?? 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Catches", value: s.catches ?? 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Boundaries", value: (s.fours ?? 0) + (s.sixes ?? 0), hint: "4s + 6s" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Matches", value: s.matches ?? 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Win %", value: `${s.win_pct ?? 0}%` })
    ] }),
    sport === "basketball" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3", children: (() => {
      const b = basketballDerived(s, matches);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "PPG", value: b.ppg }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "APG", value: b.apg }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "RPG", value: b.rpg }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "STL / BLK", value: b.stlBlk }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Matches", value: s.matches ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Win %", value: `${b.winPct}%` })
      ] });
    })() }),
    sport === "badminton" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Matches played", value: s.matches ?? 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Matches won", value: s.matches_won ?? 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Win %", value: `${s.win_pct ?? 0}%` })
    ] })
  ] });
}
var SWITCH_NAME = "Switch";
var [createSwitchContext] = createContextScope(SWITCH_NAME);
var [SwitchProvider, useSwitchContext] = createSwitchContext(SWITCH_NAME);
var Switch$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeSwitch,
      name,
      checked: checkedProp,
      defaultChecked,
      required,
      disabled,
      value = "on",
      onCheckedChange,
      form,
      ...switchProps
    } = props;
    const [button, setButton] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setButton(node));
    const hasConsumerStoppedPropagationRef = reactExports.useRef(false);
    const isFormControl = button ? form || !!button.closest("form") : true;
    const [checked, setChecked] = useControllableState({
      prop: checkedProp,
      defaultProp: defaultChecked ?? false,
      onChange: onCheckedChange,
      caller: SWITCH_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(SwitchProvider, { scope: __scopeSwitch, checked, disabled, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.button,
        {
          type: "button",
          role: "switch",
          "aria-checked": checked,
          "aria-required": required,
          "data-state": getState(checked),
          "data-disabled": disabled ? "" : void 0,
          disabled,
          value,
          ...switchProps,
          ref: composedRefs,
          onClick: composeEventHandlers(props.onClick, (event) => {
            setChecked((prevChecked) => !prevChecked);
            if (isFormControl) {
              hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
              if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
            }
          })
        }
      ),
      isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
        SwitchBubbleInput,
        {
          control: button,
          bubbles: !hasConsumerStoppedPropagationRef.current,
          name,
          value,
          checked,
          required,
          disabled,
          form,
          style: { transform: "translateX(-100%)" }
        }
      )
    ] });
  }
);
Switch$1.displayName = SWITCH_NAME;
var THUMB_NAME = "SwitchThumb";
var SwitchThumb = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSwitch, ...thumbProps } = props;
    const context = useSwitchContext(THUMB_NAME, __scopeSwitch);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-state": getState(context.checked),
        "data-disabled": context.disabled ? "" : void 0,
        ...thumbProps,
        ref: forwardedRef
      }
    );
  }
);
SwitchThumb.displayName = THUMB_NAME;
var BUBBLE_INPUT_NAME = "SwitchBubbleInput";
var SwitchBubbleInput = reactExports.forwardRef(
  ({
    __scopeSwitch,
    control,
    checked,
    bubbles = true,
    ...props
  }, forwardedRef) => {
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(ref, forwardedRef);
    const prevChecked = usePrevious(checked);
    const controlSize = useSize(control);
    reactExports.useEffect(() => {
      const input = ref.current;
      if (!input) return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        inputProto,
        "checked"
      );
      const setChecked = descriptor.set;
      if (prevChecked !== checked && setChecked) {
        const event = new Event("click", { bubbles });
        setChecked.call(input, checked);
        input.dispatchEvent(event);
      }
    }, [prevChecked, checked, bubbles]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "checkbox",
        "aria-hidden": true,
        defaultChecked: checked,
        ...props,
        tabIndex: -1,
        ref: composedRefs,
        style: {
          ...props.style,
          ...controlSize,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0
        }
      }
    );
  }
);
SwitchBubbleInput.displayName = BUBBLE_INPUT_NAME;
function getState(checked) {
  return checked ? "checked" : "unchecked";
}
var Root = Switch$1;
var Thumb = SwitchThumb;
const Switch = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Thumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = Root.displayName;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
function MyBookiesDashboard() {
  const getFn = useServerFn(getMyPlayerDashboard);
  const saveFn = useServerFn(updatePlayerProfileSettings);
  const clubsFn = useServerFn(listInventoryClubs);
  const flagsFn = useServerFn(listInventoryFlags);
  const avatarsFn = useServerFn(listAvatarInventory);
  const qc = useQueryClient();
  const fileRef = reactExports.useRef(null);
  const [sport, setSport] = reactExports.useState("football");
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["my-player-dashboard"],
    queryFn: () => getFn()
  });
  const {
    data: clubs
  } = useQuery({
    queryKey: ["inventory-clubs", sport],
    queryFn: () => clubsFn({
      data: {
        sport
      }
    })
  });
  const {
    data: flags
  } = useQuery({
    queryKey: ["inventory-flags"],
    queryFn: () => flagsFn()
  });
  const {
    data: avatars
  } = useQuery({
    queryKey: ["avatar-inventory"],
    queryFn: () => avatarsFn()
  });
  const [username, setUsername] = reactExports.useState("");
  const [fullName, setFullName] = reactExports.useState("");
  const [cardName, setCardName] = reactExports.useState("");
  const [clubId, setClubId] = reactExports.useState("");
  const [flagId, setFlagId] = reactExports.useState("in");
  const [position, setPosition] = reactExports.useState("");
  const [jerseyNumber, setJerseyNumber] = reactExports.useState("");
  const [preferredFoot, setPreferredFoot] = reactExports.useState("right");
  const [avatarInventoryId, setAvatarInventoryId] = reactExports.useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = reactExports.useState(null);
  const [cardRatings, setCardRatings] = reactExports.useState({});
  const [skillLevel, setSkillLevel] = reactExports.useState("beginner");
  const [isPublic, setIsPublic] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const config = SPORT_CONFIGS[sport];
  reactExports.useEffect(() => {
    if (!data?.profile) return;
    setUsername(data.profile.username ?? "");
    setFullName(data.profile.full_name ?? "");
    setAvatarInventoryId(data.profile.avatar_inventory_id ?? null);
    setAvatarPreviewUrl(data.profile.avatar_url ?? null);
  }, [data?.profile]);
  reactExports.useEffect(() => {
    const card = data?.cards?.[sport];
    if (card) {
      setClubId(card.club?.id ?? "");
      setFlagId(card.flag.id);
      setPosition(card.position);
      setJerseyNumber(card.jerseyNumber ? String(card.jerseyNumber) : "");
      setPreferredFoot(card.preferredFoot ?? "right");
      setCardRatings(card.cardRatings);
      setIsPublic(card.isPublic);
      setCardName(card.sportSettings.card_name ?? "");
      setSkillLevel(parseSkillLevel(card.sportSettings.skill_level));
    } else {
      setPosition(config.positions[0]);
      setCardRatings({
        ...config.defaultRatings
      });
      setClubId(clubs?.clubs?.[0]?.id ?? "");
      setCardName("");
      setSkillLevel("beginner");
    }
  }, [data?.cards, sport, config, clubs?.clubs]);
  const preview = reactExports.useMemo(() => {
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
        ...existing?.sportSettings ?? {},
        card_name: cardName.toUpperCase(),
        skill_level: skillLevel
      },
      cardRatings: {
        ...config.defaultRatings,
        ...cardRatings
      },
      isPublic,
      verifiedStats: existing?.verifiedStats ?? {},
      player: {
        id: data.profile.id,
        username: username || data.profile.username || "player",
        fullName: fullName || data.profile.full_name || "Player",
        bio: data.profile.bio ?? null,
        city: data.profile.city ?? null,
        avatarUrl: avatarPreviewUrl,
        avatarInventoryId
      }
    };
  }, [data, sport, clubs, flags, clubId, flagId, position, jerseyNumber, preferredFoot, cardRatings, isPublic, username, fullName, cardName, skillLevel, avatarInventoryId, avatarPreviewUrl, config]);
  const onAvatarPick = (file) => {
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
      setAvatarPreviewUrl(reader.result);
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
          avatar_url: avatarPreviewUrl?.startsWith("data:") ? avatarPreviewUrl : void 0,
          club_id: config.showClub ? clubId : null,
          flag_id: flagId,
          position,
          jersey_number: jerseyNumber ? Number(jerseyNumber) : null,
          preferred_foot: sport === "football" ? preferredFoot : void 0,
          card_ratings: cardRatings,
          sport_settings: {
            ...existing?.sportSettings ?? {},
            card_name: cardName.toUpperCase(),
            skill_level: skillLevel
          },
          is_public: isPublic
        }
      });
      toast.success(`${config.name} card saved`);
      qc.invalidateQueries({
        queryKey: ["my-player-dashboard"]
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Loading…" });
  if (data?.migrationRequired) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold", children: "My Player Card" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
        "Run migrations in Supabase SQL editor:",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "mx-1 rounded bg-muted px-1", children: "20260605120000_player_cards_football.sql" }),
        "then",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "mx-1 rounded bg-muted px-1", children: "20260606120000_multisport_player_cards.sql" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 sm:space-y-6 md:space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold sm:text-3xl", children: "My Player Card" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 max-w-2xl text-sm text-muted-foreground", children: "Build your multi-sport player card — stats are turf-verified, aesthetics are yours." })
      ] }),
      username && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/players/$username", params: {
        username: username.toLowerCase()
      }, search: {
        sport
      }, className: "inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline", children: [
        "Public page ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "-mx-1 flex gap-2 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden", children: PLAYER_SPORT_SLUGS.map((slug) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setSport(slug), className: cn("shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors sm:py-2", sport === slug ? "bg-primary text-primary-foreground" : "bg-[#142219] text-muted-foreground hover:text-foreground"), children: [
      SPORT_CONFIGS[slug].icon,
      " ",
      SPORT_CONFIGS[slug].name
    ] }, slug)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 md:grid-cols-[minmax(0,18.75rem)_1fr] md:gap-6 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "order-1 md:sticky md:top-20 md:self-start lg:top-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 sm:space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-primary", children: "Live preview" }),
        preview && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 overflow-visible px-4 py-6 sm:gap-4 sm:px-2 sm:py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FutPlayerCard, { data: preview, captureId: "dashboard-fut-card", className: "w-full" }),
          username && /* @__PURE__ */ jsxRuntimeExports.jsx(ShareCardButton, { captureId: "dashboard-fut-card", publicPath: `/players/${username.toLowerCase()}?sport=${sport}` })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "order-2 min-w-0 space-y-4 sm:space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardBuilderSection, { title: "Identity", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => fileRef.current?.click(), className: "relative mx-auto flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-primary/40 bg-[#0B130E] hover:border-primary sm:mx-0", children: [
            avatarPreviewUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatarPreviewUrl, alt: "", className: "h-full w-full object-cover" }) : avatarInventoryId ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl", children: avatars?.avatars?.find((a) => a.id === avatarInventoryId)?.emoji ?? "👤" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-7 w-7 text-primary/70" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", accept: "image/jpeg,image/png", className: "hidden", onChange: (e) => onAvatarPick(e.target.files?.[0]) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid flex-1 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Card name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: cardName, onChange: (e) => setCardName(e.target.value.toUpperCase().slice(0, 18)), placeholder: "MESSI", className: "bg-[#0B130E]" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Full name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: fullName, onChange: (e) => setFullName(e.target.value), placeholder: "Full name", className: "bg-[#0B130E]" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Public username" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: username, onChange: (e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")), placeholder: "yourname", className: "bg-[#0B130E]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "/players/",
                username || "username"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Or pick avatar" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: avatarInventoryId ?? "", onChange: (e) => {
                setAvatarInventoryId(e.target.value || null);
                if (e.target.value) setAvatarPreviewUrl(null);
              }, className: "h-10 w-full rounded-lg border border-[#1E3A27] bg-[#0B130E] px-3 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Upload custom photo" }),
                (avatars?.avatars ?? []).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: a.id, children: [
                  a.emoji,
                  " ",
                  a.label
                ] }, a.id))
              ] })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardBuilderSection, { title: "Nationality", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PillGroup, { scroll: true, children: (flags?.flags ?? []).map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Pill, { selected: flagId === f.id, onClick: () => setFlagId(f.id), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: f.emoji }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: f.name })
        ] }, f.id)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardBuilderSection, { title: "Position", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PillGroup, { scroll: true, children: config.positions.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { selected: position === p, onClick: () => setPosition(p), children: p }, p)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardBuilderSection, { title: "Skill level", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-xs text-muted-foreground", children: "Self-selected tag shown on your player card." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PillGroup, { children: PLAYER_SKILL_LEVELS.map((level) => /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { selected: skillLevel === level, onClick: () => setSkillLevel(level), children: PLAYER_SKILL_LEVEL_LABELS[level] }, level)) })
        ] }),
        config.showClub && /* @__PURE__ */ jsxRuntimeExports.jsx(CardBuilderSection, { title: "Club / Team", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PillGroup, { scroll: true, children: (clubs?.clubs ?? []).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Pill, { selected: clubId === c.id, onClick: () => setClubId(c.id), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c.badgeEmoji }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c.name })
        ] }, c.id)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardBuilderSection, { title: "Stats", children: preview && /* @__PURE__ */ jsxRuntimeExports.jsx(CardBuilderStatsPanel, { sport, card: preview, matches: data?.matches ?? [], goalsByTurf: data?.goalsByTurf ?? [] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardBuilderSection, { title: "Card attributes", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-xs text-muted-foreground", children: "FIFA-style ratings — cosmetic only, separate from verified match stats." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6", children: config.attributes.map((attr) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: attr.key }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 99, value: cardRatings[attr.key] ?? config.defaultRatings[attr.key], onChange: (e) => setCardRatings((prev) => ({
              ...prev,
              [attr.key]: Number(e.target.value)
            })), className: "mt-1 bg-[#0B130E]" })
          ] }, attr.key)) })
        ] }),
        sport === "football" && /* @__PURE__ */ jsxRuntimeExports.jsx(CardBuilderSection, { title: "Jersey & foot", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Jersey #" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 99, value: jerseyNumber, onChange: (e) => setJerseyNumber(e.target.value), className: "bg-[#0B130E]" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Preferred foot" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: preferredFoot, onChange: (e) => setPreferredFoot(e.target.value), className: "h-10 rounded-lg border border-[#1E3A27] bg-[#0B130E] px-3 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "right", children: "Right" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "left", children: "Left" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "both", children: "Both" })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-3 rounded-xl border border-[#1E3A27] bg-[#142219] p-4 sm:rounded-2xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Show this sport card on public profile" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: isPublic, onCheckedChange: setIsPublic })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky bottom-3 z-10 -mx-1 rounded-xl border border-[#1E3A27]/80 bg-[#0B130E]/95 p-3 backdrop-blur-sm sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none md:static", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onSave, disabled: saving, className: "glow-primary h-11 w-full sm:h-10 md:w-auto", children: saving ? "Saving…" : `Save ${config.name} card` }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-xl border border-[#1E3A27]/80 bg-[#142219] p-4 sm:rounded-2xl sm:p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: "Match history" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Verified scorelines from partner turfs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MatchHistoryList, { matches: data?.matches ?? [], sportFilter: sport }) })
    ] })
  ] });
}
export {
  MyBookiesDashboard as component
};
