import type { DecisionId, Verification } from "./types";

/**
 * Case-study detail for the flagship projects other than FlowDesk (which has flowdesk.ts).
 * Every engineering note carries its verification and source, like projects.ts highlights.
 * Sources: docs/phase-0-report.md §1.2 and design/phase-1/03-exhibit-design-bible.md (the [V] rows).
 */

export interface CaseNote {
  readonly title: string;
  readonly body: string;
  readonly verification: Verification;
  readonly source: string;
}

export type CaseVisual = "ledgermind-sync" | "accra-tick" | "joydatabundle-site";

export interface CaseStudyContent {
  readonly slug: string;
  /** Each case study keeps the house style but takes one colour from its subject. */
  readonly accent: string;
  readonly opening: { readonly heading: string; readonly body: string };
  readonly visual: CaseVisual;
  readonly notes: readonly CaseNote[];
  readonly status: string;
  readonly pending: readonly DecisionId[];
}

export const caseStudies: readonly CaseStudyContent[] = [
  {
    slug: "ledgermind",
    accent: "#3f5a52",
    opening: {
      heading: "The till can't stop because the internet did",
      body: "LedgerMind OS is a point of sale and back office for retailers with more than one branch. It is built offline-first: when the connection drops, the shop keeps selling, and every branch's records reconcile when it returns.",
    },
    visual: "ledgermind-sync",
    notes: [
      {
        title: "Sales wait on the device",
        body: "While offline, each sale goes into a queue on the device and is sent when the network comes back. A sale that keeps failing moves to a dead-letter list instead of disappearing.",
        verification: "verified",
        source: "features/sync/data/services/offline_queue_service.dart",
      },
      {
        title: "Sent twice, counted once",
        body: "Every queued sale carries an idempotency key that is reused on retry, so a sale resent after a timeout is recognised rather than recorded twice.",
        verification: "verified",
        source: "Exhibit design bible: idempotency keys reused on retry",
      },
      {
        title: "The server decides stock",
        body: "After a sync the counter takes the server's stock figures. A written sync protocol sets how each kind of conflict is resolved.",
        verification: "verified",
        source: "docs/SYNC_PROTOCOL.md §9",
      },
      {
        title: "Each branch sees only its own data",
        body: "22 ordered database migrations with row-level security and branch scoping, so access is enforced by the database, not just the app.",
        verification: "verified",
        source: "supabase/migrations",
      },
      {
        title: "Tested by trying to break in",
        body: "An adversarial audit looked for cross-tenant access and privilege escalation. The issues it found were fixed.",
        verification: "self-reported",
        source: "ledmi_os README, audit dated 2026-08-14",
      },
      {
        title: "Rebuilt, not patched",
        body: "LedgerMind v1 was a single Next.js 14 and Firebase app with a function-calling assistant. LedgerMind OS replaced it with a point of sale, a dashboard and a database platform.",
        verification: "verified",
        source: "ledgermindv1 → ledmi_os",
      },
    ],
    status: "No production users, customers or revenue are claimed.",
    pending: ["D1"],
  },
  {
    slug: "accra-we-dey",
    accent: "#9a5a34",
    opening: {
      heading: "Accra, as a game you can play in a phone browser",
      body: "Accra We Dey is a multiplayer life simulation set in Accra. You move around a city map, visit venues and use an in-game phone, in a mobile browser with nothing to install.",
    },
    visual: "accra-tick",
    notes: [
      {
        title: "A map of the real city",
        body: "The city map is laid out from real Accra coordinates.",
        verification: "verified",
        source: "client/src/v2/scene/map.js",
      },
      {
        title: "Characters built by script",
        body: "Rigged 3D characters are assembled from CC0 MakeHuman assets by Python build scripts, so they can be rebuilt and adjusted rather than hand-edited.",
        verification: "verified",
        source: "Character pipeline and licence notes",
      },
      {
        title: "Built for a crowd",
        body: "A uWebSockets.js game server runs the world in ticks. A load test with 1,500 bots kept each tick between 7 and 13 ms.",
        verification: "self-reported",
        source: "accrawedey README",
      },
    ],
    status: "The repository is not linked yet.",
    pending: ["D5"],
  },
  {
    slug: "joydatabundle",
    accent: "#0f7c8f",
    opening: {
      heading: "A storefront for resellers, and a back office that pays them",
      body: "JoyDataBundle lets people buy and resell mobile data bundles in Ghana. Resellers earn on their sales, and the business needs to pay them correctly.",
    },
    visual: "joydatabundle-site",
    notes: [
      {
        title: "A team of three",
        body: "Perez worked on the frontend. The backend was built by a teammate.",
        verification: "verified",
        source: "git history",
      },
      {
        title: "Payouts that are checked before they're paid",
        body: "Perez built the admin payout flow, where an admin reviews each reseller payout and confirms it.",
        verification: "verified",
        source: "payout-improvements PR",
      },
      {
        title: "Live",
        body: "The public site responded when checked in October 2026. It was not tested end to end.",
        verification: "verified",
        source: "Phase 0 HTTP check",
      },
    ],
    status: "The public site is up.",
    pending: ["D1"],
  },
];

export function getCaseStudy(slug: string): CaseStudyContent | undefined {
  return caseStudies.find((study) => study.slug === slug);
}
