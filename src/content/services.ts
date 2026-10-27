import type { DecisionId } from "./types";

/**
 * Freelance services (Work with me). The service list comes from the founder's design
 * directive of 2026-10-27; descriptions and process wording await confirmation (S1).
 * No prices, testimonials or client results are stated anywhere.
 */

export interface Service {
  readonly id: string;
  readonly name: string;
  /** Plain language, for a business owner who isn't technical. */
  readonly summary: string;
  readonly includes: readonly string[];
  /** Work on this site that shows the same kind of build. */
  readonly evidence: readonly { readonly label: string; readonly href: string }[];
}

export const services: readonly Service[] = [
  {
    id: "business-websites",
    name: "Business websites",
    summary: "A fast, clear website that tells customers what you sell, where to find you and how to reach you.",
    includes: ["Pages written around what customers ask", "Works well on phones", "Easy to find on Google"],
    evidence: [{ label: "This portfolio's 2D pages", href: "/quick" }],
  },
  {
    id: "personal-websites",
    name: "Personal and portfolio websites",
    summary: "A site that presents your work and makes it easy for the right people to contact you.",
    includes: ["A structure built around your best work", "Case studies that read well", "A clear way to get in touch"],
    evidence: [
      { label: "This portfolio", href: "/quick" },
      { label: "The 3D museum", href: "/museum" },
    ],
  },
  {
    id: "web-apps",
    name: "Web applications",
    summary: "Software your customers or staff use every day: accounts, orders, bookings, payments.",
    includes: ["Sign-in and roles", "Payments, including mobile money", "Tested before it reaches users"],
    evidence: [
      { label: "FlowDesk", href: "/work/flowdesk" },
      { label: "LedgerMind OS", href: "/work/ledgermind" },
    ],
  },
  {
    id: "e-commerce",
    name: "Online shops",
    summary: "A shop that takes orders and payments, including for businesses that already sell over WhatsApp.",
    includes: ["Catalogue and checkout", "Order tracking", "Payment confirmation you can trust"],
    evidence: [
      { label: "FlowDesk", href: "/work/flowdesk" },
      { label: "JoyDataBundle", href: "/work/joydatabundle" },
    ],
  },
  {
    id: "dashboards",
    name: "Dashboards and internal tools",
    summary: "One place to see orders, stock or payouts, so the business stops running on spreadsheets and chat threads.",
    includes: ["Live boards", "Approval steps, such as payouts", "Access limited to the right people"],
    evidence: [
      { label: "FlowDesk's order board", href: "/work/flowdesk" },
      { label: "JoyDataBundle's payout review", href: "/work/joydatabundle" },
    ],
  },
  {
    id: "custom-products",
    name: "Custom digital products",
    summary: "Something that doesn't exist yet: an idea you want built properly, from first version to launch.",
    includes: ["Help shaping the first version", "Interactive and 3D work where it helps", "A codebase you own"],
    evidence: [
      { label: "Accra We Dey", href: "/work/accra-we-dey" },
      { label: "The 3D museum", href: "/museum" },
    ],
  },
];

/** A real sequence, so it is numbered on the page. */
export const process: readonly { readonly title: string; readonly detail: string }[] = [
  {
    title: "A first conversation",
    detail: "You describe the business and what isn't working. I ask questions until I understand who will use the site and why.",
  },
  {
    title: "A written plan",
    detail: "What will be built, in what order, and what I need from you, agreed before any work starts.",
  },
  {
    title: "Building in steps you can see",
    detail: "You get a private preview link early and see each part working as it's built, so changes happen while they're cheap.",
  },
  {
    title: "Launch and handover",
    detail: "The site goes live, and you get access to everything: the code, the hosting and how to keep it running.",
  },
];

export const servicesPending: readonly DecisionId[] = ["S1"];
