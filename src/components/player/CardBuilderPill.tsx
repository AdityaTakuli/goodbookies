import { cn } from "@/lib/utils";

export function CardBuilderSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-[#1E3A27]/80 bg-[#142219] p-4 sm:rounded-2xl sm:p-5", className)}>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function PillGroup({
  children,
  scroll,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        scroll &&
          "flex-nowrap overflow-x-auto overscroll-x-contain pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0 sm:snap-none",
      )}
    >
      {children}
    </div>
  );
}

export function Pill({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full border px-3.5 py-2.5 text-sm font-medium transition-colors sm:min-h-0 sm:px-3 sm:py-2",
        selected
          ? "border-primary bg-primary/15 text-primary shadow-[0_0_0_1px_rgba(16,185,129,0.35)]"
          : "border-[#1E3A27] bg-[#0B130E] text-foreground/80 hover:border-primary/40 hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}
