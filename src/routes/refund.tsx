import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { REFUND_SECTIONS } from "@/lib/legal-content";
import { buildPageMeta } from "@/lib/seo";

export const Route = createFileRoute("/refund")({
  head: () =>
    buildPageMeta({
      title: "Return & Refund Policy",
      description: "Refund eligibility and processing times for Good Bookies turf bookings.",
      path: "/refund",
    }),
  component: () => (
    <LegalPageLayout
      title="Return & Refund Policy"
      intro="Refunds are processed according to the schedule below when you cancel a booking."
      sections={REFUND_SECTIONS}
    />
  ),
});
