import type { StoryEntry } from "./types";

/** From verified first-commit dates (Phase 0 §1.5). Commit dates are not start dates. */
export const story: readonly StoryEntry[] = [
  { date: "2024-10", title: "First public code", detail: "A first Solidity contract, written while learning." },
  { date: "2025-05", title: "Blockchain voting", detail: "Voting dApps, one of them co-authored." },
  { date: "2025-11", title: "Team product", detail: "JoyDataBundle's frontend, built with two teammates." },
  { date: "2026-03", title: "LedgerMind v1", detail: "A first retail system, with an AI assistant that can update stock." },
  { date: "2026-06", title: "Commerce backends", detail: "A multi-store POS, then FlowDesk." },
  { date: "2026-07", title: "LedgerMind OS", detail: "The retail system rebuilt offline-first." },
  { date: "2026-10", title: "Accra We Dey", detail: "A multiplayer 3D world in the browser." },
];
