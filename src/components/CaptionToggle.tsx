"use client";

import { useUiStore, type CaptionMode } from "@/store/ui";
import styles from "./CaptionToggle.module.css";

const OPTIONS: readonly { readonly mode: CaptionMode; readonly label: string }[] = [
  { mode: "plain", label: "Plain" },
  { mode: "technical", label: "Technical" },
];

/** Global Plain ⇄ Technical caption switch. */
export function CaptionToggle() {
  const captionMode = useUiStore((state) => state.captionMode);
  const setCaptionMode = useUiStore((state) => state.setCaptionMode);

  return (
    <div role="group" aria-label="Caption detail" className={styles.toggle}>
      {OPTIONS.map(({ mode, label }) => (
        <button
          key={mode}
          type="button"
          className={styles.option}
          aria-pressed={captionMode === mode}
          onClick={() => setCaptionMode(mode)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
