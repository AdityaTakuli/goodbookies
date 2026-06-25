import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { venueMediaSrc, type VenueMediaItem } from "@/lib/venue-media";

export function VenueMediaGallery({
  items,
  alt,
  className,
}: {
  items: VenueMediaItem[];
  alt: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const count = items.length;
  const current = items[index];

  const go = useCallback(
    (delta: number) => {
      if (count === 0) return;
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  if (!current) {
    return (
      <div
        className={cn(
          "flex aspect-[16/10] items-center justify-center rounded-2xl border border-border/60 bg-muted text-sm text-muted-foreground",
          className,
        )}
      >
        No photos yet
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border/60", className)}>
      <div className="relative aspect-[16/10] bg-black">
        {current.type === "video" ? (
          <video
            key={current.url}
            src={venueMediaSrc(current.url)}
            controls
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            key={current.url}
            src={venueMediaSrc(current.url)}
            alt={current.label ?? alt}
            width={1280}
            height={800}
            className="h-full w-full object-cover"
          />
        )}
        {count > 1 && (
          <>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute left-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-background/80 shadow-md backdrop-blur"
              onClick={() => go(-1)}
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute right-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-background/80 shadow-md backdrop-blur"
              onClick={() => go(1)}
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-background/70 px-2 py-1 backdrop-blur">
              {items.map((item, i) => (
                <button
                  key={`${item.url}-${i}`}
                  type="button"
                  aria-label={`Show slide ${i + 1}`}
                  className={cn(
                    "h-2 w-2 rounded-full transition-colors",
                    i === index ? "bg-primary" : "bg-muted-foreground/40",
                  )}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto border-t border-border/40 bg-card/50 p-2">
          {items.map((item, i) => (
            <button
              key={`thumb-${item.url}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                i === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              {item.type === "video" ? (
                <span className="flex h-full w-full items-center justify-center bg-muted text-[10px] font-semibold">
                  Video
                </span>
              ) : (
                <img
                  src={venueMediaSrc(item.url)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
