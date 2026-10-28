import type { CSSProperties, ReactNode } from "react";
import { CHAPTERS, type ChapterId } from "@/journey/chapters";
import styles from "./journey.module.css";

/**
 * Layout primitives for the journey's chapters. Each chapter is a real section of the page, as
 * tall as its stretch of the camera path; its text sits in panels that hold still while the
 * scene moves behind them. In the flat layout (no WebGL) the same sections simply stack.
 */

type Tone = "plaster" | "basalt" | "laterite";

interface ChapterProps {
  readonly id: ChapterId;
  /** Background in the flat layout, where there is no scene behind the text. */
  readonly tone?: Tone;
  readonly children: ReactNode;
}

export function Chapter({ id, tone = "plaster", children }: ChapterProps) {
  const length = CHAPTERS.find((chapter) => chapter.id === id)?.length ?? 1;
  return (
    <section
      id={id}
      data-chapter={id}
      data-tone={tone}
      className={styles.chapter}
      aria-labelledby={`${id}-title`}
      style={{ "--length": length } as CSSProperties}
    >
      {children}
    </section>
  );
}

interface BeatProps {
  readonly children: ReactNode;
  /** A plaster panel (default), a basalt one, or bare text set straight on the scene. */
  readonly surface?: "plaster" | "basalt" | "bare";
  readonly className?: string;
}

const SURFACE_CLASS = { plaster: styles.panel, basalt: `${styles.panel} ${styles.panelDark}`, bare: styles.bare } as const;

/** One step of a chapter: a share of its height, with a panel that stays on screen through it. */
export function Beat({ children, surface = "plaster", className }: BeatProps) {
  return (
    <div className={styles.beat}>
      <div
        className={`${SURFACE_CLASS[surface]} ${className ?? ""}`}
        data-theme={surface === "plaster" ? "light" : undefined}
        data-reveal={surface === "bare" ? undefined : ""}
      >
        {children}
      </div>
    </div>
  );
}

/** Shown only in the flat layout: the picture that stands in for the scene. */
export function FlatVisual({ children }: { readonly children: ReactNode }) {
  return <div className={styles.flat}>{children}</div>;
}
