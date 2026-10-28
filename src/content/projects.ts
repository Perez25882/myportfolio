import type { Project } from "./types";

const GH = "https://github.com/Perez25882";

/** The four flagship exhibits. Sources refer to docs/phase-0-report.md. */
export const projects: readonly Project[] = [
  {
    slug: "flowdesk",
    name: "FlowDesk",
    exhibitTitle: "The Conversation Engine",
    purpose:
      "Turns WhatsApp conversations into tracked orders, confirmed payments and a booking diary for Ghanaian small businesses. Customers install nothing and keep messaging the same number.",
    role: "Product and engineering",
    status: "pre-launch",
    isTeamProject: false,
    stack: ["TypeScript", "Fastify", "BullMQ", "Prisma", "Postgres", "Redis", "React"],
    highlights: [
      {
        text: "An AI assistant grounded in the shop's catalogue, with the price floor held in the database, not the prompt.",
        verification: "verified",
        source: "Phase 0 §1.2 FlowDesk: services/assistant, negotiation gate",
      },
      {
        text: "Payments tracked on a confidence ladder rather than a yes/no flag, with a review queue for mobile-money screenshots.",
        verification: "verified",
        source: "Phase 0 §1.2 FlowDesk: payments module",
      },
      {
        text: "About 64 API test files covering security, payment integrity, webhooks and the message pipeline.",
        verification: "verified",
        source: "Phase 0 §1.2 FlowDesk: apps/api/tests",
      },
      {
        text: "A pre-launch security review whose 10 findings were closed.",
        verification: "verified",
        source: "Phase 0 §1.2 FlowDesk: repository docs",
      },
    ],
    links: [],
    withheldLinks: [{ label: "Repository", reason: "D3" }],
    pending: [],
    caseStudyHref: "/work/flowdesk",
  },
  {
    slug: "ledgermind",
    name: "LedgerMind OS",
    exhibitTitle: "The Offline Vault",
    purpose:
      "Point of sale and back office for multi-branch retailers in Ghana, built offline-first so a shop keeps selling when the internet drops.",
    role: "Product and engineering",
    status: "pre-launch",
    isTeamProject: false,
    stack: ["Next.js", "Supabase", "Postgres RLS", "Edge Functions", "Flutter"],
    highlights: [
      {
        text: "22 ordered database migrations with row-level security and branch scoping.",
        verification: "verified",
        source: "Phase 0 §1.2 LedgerMind OS: supabase/migrations",
      },
      {
        text: "An adversarial audit found and fixed cross-tenant and privilege-escalation issues.",
        verification: "self-reported",
        source: "ledmi_os README, audit dated 2026-08-14",
      },
      {
        text: "Rebuilt from LedgerMind v1 (Next.js 14, Firebase, function-calling AI) into a multi-app platform.",
        verification: "verified",
        source: "Phase 0 §1.2 ledgermindv1 → ledmi_os",
      },
    ],
    links: [{ label: "Repository", href: `${GH}/ledmi_os` }],
    withheldLinks: [],
    pending: [],
    caseStudyHref: "/work/ledgermind",
  },
  {
    slug: "accra-we-dey",
    name: "Accra We Dey",
    exhibitTitle: "A World Within a World",
    purpose:
      "A multiplayer life simulation set in Accra, played in a mobile browser, with a city map, venues and an in-game phone.",
    role: "Design and engineering",
    status: "pre-launch",
    isTeamProject: false,
    stack: ["Three.js", "Vite", "uWebSockets.js", "Postgres", "Redis"],
    highlights: [
      {
        text: "Rigged 3D characters built from CC0 MakeHuman assets through Python build scripts.",
        verification: "verified",
        source: "Phase 0 §1.2 Accra We Dey: character pipeline and licence notes",
      },
      {
        text: "A 1,500-bot load test at 7–13 ms per server tick.",
        verification: "self-reported",
        source: "accrawedey README",
      },
    ],
    links: [],
    withheldLinks: [{ label: "Repository", reason: "D5" }],
    pending: [],
    caseStudyHref: "/work/accra-we-dey",
  },
  {
    slug: "joydatabundle",
    name: "JoyDataBundle",
    exhibitTitle: "The Distribution Network",
    purpose:
      "A platform for buying and reselling mobile data bundles in Ghana, with reseller earnings and an admin back office.",
    role: "Frontend contributor in a three-person team. The backend was built by a teammate.",
    status: "live",
    isTeamProject: true,
    stack: ["Next.js", "React", "Tailwind"],
    highlights: [
      {
        text: "Built the admin payout flow, where admins review and confirm reseller payouts.",
        verification: "verified",
        source: "Phase 0 §1.2 JoyDataBundle: payout-improvements PR",
      },
      {
        text: "The public site responded when checked in Phase 0; it was not tested end to end.",
        verification: "verified",
        source: "Phase 0 §1.2 JoyDataBundle: HTTP 200",
      },
    ],
    links: [
      { label: "Live site", href: "https://joy-bundle-frontend-nine.vercel.app" },
      { label: "Repository", href: `${GH}/JBFrontNew` },
    ],
    withheldLinks: [],
    pending: [],
    caseStudyHref: "/work/joydatabundle",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
