import { useState } from "react";
import { Download, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareCardButton({
  captureId,
  publicPath,
}: {
  captureId: string;
  publicPath: string;
}) {
  const [busy, setBusy] = useState(false);

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
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(node, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
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
        await navigator.share({ title: "My Good Bookies football card", url: fullUrl });
      } catch {
        /* user cancelled */
      }
      return;
    }
    copyLink();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" className="gap-2" onClick={copyLink}>
        <Link2 className="h-4 w-4" />
        Copy link
      </Button>
      <Button type="button" className="gap-2" onClick={downloadPng} disabled={busy}>
        <Download className="h-4 w-4" />
        {busy ? "Generating…" : "Download PNG"}
      </Button>
      <Button type="button" variant="secondary" className="gap-2" onClick={nativeShare}>
        <Share2 className="h-4 w-4" />
        Share
      </Button>
    </div>
  );
}
