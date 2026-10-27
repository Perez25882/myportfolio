/**
 * Fact register types. Every public claim carries how it was verified and
 * where it came from, so nothing unverified reaches the page silently.
 */

/** verified: checked in code, docs or git history during Phase 0.
 *  self-reported: stated in a project's own README, not reproduced.
 *  pending: needs founder confirmation before launch. */
export type Verification = "verified" | "self-reported" | "pending";

export type ProjectStatus = "live" | "pre-launch";

/** Founder decisions still open (docs/phase-0-report.md §10, design/phase-1/08-founder-review.md). */
export type DecisionId =
  | "D1" // attribution and team credit
  | "D2" // AI-assisted engineering disclosure
  | "D3" // FlowDesk repo privacy scrub
  | "D5" // Accra We Dey inclusion
  | "D6" // role line and availability wording
  | "D8" // FlowDesk film scenario and screenshots
  | "P1-6" // narrative line
  | "Q10" // contact channels
  | "Q11" // CV
  | "S1"; // freelance services and process wording

export interface Claim {
  readonly text: string;
  readonly verification: Verification;
  readonly source: string;
}

export interface ProjectLink {
  readonly label: string;
  readonly href: string;
}

export interface Project {
  readonly slug: string;
  readonly name: string;
  readonly exhibitTitle: string;
  readonly purpose: string;
  readonly role: string;
  readonly status: ProjectStatus;
  readonly isTeamProject: boolean;
  readonly stack: readonly string[];
  readonly highlights: readonly Claim[];
  readonly links: readonly ProjectLink[];
  /** Links deliberately not shown yet, and the decision that unblocks them. */
  readonly withheldLinks: readonly { readonly label: string; readonly reason: DecisionId }[];
  readonly pending: readonly DecisionId[];
  readonly caseStudyHref?: string;
}

export interface StoryEntry {
  /** First public commit month, "YYYY-MM". Not a project start date. */
  readonly date: string;
  readonly title: string;
  readonly detail: string;
}
