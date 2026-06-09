import { createFileRoute, redirect } from "@tanstack/react-router";
import { PLAYER_HOME } from "@/lib/auth-landing";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: PLAYER_HOME });
  },
});
