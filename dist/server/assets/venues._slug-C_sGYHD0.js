import { _ as reactExports, Q as jsxRuntimeExports, l as createServerFn } from "./server-DguIdkF6.js";
import { j as createLucideIcon, g as cn, U as useComposedRefs$1, l as createSsrRpc, T as useAuth, W as useQueryClient, B as Button, P as toast, c as Route, Y as venueQO, V as useNavigate, i as createBooking, r as getSlots, L as Link } from "./router-CkgIW5W3.js";
import { u as useQuery } from "./useQuery-B6Zt-pmO.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-BzsNYdIY.js";
import { u as useServerFn } from "./useServerFn-DVEtyvD9.js";
import { M as MotionConfigContext, i as isHTMLElement, u as useConstant, P as PresenceContext, b as usePresence, a as useIsomorphicLayoutEffect, L as LayoutGroupContext, m as motion } from "./proxy-PjYjX-x1.js";
import { P as Primitive, u as useControllableState, c as composeEventHandlers, b as createContextScope } from "./index-BtPT87LN.js";
import { u as usePrevious, a as useSize } from "./index-DsQDfNCx.js";
import { P as Presence } from "./index-Dq1mGqIB.js";
import { a as resolveVenueImage } from "./urls-DPcy6Sd_.js";
import { o as objectType, s as stringType, n as numberType, d as requireSupabaseAuth } from "./auth-middleware-BzNK9A7c.js";
import { T as Textarea } from "./textarea-26yi-9MR.js";
import { S as Star } from "./star-BDswSVAR.js";
import { C as CreditCard } from "./credit-card-DPUmabZa.js";
import { I as IndianRupee } from "./indian-rupee-NigBJzOv.js";
import { M as MIN_ORDER_PAISE } from "./checkout-B_yq9Hb8.js";
import { r as readPublicRazorpayKeyId } from "./client-DbP4T9yH.js";
import { M as MapPin } from "./map-pin-sZuZ9AbY.js";
import { C as Clock } from "./clock-B6nCQgYw.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./player-sports-D0yo17RI.js";
import "./useBaseQuery-Ds6kbUhW.js";
import "./index-BlRNeFf7.js";
import "./client.server-CQTuKCic.js";
import "./razorpay-DwVM9bks.js";
import "node:crypto";
const __iconNode$2 = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]];
const Check = createLucideIcon("check", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
      key: "18887p"
    }
  ]
];
const MessageSquare = createLucideIcon("message-square", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const ShieldCheck = createLucideIcon("shield-check", __iconNode);
function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup === "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup === "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}
function useComposedRefs(...refs) {
  return reactExports.useCallback(composeRefs(...refs), refs);
}
class PopChildMeasure extends reactExports.Component {
  getSnapshotBeforeUpdate(prevProps) {
    const element = this.props.childRef.current;
    if (isHTMLElement(element) && prevProps.isPresent && !this.props.isPresent && this.props.pop !== false) {
      const parent = element.offsetParent;
      const parentWidth = isHTMLElement(parent) ? parent.offsetWidth || 0 : 0;
      const parentHeight = isHTMLElement(parent) ? parent.offsetHeight || 0 : 0;
      const computedStyle = getComputedStyle(element);
      const size = this.props.sizeRef.current;
      size.height = parseFloat(computedStyle.height);
      size.width = parseFloat(computedStyle.width);
      size.top = element.offsetTop;
      size.left = element.offsetLeft;
      size.right = parentWidth - size.width - size.left;
      size.bottom = parentHeight - size.height - size.top;
      size.direction = computedStyle.direction;
    }
    return null;
  }
  /**
   * Required with getSnapshotBeforeUpdate to stop React complaining.
   */
  componentDidUpdate() {
  }
  render() {
    return this.props.children;
  }
}
function PopChild({ children, isPresent, anchorX, anchorY, root, pop }) {
  const id = reactExports.useId();
  const ref = reactExports.useRef(null);
  const size = reactExports.useRef({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    direction: "ltr"
  });
  const { nonce } = reactExports.useContext(MotionConfigContext);
  const childRef = children.props?.ref ?? children?.ref;
  const composedRef = useComposedRefs(ref, childRef);
  reactExports.useInsertionEffect(() => {
    const { width, height, top, left, right, bottom, direction } = size.current;
    if (isPresent || pop === false || !ref.current || !width || !height)
      return;
    const isRTL = direction === "rtl";
    const x = anchorX === "left" ? isRTL ? `right: ${right}` : `left: ${left}` : isRTL ? `left: ${left}` : `right: ${right}`;
    const y = anchorY === "bottom" ? `bottom: ${bottom}` : `top: ${top}`;
    ref.current.dataset.motionPopId = id;
    const style = document.createElement("style");
    if (nonce)
      style.nonce = nonce;
    const parent = root ?? document.head;
    parent.appendChild(style);
    if (style.sheet) {
      style.sheet.insertRule(`
          [data-motion-pop-id="${id}"] {
            position: absolute !important;
            width: ${width}px !important;
            height: ${height}px !important;
            ${x}px !important;
            ${y}px !important;
          }
        `);
    }
    return () => {
      ref.current?.removeAttribute("data-motion-pop-id");
      if (parent.contains(style)) {
        parent.removeChild(style);
      }
    };
  }, [isPresent]);
  return jsxRuntimeExports.jsx(PopChildMeasure, { isPresent, childRef: ref, sizeRef: size, pop, children: pop === false ? children : reactExports.cloneElement(children, { ref: composedRef }) });
}
const PresenceChild = ({ children, initial, isPresent, onExitComplete, custom, presenceAffectsLayout, mode, anchorX, anchorY, root }) => {
  const presenceChildren = useConstant(newChildrenMap);
  const id = reactExports.useId();
  let isReusedContext = true;
  let context = reactExports.useMemo(() => {
    isReusedContext = false;
    return {
      id,
      initial,
      isPresent,
      custom,
      onExitComplete: (childId) => {
        presenceChildren.set(childId, true);
        for (const isComplete of presenceChildren.values()) {
          if (!isComplete)
            return;
        }
        onExitComplete && onExitComplete();
      },
      register: (childId) => {
        presenceChildren.set(childId, false);
        return () => presenceChildren.delete(childId);
      }
    };
  }, [isPresent, presenceChildren, onExitComplete]);
  if (presenceAffectsLayout && isReusedContext) {
    context = { ...context };
  }
  reactExports.useMemo(() => {
    presenceChildren.forEach((_, key) => presenceChildren.set(key, false));
  }, [isPresent]);
  reactExports.useEffect(() => {
    !isPresent && !presenceChildren.size && onExitComplete && onExitComplete();
  }, [isPresent]);
  children = jsxRuntimeExports.jsx(PopChild, { pop: mode === "popLayout", isPresent, anchorX, anchorY, root, children });
  return jsxRuntimeExports.jsx(PresenceContext.Provider, { value: context, children });
};
function newChildrenMap() {
  return /* @__PURE__ */ new Map();
}
const getChildKey = (child) => child.key || "";
function onlyElements(children) {
  const filtered = [];
  reactExports.Children.forEach(children, (child) => {
    if (reactExports.isValidElement(child))
      filtered.push(child);
  });
  return filtered;
}
const AnimatePresence = ({ children, custom, initial = true, onExitComplete, presenceAffectsLayout = true, mode = "sync", propagate = false, anchorX = "left", anchorY = "top", root }) => {
  const [isParentPresent, safeToRemove] = usePresence(propagate);
  const presentChildren = reactExports.useMemo(() => onlyElements(children), [children]);
  const presentKeys = propagate && !isParentPresent ? [] : presentChildren.map(getChildKey);
  const isInitialRender = reactExports.useRef(true);
  const pendingPresentChildren = reactExports.useRef(presentChildren);
  const exitComplete = useConstant(() => /* @__PURE__ */ new Map());
  const exitingComponents = reactExports.useRef(/* @__PURE__ */ new Set());
  const [diffedChildren, setDiffedChildren] = reactExports.useState(presentChildren);
  const [renderedChildren, setRenderedChildren] = reactExports.useState(presentChildren);
  useIsomorphicLayoutEffect(() => {
    isInitialRender.current = false;
    pendingPresentChildren.current = presentChildren;
    for (let i = 0; i < renderedChildren.length; i++) {
      const key = getChildKey(renderedChildren[i]);
      if (!presentKeys.includes(key)) {
        if (exitComplete.get(key) !== true) {
          exitComplete.set(key, false);
        }
      } else {
        exitComplete.delete(key);
        exitingComponents.current.delete(key);
      }
    }
  }, [renderedChildren, presentKeys.length, presentKeys.join("-")]);
  const exitingChildren = [];
  if (presentChildren !== diffedChildren) {
    let nextChildren = [...presentChildren];
    for (let i = 0; i < renderedChildren.length; i++) {
      const child = renderedChildren[i];
      const key = getChildKey(child);
      if (!presentKeys.includes(key)) {
        nextChildren.splice(i, 0, child);
        exitingChildren.push(child);
      }
    }
    if (mode === "wait" && exitingChildren.length) {
      nextChildren = exitingChildren;
    }
    setRenderedChildren(onlyElements(nextChildren));
    setDiffedChildren(presentChildren);
    return null;
  }
  const { forceRender } = reactExports.useContext(LayoutGroupContext);
  return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: renderedChildren.map((child) => {
    const key = getChildKey(child);
    const isPresent = propagate && !isParentPresent ? false : presentChildren === renderedChildren || presentKeys.includes(key);
    const onExit = () => {
      if (exitingComponents.current.has(key)) {
        return;
      }
      if (exitComplete.has(key)) {
        exitingComponents.current.add(key);
        exitComplete.set(key, true);
      } else {
        return;
      }
      let isEveryExitComplete = true;
      exitComplete.forEach((isExitComplete) => {
        if (!isExitComplete)
          isEveryExitComplete = false;
      });
      if (isEveryExitComplete) {
        forceRender?.();
        setRenderedChildren(pendingPresentChildren.current);
        propagate && safeToRemove?.();
        onExitComplete && onExitComplete();
      }
    };
    return jsxRuntimeExports.jsx(PresenceChild, { isPresent, initial: !isInitialRender.current || initial ? void 0 : false, custom, presenceAffectsLayout, mode, root, onExitComplete: isPresent ? void 0 : onExit, anchorX, anchorY, children: child }, key);
  }) });
};
function fmt(h) {
  const ampm = h < 12 ? "AM" : "PM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:00 ${ampm}`;
}
function SlotPicker({
  slots,
  selected,
  onToggle
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 bg-pitch opacity-25" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-x-6 top-1/2 h-px bg-white/20" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: slots.map((slot) => {
      const isSelected = selected.includes(slot.hour);
      const isFull = slot.status === "booked" || (slot.remaining_capacity ?? 0) <= 0;
      const isVacant = !isFull && (slot.booked_players ?? 0) === 0;
      const isPartial = !isFull && (slot.booked_players ?? 0) > 0;
      const hasOpenLobby = Boolean(slot.open_lobby_booking_id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.button,
        {
          disabled: !slot.available,
          onClick: () => onToggle(slot.hour),
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.2, delay: slot.hour * 0.015 },
          whileHover: slot.available ? { scale: 1.05 } : {},
          whileTap: slot.available ? { scale: 0.95 } : {},
          className: cn(
            "relative rounded-xl border px-2 py-3 text-sm font-medium transition-colors",
            isFull && "cursor-not-allowed border-border/40 bg-muted/40 text-muted-foreground line-through",
            isPartial && slot.available && !isSelected && "border-amber-500/40 bg-amber-500/10 text-foreground hover:border-amber-500",
            isVacant && slot.available && !isSelected && "border-emerald-500/40 bg-emerald-500/10 text-foreground hover:border-emerald-500",
            !isFull && !isPartial && !isVacant && slot.available && !isSelected && "border-primary/30 bg-background/60 text-foreground hover:border-primary hover:bg-primary/10",
            isSelected && "border-primary bg-primary text-primary-foreground glow-primary"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: fmt(slot.hour) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[10px] opacity-80", children: isFull ? "Full" : isVacant ? "Vacant" : `${slot.remaining_capacity ?? 0}/${slot.total_capacity ?? 0} left` }),
            hasOpenLobby && !isFull && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-[9px] font-semibold text-primary", children: "Join match" }),
            slot.is_private_game && isPartial && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-[9px] text-muted-foreground", children: "Private" }),
            isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.span,
              {
                layoutId: "slot-ripple",
                className: "pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary/60"
              }
            )
          ]
        },
        slot.hour
      );
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 rounded-sm border border-primary/40 bg-background" }),
        " Available"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 rounded-sm bg-primary glow-primary" }),
        " Selected"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 rounded-sm bg-muted/60" }),
        " Booked"
      ] })
    ] })
  ] });
}
var CHECKBOX_NAME = "Checkbox";
var [createCheckboxContext] = createContextScope(CHECKBOX_NAME);
var [CheckboxProviderImpl, useCheckboxContext] = createCheckboxContext(CHECKBOX_NAME);
function CheckboxProvider(props) {
  const {
    __scopeCheckbox,
    checked: checkedProp,
    children,
    defaultChecked,
    disabled,
    form,
    name,
    onCheckedChange,
    required,
    value = "on",
    // @ts-expect-error
    internal_do_not_use_render
  } = props;
  const [checked, setChecked] = useControllableState({
    prop: checkedProp,
    defaultProp: defaultChecked ?? false,
    onChange: onCheckedChange,
    caller: CHECKBOX_NAME
  });
  const [control, setControl] = reactExports.useState(null);
  const [bubbleInput, setBubbleInput] = reactExports.useState(null);
  const hasConsumerStoppedPropagationRef = reactExports.useRef(false);
  const isFormControl = control ? !!form || !!control.closest("form") : (
    // We set this to true by default so that events bubble to forms without JS (SSR)
    true
  );
  const context = {
    checked,
    disabled,
    setChecked,
    control,
    setControl,
    name,
    form,
    value,
    hasConsumerStoppedPropagationRef,
    required,
    defaultChecked: isIndeterminate(defaultChecked) ? false : defaultChecked,
    isFormControl,
    bubbleInput,
    setBubbleInput
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    CheckboxProviderImpl,
    {
      scope: __scopeCheckbox,
      ...context,
      children: isFunction(internal_do_not_use_render) ? internal_do_not_use_render(context) : children
    }
  );
}
var TRIGGER_NAME = "CheckboxTrigger";
var CheckboxTrigger = reactExports.forwardRef(
  ({ __scopeCheckbox, onKeyDown, onClick, ...checkboxProps }, forwardedRef) => {
    const {
      control,
      value,
      disabled,
      checked,
      required,
      setControl,
      setChecked,
      hasConsumerStoppedPropagationRef,
      isFormControl,
      bubbleInput
    } = useCheckboxContext(TRIGGER_NAME, __scopeCheckbox);
    const composedRefs = useComposedRefs$1(forwardedRef, setControl);
    const initialCheckedStateRef = reactExports.useRef(checked);
    reactExports.useEffect(() => {
      const form = control?.form;
      if (form) {
        const reset = () => setChecked(initialCheckedStateRef.current);
        form.addEventListener("reset", reset);
        return () => form.removeEventListener("reset", reset);
      }
    }, [control, setChecked]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        role: "checkbox",
        "aria-checked": isIndeterminate(checked) ? "mixed" : checked,
        "aria-required": required,
        "data-state": getState(checked),
        "data-disabled": disabled ? "" : void 0,
        disabled,
        value,
        ...checkboxProps,
        ref: composedRefs,
        onKeyDown: composeEventHandlers(onKeyDown, (event) => {
          if (event.key === "Enter") event.preventDefault();
        }),
        onClick: composeEventHandlers(onClick, (event) => {
          setChecked((prevChecked) => isIndeterminate(prevChecked) ? true : !prevChecked);
          if (bubbleInput && isFormControl) {
            hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
            if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
          }
        })
      }
    );
  }
);
CheckboxTrigger.displayName = TRIGGER_NAME;
var Checkbox$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeCheckbox,
      name,
      checked,
      defaultChecked,
      required,
      disabled,
      value,
      onCheckedChange,
      form,
      ...checkboxProps
    } = props;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      CheckboxProvider,
      {
        __scopeCheckbox,
        checked,
        defaultChecked,
        disabled,
        required,
        onCheckedChange,
        name,
        form,
        value,
        internal_do_not_use_render: ({ isFormControl }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CheckboxTrigger,
            {
              ...checkboxProps,
              ref: forwardedRef,
              __scopeCheckbox
            }
          ),
          isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
            CheckboxBubbleInput,
            {
              __scopeCheckbox
            }
          )
        ] })
      }
    );
  }
);
Checkbox$1.displayName = CHECKBOX_NAME;
var INDICATOR_NAME = "CheckboxIndicator";
var CheckboxIndicator = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeCheckbox, forceMount, ...indicatorProps } = props;
    const context = useCheckboxContext(INDICATOR_NAME, __scopeCheckbox);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Presence,
      {
        present: forceMount || isIndeterminate(context.checked) || context.checked === true,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.span,
          {
            "data-state": getState(context.checked),
            "data-disabled": context.disabled ? "" : void 0,
            ...indicatorProps,
            ref: forwardedRef,
            style: { pointerEvents: "none", ...props.style }
          }
        )
      }
    );
  }
);
CheckboxIndicator.displayName = INDICATOR_NAME;
var BUBBLE_INPUT_NAME = "CheckboxBubbleInput";
var CheckboxBubbleInput = reactExports.forwardRef(
  ({ __scopeCheckbox, ...props }, forwardedRef) => {
    const {
      control,
      hasConsumerStoppedPropagationRef,
      checked,
      defaultChecked,
      required,
      disabled,
      name,
      value,
      form,
      bubbleInput,
      setBubbleInput
    } = useCheckboxContext(BUBBLE_INPUT_NAME, __scopeCheckbox);
    const composedRefs = useComposedRefs$1(forwardedRef, setBubbleInput);
    const prevChecked = usePrevious(checked);
    const controlSize = useSize(control);
    reactExports.useEffect(() => {
      const input = bubbleInput;
      if (!input) return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        inputProto,
        "checked"
      );
      const setChecked = descriptor.set;
      const bubbles = !hasConsumerStoppedPropagationRef.current;
      if (prevChecked !== checked && setChecked) {
        const event = new Event("click", { bubbles });
        input.indeterminate = isIndeterminate(checked);
        setChecked.call(input, isIndeterminate(checked) ? false : checked);
        input.dispatchEvent(event);
      }
    }, [bubbleInput, prevChecked, checked, hasConsumerStoppedPropagationRef]);
    const defaultCheckedRef = reactExports.useRef(isIndeterminate(checked) ? false : checked);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.input,
      {
        type: "checkbox",
        "aria-hidden": true,
        defaultChecked: defaultChecked ?? defaultCheckedRef.current,
        required,
        disabled,
        name,
        value,
        form,
        ...props,
        tabIndex: -1,
        ref: composedRefs,
        style: {
          ...props.style,
          ...controlSize,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0,
          // We transform because the input is absolutely positioned but we have
          // rendered it **after** the button. This pulls it back to sit on top
          // of the button.
          transform: "translateX(-100%)"
        }
      }
    );
  }
);
CheckboxBubbleInput.displayName = BUBBLE_INPUT_NAME;
function isFunction(value) {
  return typeof value === "function";
}
function isIndeterminate(checked) {
  return checked === "indeterminate";
}
function getState(checked) {
  return isIndeterminate(checked) ? "indeterminate" : checked ? "checked" : "unchecked";
}
const Checkbox = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Checkbox$1,
  {
    ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckboxIndicator, { className: cn("grid place-content-center text-current"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = Checkbox$1.displayName;
const getVenueReviewSummary = createServerFn({
  method: "GET"
}).inputValidator((input) => objectType({
  venueId: stringType().uuid()
}).parse(input)).handler(createSsrRpc("22528b7ac4107cf764eb776714a3451ede0a14010118f92adaf42bb45b0b7b27"));
const listVenueReviews = createServerFn({
  method: "GET"
}).inputValidator((input) => objectType({
  venueId: stringType().uuid(),
  limit: numberType().int().min(1).max(50).default(20)
}).parse(input)).handler(createSsrRpc("0393ae12b7e9ee8887eb8f3d2b7472bd5365ed46889b244c7fb2a1a5acf1cbfd"));
const getMyVenueReviewState = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  venueId: stringType().uuid()
}).parse(input)).handler(createSsrRpc("d12ba334c8b70e2cbd1c9be5606f6f7e247300938cf0719ee13a33d44e55ad1a"));
const submitVenueReview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  venueId: stringType().uuid(),
  rating: numberType().int().min(1).max(5),
  comment: stringType().trim().min(10).max(2e3)
}).parse(input)).handler(createSsrRpc("a286131a78b19b5f9476fb6e0dc67d4962d48d92503ee648cf6b354af0e98b8d"));
function StarRow({
  value,
  size = "sm",
  interactive = false,
  onChange
}) {
  const sizeClass = size === "lg" ? "h-7 w-7" : size === "md" ? "h-5 w-5" : "h-4 w-4";
  const [hover, setHover] = reactExports.useState(0);
  const display = interactive ? hover || value : value;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-0.5", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      disabled: !interactive,
      onClick: () => onChange?.(star),
      onMouseEnter: () => interactive && setHover(star),
      onMouseLeave: () => interactive && setHover(0),
      className: interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default",
      "aria-label": `${star} star${star === 1 ? "" : "s"}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Star,
        {
          className: `${sizeClass} ${star <= display ? "fill-primary text-primary" : "text-muted-foreground/40"}`
        }
      )
    },
    star
  )) });
}
function formatReviewDate(iso) {
  return new Date(iso).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function VenueReviews({ venueId, venueName }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const summaryFn = useServerFn(getVenueReviewSummary);
  const listFn = useServerFn(listVenueReviews);
  const stateFn = useServerFn(getMyVenueReviewState);
  const submitFn = useServerFn(submitVenueReview);
  const [rating, setRating] = reactExports.useState(0);
  const [comment, setComment] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [showForm, setShowForm] = reactExports.useState(false);
  const { data: summary } = useQuery({
    queryKey: ["venue-review-summary", venueId],
    queryFn: () => summaryFn({ data: { venueId } })
  });
  const { data: reviews } = useQuery({
    queryKey: ["venue-reviews", venueId],
    queryFn: () => listFn({ data: { venueId, limit: 20 } })
  });
  const { data: myState } = useQuery({
    queryKey: ["my-venue-review", venueId],
    queryFn: () => stateFn({ data: { venueId } }),
    enabled: Boolean(user)
  });
  const total = summary?.totalReviews ?? 0;
  const avg = summary?.averageRating;
  const distribution = summary?.distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["venue-review-summary", venueId] });
    qc.invalidateQueries({ queryKey: ["venue-reviews", venueId] });
    qc.invalidateQueries({ queryKey: ["my-venue-review", venueId] });
    qc.invalidateQueries({ queryKey: ["venue", venueId] });
  };
  const openForm = () => {
    if (myState?.myReview) {
      setRating(myState.myReview.rating);
      setComment(myState.myReview.comment);
    }
    setShowForm(true);
  };
  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error("Please select a star rating");
      return;
    }
    if (comment.trim().length < 10) {
      toast.error("Please write at least 10 characters of feedback");
      return;
    }
    setSubmitting(true);
    try {
      await submitFn({ data: { venueId, rating, comment: comment.trim() } });
      toast.success(myState?.myReview ? "Review updated" : "Thanks for your review!");
      setShowForm(false);
      invalidate();
    } catch (e) {
      toast.error(e.message ?? "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "reviews", className: "mt-10 scroll-mt-24 rounded-2xl border border-border/60 bg-card p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center gap-2 font-display text-2xl font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-6 w-6 text-primary" }),
          "Reviews"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
          "Player feedback for ",
          venueName,
          " — like Google reviews for turfs"
        ] })
      ] }),
      user && myState?.canReview && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: openForm, children: myState.myReview ? "Edit your review" : "Write a review" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-6 md:grid-cols-[220px_1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-background/50 p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-5xl font-bold", children: avg != null ? avg.toFixed(1) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StarRow, { value: Math.round(avg ?? 0), size: "md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
          total,
          " review",
          total === 1 ? "" : "s"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [5, 4, 3, 2, 1].map((star) => {
        const count = distribution[star] ?? 0;
        const pct = total > 0 ? Math.round(count / total * 100) : 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "w-8 text-muted-foreground", children: [
            star,
            "★"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 flex-1 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary transition-all", style: { width: `${pct}%` } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-8 text-right text-muted-foreground", children: count })
        ] }, star);
      }) })
    ] }),
    user && !myState?.canReview && !myState?.myReview && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground", children: "Book and play here first — then you can leave a review for this turf." }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-xl border border-primary/30 bg-primary/5 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: myState?.myReview ? "Update your review" : "Share your experience" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-sm text-muted-foreground", children: "Your rating" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StarRow, { value: rating, size: "lg", interactive: true, onChange: setRating })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-sm text-muted-foreground", children: "Your feedback" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: comment,
            onChange: (e) => setComment(e.target.value),
            placeholder: "How was the pitch, facilities, staff, and value for money?",
            rows: 4,
            maxLength: 2e3
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
          comment.length,
          "/2000 · min 10 characters"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSubmit, disabled: submitting, children: submitting ? "Saving…" : myState?.myReview ? "Update review" : "Post review" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setShowForm(false), children: "Cancel" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 space-y-4", children: (reviews ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No reviews yet. Be the first to share feedback after you play." }) : reviews.map((review) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-xl border border-border/60 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: review.authorName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            formatReviewDate(review.createdAt),
            review.isEdited ? " · edited" : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StarRow, { value: review.rating, size: "sm" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm leading-relaxed text-foreground/90", children: review.comment })
    ] }, review.id)) })
  ] });
}
function BookingPaymentPortal({
  amount,
  playerCount,
  hours,
  venueName,
  disabled,
  loading,
  requiresPayment = true,
  awaitingCheckout = false,
  onPay,
  onOpenCheckout
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-2xl border border-primary/30 bg-gradient-to-b from-[#142219] to-card p-5 shadow-[var(--shadow-glow)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-primary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.2em]", children: "Payment portal" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Booking at ",
        venueName
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 flex items-center font-display text-3xl font-bold text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(IndianRupee, { className: "h-6 w-6" }),
        amount.toLocaleString()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
        hours,
        " hour",
        hours === 1 ? "" : "s",
        " · ",
        playerCount,
        " player",
        playerCount === 1 ? "" : "s"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-xl border border-[#1E3A27] bg-[#0B130E]/60 p-3 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: requiresPayment ? "Pay securely via Razorpay to confirm your slot. Your booking stays reserved until payment completes." : "No payment required — your booking will be confirmed immediately." })
    ] }),
    awaitingCheckout ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary", children: "Slot reserved. Open Razorpay checkout to complete payment." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "lg",
          className: "glow-primary h-12 w-full",
          disabled: loading,
          onClick: onOpenCheckout,
          children: loading ? "Opening…" : `Open Razorpay · Pay ₹${amount.toLocaleString()}`
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        size: "lg",
        className: "glow-primary h-12 w-full",
        disabled: disabled || loading,
        onClick: onPay,
        children: loading ? "Processing…" : requiresPayment ? `Pay ₹${amount.toLocaleString()} & confirm booking` : "Confirm booking"
      }
    )
  ] });
}
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  amount: numberType().int().min(MIN_ORDER_PAISE),
  currency: stringType().length(3).default("INR"),
  receipt: stringType().min(1).max(40).optional()
}).parse(input)).handler(createSsrRpc("79167d01055e7ca7df54dc70f34b74c07dc814b41e652ca2fabfc1b1237d5d53"));
const verifyBookingPayment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  razorpay_payment_id: stringType().min(1),
  razorpay_order_id: stringType().min(1),
  razorpay_signature: stringType().min(1),
  booking_id: stringType().uuid()
}).parse(input)).handler(createSsrRpc("5607daa85cfa41afc7e3db3fe53bd66008a98f835337c473f35efc1f582bd2ac"));
let scriptPromise = null;
function loadRazorpayScript() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}
function useRazorpayCheckout() {
  const verifyFn = useServerFn(verifyBookingPayment);
  const [paying, setPaying] = reactExports.useState(false);
  const openCheckout = reactExports.useCallback(
    async (input) => {
      const keyId = readPublicRazorpayKeyId();
      if (!keyId) {
        toast.error("Payment gateway is not configured");
        return false;
      }
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        toast.error("Could not load Razorpay checkout");
        return false;
      }
      setPaying(true);
      return new Promise((resolve) => {
        const rzp = new window.Razorpay({
          key: keyId,
          amount: input.amountPaise,
          currency: input.currency ?? "INR",
          name: input.title,
          description: input.description,
          order_id: input.orderId,
          prefill: {
            name: input.customerName,
            email: input.customerEmail
          },
          theme: { color: "#10b981" },
          handler: async (response) => {
            try {
              await verifyFn({
                data: {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  booking_id: input.bookingId
                }
              });
              toast.success("Payment successful — booking confirmed!");
              resolve(true);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Payment verification failed");
              resolve(false);
            } finally {
              setPaying(false);
            }
          },
          modal: {
            ondismiss: () => {
              toast.info("Payment cancelled");
              setPaying(false);
              resolve(false);
            }
          }
        });
        rzp.on("payment.failed", (response) => {
          toast.error(response.error?.description ?? "Payment failed");
          setPaying(false);
          resolve(false);
        });
        rzp.open();
      });
    },
    [verifyFn]
  );
  return { openCheckout, paying };
}
function todayISO() {
  const d = /* @__PURE__ */ new Date();
  return d.toISOString().slice(0, 10);
}
function VenuePage() {
  const {
    slug
  } = Route.useParams();
  const {
    data: venue
  } = useSuspenseQuery(venueQO(slug));
  const {
    user,
    isOwner,
    session
  } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const bookFn = useServerFn(createBooking);
  const {
    openCheckout,
    paying
  } = useRazorpayCheckout();
  const [date, setDate] = reactExports.useState(todayISO());
  const [selected, setSelected] = reactExports.useState([]);
  const [playerCount, setPlayerCount] = reactExports.useState(1);
  const [playerNames, setPlayerNames] = reactExports.useState([""]);
  const [isOpenLobby, setIsOpenLobby] = reactExports.useState(false);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [pendingCheckout, setPendingCheckout] = reactExports.useState(null);
  const slotsQuery = useQuery({
    queryKey: ["slots", venue.id, date, playerCount],
    queryFn: () => getSlots({
      data: {
        venueId: venue.id,
        date,
        playerCount
      }
    }),
    refetchInterval: 5e3
  });
  if (!venue) return null;
  const isOwnVenue = Boolean(user && venue.owner_id && user.id === venue.owner_id);
  const sortedSel = [...selected].sort((a, b) => a - b);
  const isContiguous = sortedSel.every((h, i) => i === 0 || h === sortedSel[i - 1] + 1);
  const total = venue.price_per_hour * selected.length;
  const maxPlayersAllowed = Math.max(1, Number(venue.max_players_allowed ?? 1));
  const slotByHour = new Map((slotsQuery.data ?? []).map((s) => [s.hour, s]));
  const minRemainingOnSelection = sortedSel.length ? Math.min(...sortedSel.map((h) => slotByHour.get(h)?.remaining_capacity ?? maxPlayersAllowed)) : maxPlayersAllowed;
  const maxSelectablePlayers = Math.max(1, Math.min(maxPlayersAllowed, minRemainingOnSelection));
  const alreadyBookedOnSelection = sortedSel.length ? Math.max(...sortedSel.map((h) => slotByHour.get(h)?.booked_players ?? 0)) : 0;
  const perPersonPrice = total > 0 ? Math.ceil(total / maxPlayersAllowed) : 0;
  const selectedSplitPrice = total > 0 ? Math.ceil(total / playerCount) : 0;
  const payableForSelectedPlayers = perPersonPrice * playerCount;
  const capacityAfterBooking = alreadyBookedOnSelection + playerCount;
  const capacityPercent = Math.round(capacityAfterBooking / maxPlayersAllowed * 100);
  const emptySpotsNow = (slotsQuery.data ?? []).reduce((sum, slot) => sum + Math.max(0, Number(slot.remaining_capacity ?? 0)), 0);
  reactExports.useEffect(() => {
    setPlayerNames((prev) => {
      const next = Array.from({
        length: playerCount
      }, (_, i) => prev[i] ?? "");
      return next;
    });
  }, [playerCount]);
  reactExports.useEffect(() => {
    if (playerCount > maxSelectablePlayers) {
      setPlayerCount(maxSelectablePlayers);
    }
  }, [maxSelectablePlayers, playerCount]);
  reactExports.useEffect(() => {
    const availableSet = new Set((slotsQuery.data ?? []).filter((s) => s.available).map((s) => s.hour));
    setSelected((prev) => prev.filter((h) => availableSet.has(h)));
  }, [slotsQuery.data]);
  const toggle = (h) => {
    setSelected((prev) => prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]);
  };
  async function handleOpenPayment() {
    if (!pendingCheckout || !venue) return;
    const paid = await openCheckout({
      bookingId: pendingCheckout.bookingId,
      orderId: pendingCheckout.orderId,
      amountPaise: pendingCheckout.amountPaise,
      title: "Good Bookies",
      description: `${venue.name} · ${date}`,
      customerName: pendingCheckout.customerName,
      customerEmail: session?.user?.email ?? void 0
    });
    if (paid) {
      const bookingId = pendingCheckout.bookingId;
      setPendingCheckout(null);
      await qc.invalidateQueries({
        queryKey: ["slots", venue.id, date]
      });
      navigate({
        to: "/booking/success",
        search: {
          id: bookingId
        }
      });
    }
  }
  async function handleBook() {
    if (!user) {
      toast.info("Sign in to confirm your booking");
      navigate({
        to: "/login",
        search: {
          redirect: `/venues/${slug}`
        }
      });
      return;
    }
    if (selected.length === 0) return;
    if (!isContiguous) {
      toast.error("Please select consecutive hours only");
      return;
    }
    const trimmedNames = playerNames.map((name) => name.trim());
    if (trimmedNames.some((name) => !name)) {
      toast.error("Please enter all player names");
      return;
    }
    const uniqueNames = new Set(trimmedNames.map((name) => name.toLowerCase()));
    if (uniqueNames.size !== trimmedNames.length) {
      toast.error("Each player name should be unique");
      return;
    }
    setSubmitting(true);
    try {
      const res = await bookFn({
        data: {
          venueId: venue.id,
          date,
          startHour: sortedSel[0],
          endHour: sortedSel[sortedSel.length - 1] + 1,
          playerCount,
          playerNames: trimmedNames,
          isOpenLobby: isOpenLobby && playerCount < maxPlayersAllowed
        }
      });
      if (res.requiresPayment && res.razorpayOrderId && res.amountPaise >= 100) {
        setPendingCheckout({
          bookingId: res.bookingId,
          orderId: res.razorpayOrderId,
          amountPaise: res.amountPaise,
          customerName: trimmedNames[0]
        });
        await qc.invalidateQueries({
          queryKey: ["slots", venue.id, date]
        });
        toast.message("Slot reserved", {
          description: "Click Open Razorpay below to pay and confirm."
        });
        return;
      }
      await qc.invalidateQueries({
        queryKey: ["slots", venue.id, date]
      });
      navigate({
        to: "/booking/success",
        search: {
          id: res.bookingId
        }
      });
    } catch (e) {
      toast.error(e.message ?? "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-8 lg:grid-cols-[1.5fr_1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 10
      }, animate: {
        opacity: 1,
        y: 0
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: resolveVenueImage(venue.image_url), alt: venue.name, width: 1280, height: 800, className: "aspect-[16/10] w-full object-cover" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary", children: [
            venue.sport?.icon,
            " ",
            venue.sport?.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 font-display text-4xl font-bold", children: venue.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" }),
              " ",
              venue.address,
              ", ",
              venue.city
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 fill-primary text-primary" }),
              venue.rating != null ? Number(venue.rating).toFixed(1) : "New",
              venue.review_count ? ` (${venue.review_count} reviews)` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }),
              " ",
              venue.opening_hour,
              ":00 – ",
              venue.closing_hour,
              ":00"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm font-semibold text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(IndianRupee, { className: "mb-0.5 mr-1 inline h-4 w-4" }),
            venue.price_per_hour.toLocaleString(),
            " per hour"
          ] }),
          venue.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-muted-foreground", children: venue.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: venue.amenities?.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full border border-border bg-card px-3 py-1 text-xs", children: a }, a)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-semibold", children: "Choose a date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: date, min: todayISO(), onChange: (e) => {
            setDate(e.target.value);
            setSelected([]);
          }, className: "mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-semibold", children: "Players in this booking" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: playerCount, onChange: (e) => setPlayerCount(Number(e.target.value)), className: "mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm", children: Array.from({
            length: maxSelectablePlayers
          }, (_, i) => i + 1).map((count) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: count, children: [
            count,
            " player",
            count === 1 ? "" : "s"
          ] }, count)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-muted-foreground", children: [
            "Max allowed on this turf: ",
            maxPlayersAllowed,
            sortedSel.length > 0 && ` · ${minRemainingOnSelection} spot${minRemainingOnSelection === 1 ? "" : "s"} left on selected slot`
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: sortedSel.length > 0 ? `Capacity on selected slot: ${alreadyBookedOnSelection} booked + ${playerCount} yours = ${capacityAfterBooking}/${maxPlayersAllowed}` : `Select a time slot to see live capacity` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-2 w-full overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary", style: {
            width: `${capacityPercent}%`
          } }) }),
          playerCount < maxPlayersAllowed && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: isOpenLobby, onCheckedChange: (v) => setIsOpenLobby(v === true), className: "mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Open this match to the public" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 block text-muted-foreground", children: "Let other players request to fill remaining spots on your slot." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-semibold", children: "Player names" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 grid gap-2", children: playerNames.map((name, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: name, placeholder: `Player ${idx + 1} name`, onChange: (e) => setPlayerNames((prev) => {
            const next = [...prev];
            next[idx] = e.target.value;
            return next;
          }), className: "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" }, idx)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-1 font-display text-xl font-semibold", children: "Available slots" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-3 text-xs text-muted-foreground", children: [
            "Live empty spots left today: ",
            emptySpotsNow
          ] }),
          slotsQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border/60 bg-card p-10 text-center text-muted-foreground", children: "Loading the pitch…" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SlotPicker, { slots: slotsQuery.data ?? [], selected, onToggle: toggle })
        ] }),
        isOwnVenue ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky bottom-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "This is your turf" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
            "Partners cannot book their own venue. Manage slots and bookings from",
            " ",
            isOwner ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/owner", className: "font-medium text-primary hover:underline", children: "Partner dashboard" }) : "Partner dashboard",
            ", or book a different turf as a player."
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { layout: true, className: "sticky bottom-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BookingPaymentPortal, { amount: payableForSelectedPlayers, playerCount, hours: selected.length, venueName: venue.name, disabled: selected.length === 0, loading: submitting || paying, requiresPayment: payableForSelectedPlayers >= 1, awaitingCheckout: Boolean(pendingCheckout), onPay: handleBook, onOpenCheckout: handleOpenPayment }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-border/50 bg-card/80 px-4 py-3 text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Full turf total: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(IndianRupee, { className: "mb-0.5 inline h-3 w-3" }),
            total.toLocaleString(),
            " · Per person (",
            playerCount,
            " selected):",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(IndianRupee, { className: "mb-0.5 inline h-3 w-3" }),
            selectedSplitPrice.toLocaleString()
          ] }) }),
          selected.length > 0 && !isContiguous && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: "Pick consecutive hours to book a continuous slot." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(VenueReviews, { venueId: venue.id, venueName: venue.name })
  ] });
}
export {
  VenuePage as component
};
