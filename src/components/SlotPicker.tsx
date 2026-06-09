import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatSlotTime } from "@/lib/slot-time";

export type Slot = {
  startMinute: number;
  available: boolean;
  status?: string;
  remaining_capacity?: number;
  booked_players?: number;
  total_capacity?: number;
  open_lobby_booking_id?: string | null;
  is_private_game?: boolean;
};

export function SlotPicker({
  slots,
  selected,
  onToggle,
}: {
  slots: Slot[];
  selected: number[];
  onToggle: (startMinute: number) => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="pointer-events-none absolute inset-0 bg-pitch opacity-25" />
      <div className="pointer-events-none absolute inset-x-6 top-1/2 h-px bg-white/20" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />

      <div className="relative grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        <AnimatePresence>
          {slots.map((slot, index) => {
            const isSelected = selected.includes(slot.startMinute);
            const isFull = slot.status === "booked" || (slot.remaining_capacity ?? 0) <= 0;
            const isVacant = !isFull && (slot.booked_players ?? 0) === 0;
            const isPartial = !isFull && (slot.booked_players ?? 0) > 0;
            const hasOpenLobby = Boolean(slot.open_lobby_booking_id);
            return (
              <motion.button
                key={slot.startMinute}
                disabled={!slot.available}
                onClick={() => onToggle(slot.startMinute)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.012 }}
                whileHover={slot.available ? { scale: 1.05 } : {}}
                whileTap={slot.available ? { scale: 0.95 } : {}}
                className={cn(
                  "relative rounded-xl border px-2 py-3 text-sm font-medium transition-colors",
                  isFull && "cursor-not-allowed border-border/40 bg-muted/40 text-muted-foreground line-through",
                  isPartial && slot.available && !isSelected && "border-amber-500/40 bg-amber-500/10 text-foreground hover:border-amber-500",
                  isVacant && slot.available && !isSelected && "border-emerald-500/40 bg-emerald-500/10 text-foreground hover:border-emerald-500",
                  !isFull && !isPartial && !isVacant && slot.available && !isSelected && "border-primary/30 bg-background/60 text-foreground hover:border-primary hover:bg-primary/10",
                  isSelected && "border-primary bg-primary text-primary-foreground glow-primary",
                )}
              >
                <div>{formatSlotTime(slot.startMinute)}</div>
                <div className="mt-1 text-[10px] opacity-80">
                  {isFull
                    ? "Full"
                    : isVacant
                      ? "Vacant"
                      : `${slot.remaining_capacity ?? 0}/${slot.total_capacity ?? 0} left`}
                </div>
                {hasOpenLobby && !isFull && (
                  <div className="mt-0.5 text-[9px] font-semibold text-primary">Join match</div>
                )}
                {slot.is_private_game && isPartial && (
                  <div className="mt-0.5 text-[9px] text-muted-foreground">Private</div>
                )}
                {isSelected && (
                  <motion.span
                    layoutId="slot-ripple"
                    className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary/60"
                  />
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="relative mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-primary/40 bg-background" /> Available</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-primary glow-primary" /> Selected</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-muted/60" /> Booked</span>
      </div>
    </div>
  );
}
