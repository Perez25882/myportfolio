import { SHOW_REVIEW_MARKERS } from "@/content/review";
import type { DecisionId } from "@/content/types";
import styles from "./ReviewMarker.module.css";

interface ReviewMarkerProps {
  readonly decisions: readonly DecisionId[];
}

/** Review-build marker for content that waits on a founder decision. Renders nothing when markers are off. */
export function ReviewMarker({ decisions }: ReviewMarkerProps) {
  if (!SHOW_REVIEW_MARKERS || decisions.length === 0) return null;
  return (
    <span className={styles.marker} title="Waiting on a founder decision">
      To confirm · {decisions.join(", ")}
    </span>
  );
}
