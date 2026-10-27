import styles from "./Wordmark.module.css";

interface WordmarkProps {
  readonly size?: "sm" | "lg";
  readonly showLockup?: boolean;
}

/** "PEREZ" with the seam: a horizontal cut through every letter, revealing a bronze line. */
export function Wordmark({ size = "sm", showLockup = false }: WordmarkProps) {
  return (
    <span className={`${styles.wordmark} ${styles[size]}`}>
      <span className={styles.letters}>PEREZ</span>
      {showLockup ? <span className={styles.lockup}>Museum of What&apos;s Possible</span> : null}
    </span>
  );
}
