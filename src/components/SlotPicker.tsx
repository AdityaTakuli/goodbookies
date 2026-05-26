import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type Slot = { hour: number; available: boolean };

function fmt(h: number) {
  const ampm = h < 12 ? "AM" : "PM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:00 ${ampm}`;
}

export function SlotPicker({
  slots,
  selected,
  onToggle,
}: {
  slots: Slot[];
  selected: number[];
  onToggle: (h: number) => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
      {/* pitch backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-pitch opacity-25" />
      <div className="pointer-events-none absolute inset-x-6 top-1/2 h-px bg-white/20" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />

      <div className="relative grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        <AnimatePresence>
          {slots.map((slot) => {
            const isSelected = selected.includes(slot.hour);
            return (
              <motion.button
                key={slot.hour}
                disabled={!slot.available}
                onClick={() => onToggle(slot.hour)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: slot.hour * 0.015 }}
                whileHover={slot.available ? { scale: 1.05 } : {}}
                whileTap={slot.available ? { scale: 0.95 } : {}}
                className={cn(
                  "relative rounded-xl border px-2 py-3 text-sm font-medium transition-colors",
                  !slot.available && "cursor-not-allowed border-border/40 bg-muted/40 text-muted-foreground line-through",
                  slot.available && !isSelected && "border-primary/30 bg-background/60 text-foreground hover:border-primary hover:bg-primary/10",
                  isSelected && "border-primary bg-primary text-primary-foreground glow-primary",
                )}
              >
                {fmt(slot.hour)}
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