import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/booking/success")({
  validateSearch: z.object({ id: z.string().optional() }),
  component: SuccessPage,
});

function SuccessPage() {
  const { id } = Route.useSearch();
  return (
    <div className="container mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="grid h-24 w-24 place-items-center rounded-full bg-primary text-primary-foreground glow-primary"
      >
        <CheckCircle2 className="h-12 w-12" />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 font-display text-4xl font-bold"
      >
        Back of the net!
      </motion.h1>
      <p className="mt-3 text-muted-foreground">
        Payment received and your booking is confirmed. We've saved the slot for you.
      </p>
      {id && <p className="mt-2 text-xs text-muted-foreground">Booking ID: <span className="font-mono">{id}</span></p>}
      <div className="mt-8 flex gap-3">
        <Link to="/dashboard"><Button variant="default">View my bookings</Button></Link>
        <Link to="/sports"><Button variant="outline">Book again</Button></Link>
      </div>
    </div>
  );
}