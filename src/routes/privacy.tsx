import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { PRIVACY_SECTIONS } from "@/lib/legal-content";
import { buildPageMeta } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    buildPageMeta({
      title: "Privacy Policy",
      description: "How Good Bookies collects, uses, and protects your personal information.",
      path: "/privacy",
    }),
  component: () => (
    <LegalPageLayout
      title="Privacy Policy"
      intro="Your privacy matters to us. This policy explains what data we collect and how we use it."
      sections={PRIVACY_SECTIONS}
    />
  ),
});
