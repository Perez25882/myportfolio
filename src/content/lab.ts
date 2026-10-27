/** Engineering and experiments: smaller or earlier work, from story.ts and this site's own build. */
export interface Experiment {
  readonly title: string;
  /** "YYYY-MM": first public commit, as in story.ts. */
  readonly date: string;
  readonly body: string;
  readonly href?: string;
  readonly linkLabel?: string;
}

export const experiments: readonly Experiment[] = [
  {
    title: "This museum",
    date: "2026-10",
    body: "The 3D museum on this site. Its Blender scenes are generated from Python scripts, lit in a Cycles bake, and passed through a model pipeline that compresses textures for phones and checks every room against a performance budget.",
    href: "/museum",
    linkLabel: "Enter the museum",
  },
  {
    title: "A multi-store point of sale",
    date: "2026-06",
    body: "A point-of-sale backend for more than one store. The commerce work that led to FlowDesk.",
  },
  {
    title: "Blockchain voting",
    date: "2025-05",
    body: "Voting dApps, one of them co-authored. The first public code, in October 2024, was a Solidity contract written while learning.",
  },
];
