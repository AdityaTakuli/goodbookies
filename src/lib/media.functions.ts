import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MEDIA_CATEGORIES } from "@/lib/media/config";

const uploadSchema = z.object({
  category: z.enum(MEDIA_CATEGORIES),
  mimeType: z.string().min(3).max(120),
  fileName: z.string().max(200).optional(),
  dataBase64: z.string().min(1).max(7_000_000),
});

/** Upload image files to Hostinger disk (avatars, venue photos). Returns a /uploads/… path for Supabase. */
export const uploadMediaFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => uploadSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (data.category === "videos") {
      throw new Error("Use POST /api/media/upload for video files");
    }

    const { saveUploadedMediaForUser } = await import("@/lib/media/upload-service.server");
    const buffer = Buffer.from(data.dataBase64, "base64");
    const saved = await saveUploadedMediaForUser({
      userId: context.userId,
      category: data.category,
      buffer,
      mimeType: data.mimeType,
    });

    return { path: saved.path, url: saved.url };
  });
