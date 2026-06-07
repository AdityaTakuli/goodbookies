import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadMediaFile } from "@/lib/media.functions";
import { acceptAttrForCategory, type MediaCategory } from "@/lib/media/config";
import { uploadMediaFileToHostinger } from "@/lib/media/upload-client";
import { resolveMediaUrl } from "@/lib/media/urls";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  category: MediaCategory;
  value?: string | null;
  onChange: (path: string | null) => void;
  label?: string;
  hint?: string;
  previewClassName?: string;
  showUrl?: boolean;
};

export function MediaUploadField({
  category,
  value,
  onChange,
  label = "Upload image",
  hint,
  previewClassName,
  showUrl = true,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadFn = useServerFn(uploadMediaFile);
  const [uploading, setUploading] = useState(false);

  const onPick = async (file: File | undefined) => {
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

  return (
    <div className="grid gap-2">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {preview && (
        <div className={cn("relative overflow-hidden rounded-xl border border-border/60 bg-muted/20", previewClassName)}>
          {category === "videos" ? (
            <video src={preview} controls className="max-h-48 w-full object-cover" />
          ) : (
            <img src={preview} alt="" className="max-h-48 w-full object-cover" />
          )}
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute right-2 top-2 h-8 w-8"
            onClick={() => onChange(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
          <Upload className="mr-1 h-4 w-4" />
          {uploading ? "Uploading…" : preview ? "Replace" : "Choose file"}
        </Button>
        {showUrl && value && <span className="truncate text-xs text-muted-foreground">{value}</span>}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttrForCategory(category)}
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
    </div>
  );
}
