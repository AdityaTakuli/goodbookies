import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { listSports } from "@/lib/booking.functions";
import heroImg from "@/assets/hero-turf.jpg";
import { Calendar, MapPin, Zap } from "lucide-react";

const sportsQO = queryOptions({ queryKey: ["sports"], queryFn: () => listSports() });

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(sportsQO),
  component: Index,
});

function Index() {
  const { data: sports } = useSuspenseQuery(sportsQO);

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img src={heroImg} alt="" width={1920} height={1080} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="container mx-auto px-4 py-24 md:py-36">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Zap className="h-3 w-3" /> Real-time slot availability
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              Book the <span className="text-gradient-turf">pitch</span>. Play the match.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Floodlit turfs, cricket nets and indoor courts — find your slot, lock it in, and show up ready to play.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/sports">
                <Button size="lg" className="glow-primary">Book a fresh turf</Button>
              </Link>
              <Link to="/lobbies">
                <Button size="lg" variant="outline">Join an open match</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sports grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Pick your sport</h2>
            <p className="mt-2 text-muted-foreground">Tap a sport to see venues near you.</p>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {sports.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
            >
              <Link
                to="/sports"
                search={{ sport: s.slug }}
                className="group flex aspect-square flex-col items-center justify-center rounded-2xl border border-border/60 bg-card transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-glow)]"
              >
                <span className="text-4xl transition-transform group-hover:scale-110">{s.icon}</span>
                <span className="mt-3 text-sm font-semibold">{s.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="font-display text-3xl font-bold md:text-4xl">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { icon: MapPin, title: "Choose a venue", desc: "Filter by sport, city or price. See ratings and amenities." },
            { icon: Calendar, title: "Pick your slot", desc: "Live availability. Tap the hours you want to play." },
            { icon: Zap, title: "Confirm & play", desc: "Instant confirmation. Show up and play. That's it." },
          ].map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border/60 bg-card p-6"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">{i + 1}. {step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
