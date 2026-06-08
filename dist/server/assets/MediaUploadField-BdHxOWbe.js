import { j as createLucideIcon, B as Button, X, g as cn, P as toast } from "./router-B-HLs4zM.js";
import { _ as reactExports, Q as jsxRuntimeExports } from "./server-BB13nDRL.js";
import { u as useServerFn } from "./useServerFn-DC926L-8.js";
import { u as uploadMediaFile, a as uploadMediaFileToHostinger } from "./upload-client-B5081g41.js";
import { b as acceptAttrForCategory } from "./config-B_G86tQ8.js";
import { r as resolveMediaUrl } from "./urls-DPcy6Sd_.js";
import { L as Label } from "./label-Cs0Scvn0.js";
const __iconNode$1 = [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
];
const Trash2 = createLucideIcon("trash-2", __iconNode$1);
const __iconNode = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
const Upload = createLucideIcon("upload", __iconNode);
function MediaUploadField({
  category,
  value,
  onChange,
  label = "Upload image",
  hint,
  previewClassName,
  showUrl = true
}) {
  const inputRef = reactExports.useRef(null);
  const uploadFn = useServerFn(uploadMediaFile);
  const [uploading, setUploading] = reactExports.useState(false);
  const onPick = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadMediaFileToHostinger(file, category, uploadFn);
      onChange(result.path);
      toast.success("Uploaded to Hostinger");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };
  const preview = value ? resolveMediaUrl(value) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase tracking-wider text-muted-foreground", children: label }),
    preview && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("relative overflow-hidden rounded-xl border border-border/60 bg-muted/20", previewClassName), children: [
      category === "videos" ? /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: preview, controls: true, className: "max-h-48 w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: preview, alt: "", className: "max-h-48 w-full object-cover" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          size: "icon",
          variant: "secondary",
          className: "absolute right-2 top-2 h-8 w-8",
          onClick: () => onChange(null),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", disabled: uploading, onClick: () => inputRef.current?.click(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "mr-1 h-4 w-4" }),
        uploading ? "Uploading…" : preview ? "Replace" : "Choose file"
      ] }),
      showUrl && value && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-xs text-muted-foreground", children: value })
    ] }),
    hint && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: hint }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        ref: inputRef,
        type: "file",
        accept: acceptAttrForCategory(category),
        className: "hidden",
        onChange: (e) => onPick(e.target.files?.[0])
      }
    )
  ] });
}
export {
  MediaUploadField as M,
  Trash2 as T
};
