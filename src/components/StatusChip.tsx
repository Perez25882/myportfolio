import type { ProjectStatus, Verification } from "@/content/types";
import styles from "./StatusChip.module.css";

type ChipKind = ProjectStatus | "team" | "self-reported";

const LABELS: Record<ChipKind, string> = {
  live: "Live",
  "pre-launch": "Pre-launch",
  team: "Team project",
  "self-reported": "Self-reported",
};

interface StatusChipProps {
  readonly kind: ChipKind;
}

/** Status is always spelled out in words, never carried by colour alone. */
export function StatusChip({ kind }: StatusChipProps) {
  return <span className={`${styles.chip} ${styles[kindClass(kind)]}`}>{LABELS[kind]}</span>;
}

function kindClass(kind: ChipKind): string {
  return kind === "pre-launch" ? "pre" : kind === "self-reported" ? "self" : kind;
}

/** Only self-reported claims get a chip; verified claims are the default and stay quiet. */
export function verificationChip(verification: Verification): ChipKind | null {
  return verification === "self-reported" ? "self-reported" : null;
}
