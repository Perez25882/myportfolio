"use client";

import type { Stratum } from "@/content/flowdesk";
import { useUiStore } from "@/store/ui";
import styles from "./StrataList.module.css";

type Props = {
  readonly strata: readonly Stratum[];
};

/** DOM mirror of an exhibit's "Look beneath" reveal: one layer per stratum, captioned for the chosen audience. */
export function StrataList({ strata }: Props) {
  const captionMode = useUiStore((state) => state.captionMode);

  return (
    <ol className={styles.list}>
      {strata.map((stratum, index) => (
        <li key={stratum.id} className={styles.stratum}>
          <span className={styles.index} aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className={styles.title}>{stratum.title}</h3>
            <p className={captionMode === "technical" ? styles.technical : styles.plain}>
              {captionMode === "technical" ? stratum.technical : stratum.plain}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
