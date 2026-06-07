import { supabase } from "@/integrations/supabase/client";
import { MEDIA_CATEGORY_CONFIG, type MediaCategory } from "@/lib/media/config";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export function validateMediaFile(file: File, category: MediaCategory): string | null {
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

type UploadResult = { path: string; url: string };

export async function uploadMediaFileToHostinger(
  file: File,
  category: MediaCategory,
  uploadFn: (input: {
    data: { category: MediaCategory; mimeType: string; fileName: string; dataBase64: string };
  }) => Promise<UploadResult>,
): Promise<UploadResult> {
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
      dataBase64,
    },
  });
}

async function uploadMediaMultipart(file: File, category: MediaCategory): Promise<UploadResult> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Please log in to upload");

  const form = new FormData();
  form.append("category", category);
  form.append("file", file);

  const res = await fetch("/api/media/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const body = (await res.json()) as UploadResult & { error?: string };
  if (!res.ok) throw new Error(body.error ?? "Upload failed");
  return { path: body.path, url: body.url };
}
