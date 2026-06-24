import { Users, CheckCircle2, XCircle } from "lucide-react";
import { formatSlotRange } from "@/lib/slot-time";
import type { VenueDaySession } from "@/lib/slot-schedule";

export function VenueSlotSchedule({
  sessions,
  loading,
}: {
  sessions: VenueDaySession[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">
        Loading today&apos;s bookings…
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">
        No bookings on this date yet — the full turf is open.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <h2 className="font-display text-xl font-semibold">Today&apos;s bookings</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Live player count and whether individual entry is still possible for each window.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 text-xs text-muted-foreground">
              <th className="pb-2 pr-3 font-medium">Time</th>
              <th className="pb-2 pr-3 font-medium">Players</th>
              <th className="pb-2 font-medium">Individual entry</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={`${s.startMinute}-${s.endMinute}`} className="border-b border-border/40 last:border-0">
                <td className="py-3 pr-3 font-medium">
                  {formatSlotRange(s.startMinute, s.endMinute)}
                </td>
                <td className="py-3 pr-3">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    {s.bookedPlayers}/{s.totalCapacity}
                    {s.remainingCapacity > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({s.remainingCapacity} open)
                      </span>
                    )}
                  </span>
                </td>
                <td className="py-3">
                  {s.individualEntryAllowed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Yes{s.isOpenLobby ? " · open lobby" : ""}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <XCircle className="h-3.5 w-3.5" />
                      {s.isFullTurf ? "Full turf" : "No"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
