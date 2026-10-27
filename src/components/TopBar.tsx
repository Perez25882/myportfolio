"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContactButton } from "./ContactButton";
import { Wordmark } from "./Wordmark";
import styles from "./TopBar.module.css";

const LINKS = [
  { href: "/quick", label: "Portfolio", matches: (path: string) => path === "/quick" || path.startsWith("/work/") },
  { href: "/work-with-me", label: "Work with me", matches: (path: string) => path === "/work-with-me" },
] as const;

/** Persistent signage: home, the 2D portfolio, services and Contact are reachable from every screen. */
export function TopBar() {
  const pathname = usePathname();
  return (
    <header className={styles.bar}>
      <Link href="/" className={styles.home} aria-label="PEREZ, Museum of What's Possible: home">
        <Wordmark />
      </Link>
      <nav aria-label="Primary" className={styles.nav}>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={styles.link}
            aria-current={link.matches(pathname) ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
        <ContactButton className={styles.contact} />
      </nav>
    </header>
  );
}
