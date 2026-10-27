import Link from "next/link";
import { ContactButton } from "./ContactButton";
import { Wordmark } from "./Wordmark";
import styles from "./TopBar.module.css";

/** Persistent museum signage: home, Quick View and Contact are reachable from every screen. */
export function TopBar() {
  return (
    <header className={styles.bar}>
      <Link href="/" className={styles.home} aria-label="PEREZ, Museum of What's Possible: home">
        <Wordmark />
      </Link>
      <nav aria-label="Primary" className={styles.nav}>
        <Link href="/quick" className={styles.link}>
          Quick View
        </Link>
        <ContactButton className={styles.contact} />
      </nav>
    </header>
  );
}
