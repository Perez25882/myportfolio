/**
 * The project showroom, told by Perez: one first-person introduction per bay. Founder's choice
 * (2026-10-28): only verified facts, no invented motives or anecdotes. Each line restates what
 * projects.ts, caseStudies.ts, flowdesk.ts and story.ts already record; `since` is the project's
 * first public commit month from story.ts, which is not a start date.
 */

export interface BayStory {
  readonly slug: string;
  readonly since: string;
  readonly intro: string;
}

export const bayStories: readonly BayStory[] = [
  {
    slug: "flowdesk",
    since: "2026-06",
    intro:
      "Many shops in Ghana sell over WhatsApp, and their orders, haggling and payment proof get lost in chat threads. I built FlowDesk so those chats become tracked orders and confirmed payments, while customers keep messaging the same number.",
  },
  {
    slug: "ledgermind",
    since: "2026-07",
    intro:
      "My first retail system, LedgerMind v1, had an AI assistant that could update stock. I rebuilt it as LedgerMind OS for retailers with more than one branch, offline-first: when the internet drops, the till keeps selling.",
  },
  {
    slug: "accra-we-dey",
    since: "2026-10",
    intro:
      "My most recent build: a multiplayer life simulation set in Accra, played in a phone's browser, with a city map, venues and an in-game phone.",
  },
  {
    slug: "joydatabundle",
    since: "2025-11",
    intro:
      "My first team product. JoyDataBundle lets people buy and resell mobile data bundles in Ghana. In a team of three I worked on the frontend, including the admin payout flow; a teammate built the backend.",
  },
];

export function bayStory(slug: string): BayStory | undefined {
  return bayStories.find((story) => story.slug === slug);
}
