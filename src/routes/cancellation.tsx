import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { CANCELLATION_SECTIONS } from "@/lib/legal-content";
import { buildPageMeta } from "@/lib/seo";

export const Route = createFileRoute("/cancellation")({
  head: () =>
    buildPageMeta({
      title: "Cancellation Policy",
      description: "How to cancel a Good Bookies booking and what refunds apply.",
      path: "/cancellation",
    }),
  component: () => (
    <LegalPageLayout
      title="Cancellation Policy"
      intro="Understand when you can cancel and what refund you receive."
      sections={CANCELLATION_SECTIONS}
    />
  ),
});
