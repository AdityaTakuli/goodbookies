import { Users, UserPlus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatSlotRange } from "@/lib/slot-time";
import type { BookingSuggestion } from "@/lib/slot-schedule";

export function BookingConflictSuggestions({
  suggestions,
  onApply,
}: {
  suggestions: BookingSuggestion[];
  onApply: (suggestion: BookingSuggestion) => void;
}) {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
      <p className="text-sm font-semibold text-foreground">This slot overlaps another booking</p>
      <p className="text-xs text-muted-foreground">
        You can join the existing game if there is space, or pick the nearest open start time.
      </p>
      <div className="space-y-2">
        {suggestions.map((s) => (
          <div
            key={`${s.type}-${s.startMinute}-${s.endMinute}`}
            className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-medium">
                {s.type === "join" ? (
                  <UserPlus className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Clock className="h-4 w-4 shrink-0 text-primary" />
                )}
                {s.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {formatSlotRange(s.startMinute, s.endMinute)}
                {s.remainingCapacity != null && ` · ${s.remainingCapacity} spots open`}
              </p>
            </div>
            <Button type="button" size="sm" variant="outline" className="shrink-0" onClick={() => onApply(s)}>
              {s.type === "join" ? "Join this game" : "Use this time"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
