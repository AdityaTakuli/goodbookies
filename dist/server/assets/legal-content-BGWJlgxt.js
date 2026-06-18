import { Q as jsxRuntimeExports } from "./server-BDwJjQtX.js";
import { L as Link } from "./router-0UYBG3rF.js";
import { a as CANCEL_FULL_REFUND_HOURS, b as CANCEL_PARTIAL_REFUND_HOURS, c as CANCEL_PARTIAL_REFUND_PERCENT } from "./cancellation-policy-Be0g0_Zy.js";
import { I as INDIVIDUAL_BOOKING_SURCHARGE, F as FULL_TURF_TOKEN_PERCENT } from "./pricing-DOPRXSDA.js";
function LegalPageLayout({ title, intro, sections }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto max-w-3xl px-4 py-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "mb-8 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "hover:text-primary", children: "Home" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-2", children: "/" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: title })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold tracking-tight md:text-4xl", children: title }),
    intro && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-muted-foreground", children: intro }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 space-y-8", children: sections.map((section) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border/60 bg-card/40 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-foreground", children: section.question }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-line", children: section.answer })
    ] }, section.question)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-10 text-xs text-muted-foreground", children: [
      "Last updated: June 2026. For questions, contact",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "mailto:contact@goodbookies.co.in", className: "text-primary hover:underline", children: "contact@goodbookies.co.in" }),
      "."
    ] })
  ] });
}
const LEGAL_ENTITY = {
  tradeName: "Good Bookies",
  proprietor: "Aditya Pratap Singh Takuli",
  email: "contact@goodbookies.co.in",
  phone: "8791327956",
  address: "Shantiputi Number 2, Kiccha – 263148, Uttarakhand, India",
  website: "goodbookies.co.in",
  paymentPartner: "PayU"
};
const individualFeePercent = Math.round(INDIVIDUAL_BOOKING_SURCHARGE * 100);
const tokenPercent = Math.round(FULL_TURF_TOKEN_PERCENT * 100);
const TERMS_SECTIONS = [
  {
    question: "Who operates this website?",
    answer: `This website is operated by ${LEGAL_ENTITY.tradeName} (trade name), a proprietorship of ${LEGAL_ENTITY.proprietor}. Our registered address is ${LEGAL_ENTITY.address}.`
  },
  {
    question: "What does Good Bookies do?",
    answer: "Good Bookies is an online sports venue booking platform that connects users with turf owners and sports facility operators. We currently operate in Haldwani, Uttarakhand, and are expanding to other cities."
  },
  {
    question: "Is Good Bookies the turf owner?",
    answer: "No. Good Bookies is a third-party booking platform. Turf owners and venue operators are independent businesses listed on our platform. Good Bookies facilitates bookings on their behalf."
  },
  {
    question: "What services and pricing do we offer?",
    answer: `Bookings are priced in INR per slot at each venue's listed rate. Individual spot bookings include a ${individualFeePercent}% platform/service fee on your per-player share (not on the full turf price). Full-turf bookings may be paid in full at checkout or with a ${tokenPercent}% token upfront, with the balance due before your slot. Final amounts are shown before you pay.`
  },
  {
    question: "What are the rules for using the platform?",
    answer: "Users must be 18 years or older. You agree to provide accurate personal details at the time of booking. Bookings are subject to slot availability. Good Bookies reserves the right to remove any user or listing that violates our policies."
  },
  {
    question: "How are payments processed?",
    answer: `Online payments are processed securely through ${LEGAL_ENTITY.paymentPartner}, our authorised payment partner. Card, UPI, net banking, and wallet options available through PayU are subject to PayU's terms.`
  },
  {
    question: "Can Good Bookies change these terms?",
    answer: "Yes. We may update these Terms & Conditions at any time. Continued use of the website after changes constitutes your acceptance."
  }
];
const PRIVACY_SECTIONS = [
  {
    question: "What information do we collect?",
    answer: "We collect your name, phone number, email address, and payment-related details when you register or make a booking. We also collect device and usage data (such as IP address and browser type) automatically."
  },
  {
    question: "Why do we collect this information?",
    answer: "To process bookings, send confirmation messages, resolve disputes, improve our platform, and comply with legal requirements."
  },
  {
    question: "Do we share your data with anyone?",
    answer: `We share your booking details with the relevant turf owner or venue operator to confirm your booking. We do not sell your personal data. We may share data with payment partners (including ${LEGAL_ENTITY.paymentPartner}) and legal authorities when required by law.`
  },
  {
    question: "How long do we keep your data?",
    answer: "We retain your data for up to 3 years from your last booking or account activity, or as required by Indian law."
  },
  {
    question: "Is your data secure?",
    answer: "We use industry-standard encryption and security practices. However, no system is completely secure — please protect your login credentials."
  },
  {
    question: "How can you delete your data?",
    answer: `Contact us at ${LEGAL_ENTITY.email} to request deletion of your account and associated data. We will process requests within 30 days.`
  }
];
const REFUND_SECTIONS = [
  {
    question: "Can I get a refund after booking a turf?",
    answer: `Yes, refunds depend on when you cancel:
• More than ${CANCEL_FULL_REFUND_HOURS} hours before your slot — 100% refund
• ${CANCEL_PARTIAL_REFUND_HOURS}–${CANCEL_FULL_REFUND_HOURS} hours before your slot — ${CANCEL_PARTIAL_REFUND_PERCENT}% refund
• Less than ${CANCEL_PARTIAL_REFUND_HOURS} hours before your slot — no refund`
  },
  {
    question: "How will the refund be processed?",
    answer: "Refunds are credited to the original payment method (UPI, debit/credit card, net banking, or wallet) used at booking, via our payment partner PayU."
  },
  {
    question: "How long does a refund take?",
    answer: "Refunds are typically processed within 5–7 business days from cancellation approval. Bank processing times may vary."
  },
  {
    question: "What if the turf owner cancels my booking?",
    answer: "If the venue cancels your booking, you receive a 100% refund within 5–7 business days. We will notify you immediately."
  },
  {
    question: "What if I face a technical issue during payment but the amount was deducted?",
    answer: `Contact us within 48 hours at ${LEGAL_ENTITY.email} or ${LEGAL_ENTITY.phone}. We will investigate and issue a full refund if the booking was not confirmed.`
  },
  {
    question: "Are there any non-refundable charges?",
    answer: `The ${individualFeePercent}% platform/service fee included in individual spot bookings is non-refundable once the booking is confirmed, except where a full refund applies under our cancellation policy or where we cancel on your behalf.`
  }
];
const CANCELLATION_SECTIONS = [
  {
    question: "Can I cancel a booking?",
    answer: "Yes. Cancel a confirmed booking from your account dashboard or by contacting support."
  },
  {
    question: "What is the cancellation window?",
    answer: `• More than ${CANCEL_FULL_REFUND_HOURS} hours before your slot — free cancellation (100% refund)
• ${CANCEL_PARTIAL_REFUND_HOURS}–${CANCEL_FULL_REFUND_HOURS} hours before — ${CANCEL_PARTIAL_REFUND_PERCENT}% refund
• Less than ${CANCEL_PARTIAL_REFUND_HOURS} hours before — cancellation not allowed; no refund`
  },
  {
    question: "How do I cancel a booking?",
    answer: `Log in at ${LEGAL_ENTITY.website} → My Bookings → select the booking → Cancel Booking. You can also WhatsApp or call us at ${LEGAL_ENTITY.phone}.`
  },
  {
    question: "Can the turf owner cancel my booking?",
    answer: "Venues may cancel due to maintenance, weather, or unforeseen circumstances. In such cases you are notified immediately and receive a full refund."
  },
  {
    question: "Can I reschedule instead of cancelling?",
    answer: `Rescheduling is subject to slot availability and venue approval. Contact us at least ${CANCEL_FULL_REFUND_HOURS} hours in advance at ${LEGAL_ENTITY.email}.`
  }
];
const ABOUT_SECTIONS = [
  {
    question: "What is Good Bookies?",
    answer: "Good Bookies is Haldwani's online sports turf booking platform — built for players, by players. Discover, compare, and book football turfs, cricket nets, and indoor courts with real-time slot availability and instant confirmation."
  },
  {
    question: "Where do you operate?",
    answer: "We are live in Haldwani, Uttarakhand, and expanding across Uttarakhand and India."
  },
  {
    question: "Are you a turf owner?",
    answer: "No. We are a technology platform partnering with turf owners and sports facility operators. We help them manage bookings digitally and help players find the right venue."
  },
  {
    question: "Who can list on Good Bookies?",
    answer: `Any sports venue owner — turf, cricket net, badminton court, basketball court — can apply at ${LEGAL_ENTITY.website}/owner/register.`
  },
  {
    question: "How do I reach you?",
    answer: `Email: ${LEGAL_ENTITY.email} | Phone/WhatsApp: ${LEGAL_ENTITY.phone}
Registered address: ${LEGAL_ENTITY.address}`
  }
];
export {
  ABOUT_SECTIONS as A,
  CANCELLATION_SECTIONS as C,
  LegalPageLayout as L,
  PRIVACY_SECTIONS as P,
  REFUND_SECTIONS as R,
  TERMS_SECTIONS as T
};
