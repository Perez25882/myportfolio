import type { DecisionId } from "./types";

export const profile = {
  name: "Perez Tegbey",
  wordmark: "PEREZ",
  museumName: "Museum of What's Possible",
  /** Founder-supplied in the immersive-experience directive of 2026-10-27. */
  headline: "I build ideas into things that work.",
  role: "Software developer and product builder",
  location: "Accra, Ghana",
  education: "Computer Science graduate",
  interests: ["Software engineering", "Product development", "Cybersecurity", "Interactive experiences"],
  /** From the approved concept image; confirmed in the immersive-experience directive of 2026-10-27 (P1-6). */
  narrativeLine: ["Curiosity made me explore.", "Ambition made me build."],
  intro:
    "An interactive 3D portfolio of real projects, technical depth and a journey towards what's next.",
  /** From the approved concept image; confirmed by the founder on 2026-10-28 (D6). */
  roleLine: "Developer / Product Builder",
  availability: "Open to work",
  whatIBuild: [
    "Products for small businesses: orders, payments and stock that fit how Ghanaian shops already sell.",
    "Backends with queues, payment integrity and security reviews, not just happy paths.",
    "3D and realtime web: Three.js scenes, rigged characters and multiplayer servers.",
  ],
  /** Founder-supplied on 2026-10-28 (resolves Q10). No CV has been supplied yet (Q11). */
  contact: {
    github: "https://github.com/Perez25882",
    emails: ["perez25882@gmail.com", "pereztegbey66@gmail.com"] as readonly string[],
    linkedin: "https://www.linkedin.com/in/perez-tegbey-55a74928b" as string | null,
    /** Ghana mobile 055 842 5882, reachable by WhatsApp and by phone. */
    phone: { display: "+233 55 842 5882", tel: "tel:+233558425882", whatsapp: "https://wa.me/233558425882" } as {
      readonly display: string;
      readonly tel: string;
      readonly whatsapp: string;
    } | null,
    cvHref: null as string | null,
  },
  intents: ["Employment", "Freelance", "Collaboration"],
  /** Every review decision was resolved by the founder on 2026-10-28: the wording above stands. */
  pending: {
    narrativeLine: [],
    roleLine: [],
    whatIBuild: [],
    contact: [],
  } satisfies Record<string, readonly DecisionId[]>,
} as const;

export type ContactIntent = (typeof profile.intents)[number];
