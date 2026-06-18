import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { TERMS_SECTIONS } from "@/lib/legal-content";
import { buildPageMeta } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () =>
    buildPageMeta({
      title: "Terms & Conditions",
      description: "Terms and conditions for using Good Bookies sports turf booking platform.",
      path: "/terms",
    }),
  component: () => (
    <LegalPageLayout
      title="Terms & Conditions"
      intro="Please read these terms carefully before booking on Good Bookies."
      sections={TERMS_SECTIONS}
    />
  ),
});
