/**
 * Skills in three tiers, derived from evidence rather than self-rating (no percentage meters):
 * - shipped: in the verified stack of at least one flagship project (projects.ts, Phase 0 §1.2);
 * - familiar: verified in the repositories (capabilities.ts) or this site, outside the flagship stacks;
 * - focus: the areas of the most recent dated work (story.ts).
 */

export interface ShippedSkill {
  readonly area: string;
  /** What this lets Perez build, in plain words. */
  readonly capability: string;
  readonly tools: readonly string[];
  /** Project slugs where the tools appear. */
  readonly projects: readonly string[];
}

export const shippedSkills: readonly ShippedSkill[] = [
  {
    area: "Commerce backends",
    capability: "Message pipelines that don't lose orders, and payment checks that hold under pressure.",
    tools: ["TypeScript", "Fastify", "BullMQ", "Prisma", "Redis"],
    projects: ["flowdesk"],
  },
  {
    area: "Data and access",
    capability: "Databases where each shop or branch sees only its own records.",
    tools: ["Postgres", "Row-level security", "Supabase", "Edge Functions"],
    projects: ["ledgermind", "flowdesk"],
  },
  {
    area: "Web interfaces",
    capability: "Dashboards and storefronts that stay fast and readable on a phone.",
    tools: ["React", "Next.js", "Tailwind"],
    projects: ["flowdesk", "joydatabundle", "ledgermind"],
  },
  {
    area: "3D and realtime",
    capability: "Browser worlds with many players, and scenes that run on mid-range phones.",
    tools: ["Three.js", "Vite", "uWebSockets.js"],
    projects: ["accra-we-dey"],
  },
  {
    area: "Mobile",
    capability: "A point-of-sale app that keeps working when the internet drops.",
    tools: ["Flutter"],
    projects: ["ledgermind"],
  },
];

export const familiarSkills: readonly string[] = [
  "Node.js",
  "Express",
  "TanStack Query",
  "Expo and React Native",
  "Paystack and mobile money",
  "Blender and glTF pipelines",
  "Solidity",
];

export const currentFocus =
  "Realtime 3D on the web (Accra We Dey and this museum) and offline-first sync (LedgerMind OS): the most recent work, from mid to late 2026.";
