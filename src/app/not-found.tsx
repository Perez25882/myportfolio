import Link from "next/link";
import ed from "@/components/editorial/editorial.module.css";
import styles from "./not-found.module.css";

/** A wrong turn: say what happened, then offer the three ways on. */
export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>This room doesn&apos;t exist</h1>
        <p className={`${ed.lede} ${styles.lede}`}>
          The link may be old, or the address mistyped. Everything in the museum is reachable from here.
        </p>
        <div className={ed.actions}>
          <Link className={`${ed.button} ${ed.primary}`} href="/">
            Return to the entrance
          </Link>
          <Link className={`${ed.button} ${ed.secondary}`} href="/quick">
            Open the portfolio
          </Link>
          <Link className={ed.textLink} href="/work-with-me">
            Work with me
          </Link>
        </div>
      </div>
    </div>
  );
}
