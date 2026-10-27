import type { DecisionId } from "./types";

export const profile = {
  name: "Perez Tegbey",
  wordmark: "PEREZ",
  museumName: "Museum of What's Possible",
  /** From the approved concept image; wording not yet confirmed (P1-6). */
  narrativeLine: ["Curiosity made me explore.", "Ambition made me build."],
  intro:
    "An interactive 3D portfolio of real projects, technical depth and a journey towards what's next.",
  /** From the approved concept image; wording not yet confirmed (D6). */
  roleLine: "Developer / Product Builder",
  availability: "Open to work",
  whatIBuild: [
    "Products for small businesses: orders, payments and stock that fit how Ghanaian shops already sell.",
    "Backends with queues, payment integrity and security reviews, not just happy paths.",
    "3D and realtime web: Three.js scenes, rigged characters and multiplayer servers.",
  ],
  contact: {
    github: "https://github.com/Perez25882",
    /** Not published until the founder chooses contact channels (Q10). */
    email: null as string | null,
    linkedin: null as string | null,
    /** Not published until the founder supplies a CV (Q11). */
    cvHref: null as string | null,
  },
  intents: ["Employment", "Freelance", "Collaboration"],
  pending: {
    narrativeLine: ["P1-6"],
    roleLine: ["D6"],
    whatIBuild: ["D6"],
    contact: ["Q10", "Q11"],
  } satisfies Record<string, readonly DecisionId[]>,
} as const;

export type ContactIntent = (typeof profile.intents)[number];
