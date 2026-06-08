import { l as createSsrRpc } from "./router-BRNBRDAB.js";
import { l as createServerFn } from "./server-CeBVfatq.js";
import { r as requireSupabaseAuth } from "./auth-middleware-CjXxbB1V.js";
import { M as MEDIA_CATEGORIES, a as MEDIA_CATEGORY_CONFIG } from "./config-B_G86tQ8.js";
import { o as objectType, s as stringType, e as enumType } from "./types-DeUvCBv7.js";
import { s as supabase } from "./client-DbP4T9yH.js";
const uploadSchema = objectType({
  category: enumType(MEDIA_CATEGORIES),
  mimeType: stringType().min(3).max(120),
  fileName: stringType().max(200).optional(),
  dataBase64: stringType().min(1).max(7e6)
});
const uploadMediaFile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => uploadSchema.parse(input)).handler(createSsrRpc("399ac8545268e2fdce54dfeee2b42c34bf8487e7670753bba5a9328a878d88b2"));
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}
function validateMediaFile(file, category) {
  const config = MEDIA_CATEGORY_CONFIG[category];
  if (!config.mimeTypes.includes(file.type)) {
    return `Use ${config.mimeTypes.map((m) => m.replace("image/", "").replace("video/", "")).join(", ")}`;
  }
  if (file.size > config.maxBytes) {
    const mb = Math.round(config.maxBytes / (1024 * 1024));
    return `File must be under ${mb} MB`;
  }
  return null;
}
async function uploadMediaFileToHostinger(file, category, uploadFn) {
  const error = validateMediaFile(file, category);
  if (error) throw new Error(error);
  if (category === "videos") {
    return uploadMediaMultipart(file, category);
  }
  const dataBase64 = await fileToBase64(file);
  return uploadFn({
    data: {
      category,
      mimeType: file.type,
      fileName: file.name,
      dataBase64
    }
  });
}
async function uploadMediaMultipart(file, category) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Please log in to upload");
  const form = new FormData();
  form.append("category", category);
  form.append("file", file);
  const res = await fetch("/api/media/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Upload failed");
  return { path: body.path, url: body.url };
}
export {
  uploadMediaFileToHostinger as a,
  uploadMediaFile as u
};
