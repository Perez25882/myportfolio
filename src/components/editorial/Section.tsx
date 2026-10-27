import type { ReactNode } from "react";
import styles from "./editorial.module.css";

interface SectionProps {
  readonly id: string;
  readonly title: string;
  /** One line under the title saying what the section holds. */
  readonly note?: ReactNode;
  /** "laterite" and "basalt" are full colour bands; use each at most once per page. */
  readonly tone?: "plain" | "laterite" | "basalt";
  readonly children: ReactNode;
}

/** A colonnade section: the title in the pier on the left, the content passing on the right. */
export function Section({ id, title, note, tone = "plain", children }: SectionProps) {
  const toneClass = tone === "plain" ? "" : `${styles.band} ${styles[tone]}`;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`${styles.section} ${toneClass}`}>
      <div className={styles.pier}>
        <div className={styles.pierInner}>
          <h2 id={`${id}-title`} className={styles.sectionTitle}>
            {title}
          </h2>
          {note ? <p className={styles.sectionNote}>{note}</p> : null}
        </div>
      </div>
      <div className={styles.content}>{children}</div>
    </section>
  );
}
