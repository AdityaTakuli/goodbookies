import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { ABOUT_SECTIONS } from "@/lib/legal-content";
import { buildPageMeta } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    buildPageMeta({
      title: "About Us",
      description: "About Good Bookies — Haldwani's online sports turf booking platform.",
      path: "/about",
    }),
  component: () => (
    <LegalPageLayout
      title="About Us"
      intro="Good Bookies makes it easy to find and book sports venues near you."
      sections={ABOUT_SECTIONS}
    />
  ),
});
