import { c as createServerRpc } from "./createServerRpc-D3buN9M5.js";
import { l as createServerFn } from "./server-BTKa9lBV.js";
import { o as objectType, s as stringType, e as enumType, d as requireSupabaseAuth } from "./auth-middleware-s-UfTcdV.js";
import { M as MEDIA_CATEGORIES } from "./config-B_G86tQ8.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-BlRNeFf7.js";
const uploadSchema = objectType({
  category: enumType(MEDIA_CATEGORIES),
  mimeType: stringType().min(3).max(120),
  fileName: stringType().max(200).optional(),
  dataBase64: stringType().min(1).max(7e6)
});
const uploadMediaFile_createServerFn_handler = createServerRpc({
  id: "399ac8545268e2fdce54dfeee2b42c34bf8487e7670753bba5a9328a878d88b2",
  name: "uploadMediaFile",
  filename: "src/lib/media.functions.ts"
}, (opts) => uploadMediaFile.__executeServer(opts));
const uploadMediaFile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => uploadSchema.parse(input)).handler(uploadMediaFile_createServerFn_handler, async ({
  context,
  data
}) => {
  if (data.category === "videos") {
    throw new Error("Use POST /api/media/upload for video files");
  }
  const {
    saveUploadedMediaForUser
  } = await import("./upload-service.server-DPPWCUBS.js");
  const buffer = Buffer.from(data.dataBase64, "base64");
  const saved = await saveUploadedMediaForUser({
    userId: context.userId,
    category: data.category,
    buffer,
    mimeType: data.mimeType
  });
  return {
    path: saved.path,
    url: saved.url
  };
});
export {
  uploadMediaFile_createServerFn_handler
};
