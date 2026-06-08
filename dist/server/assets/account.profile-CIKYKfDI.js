import { _ as reactExports, Q as jsxRuntimeExports } from "./server-C1SlovkB.js";
import { _ as useQueryClient, B as Button, L as Link, U as toast } from "./router-Dx7LtDHP.js";
import { u as useQuery } from "./useQuery-CX216jFu.js";
import { u as useServerFn } from "./useServerFn-ChSn65jp.js";
import { s as supabase } from "./client-DbP4T9yH.js";
import { g as getMyProfile, u as updateMyProfile } from "./account.functions-DAmeGXGe.js";
import { I as Input } from "./input-BLVciLwu.js";
import { L as Label } from "./label-DAgH9NPC.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./urls-l-aaheEG.js";
import "./auth-middleware-B3M4xANW.js";
import "./index-BlRNeFf7.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
import "./useBaseQuery-BAJP6Nx0.js";
function AccountProfile() {
  const getFn = useServerFn(getMyProfile);
  const saveFn = useServerFn(updateMyProfile);
  const qc = useQueryClient();
  const {
    data: profile,
    isLoading
  } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getFn()
  });
  const [fullName, setFullName] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  const [newPassword, setNewPassword] = reactExports.useState("");
  const [confirmPassword, setConfirmPassword] = reactExports.useState("");
  const [changingPassword, setChangingPassword] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);
  const onSave = async () => {
    try {
      await saveFn({
        data: {
          full_name: fullName,
          phone
        }
      });
      toast.success("Profile updated");
      qc.invalidateQueries({
        queryKey: ["my-profile"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  };
  const onChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setChangingPassword(true);
    try {
      const {
        error
      } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      toast.success("Password updated");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update password");
    } finally {
      setChangingPassword(false);
    }
  };
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Loading…" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Update your account details." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md space-y-4 rounded-2xl border border-border/60 bg-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: profile?.email ?? "", disabled: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Full name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: fullName, onChange: (e) => setFullName(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: phone, onChange: (e) => setPhone(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onSave, children: "Save changes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Want a shareable player page?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/account/card", className: "font-medium text-primary hover:underline", children: "Open My Player Card →" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md space-y-4 rounded-2xl border border-border/60 bg-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: "Change password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
          "Update while logged in, or use",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/forgot-password", className: "font-medium text-primary hover:underline", children: "forgot password" }),
          " ",
          "if you can't sign in."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "new-password", children: "New password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "new-password", type: "password", minLength: 6, autoComplete: "new-password", value: newPassword, onChange: (e) => setNewPassword(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "confirm-password", children: "Confirm new password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "confirm-password", type: "password", minLength: 6, autoComplete: "new-password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: onChangePassword, disabled: changingPassword || !newPassword, children: changingPassword ? "Updating…" : "Update password" })
    ] })
  ] });
}
export {
  AccountProfile as component
};
