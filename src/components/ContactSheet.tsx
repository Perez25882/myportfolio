"use client";

import { useEffect, useRef, useState } from "react";
import { profile, type ContactIntent } from "@/content/profile";
import { useUiStore } from "@/store/ui";
import { ReviewMarker } from "./ReviewMarker";
import styles from "./ContactSheet.module.css";

type Contact = {
  readonly github: string;
  readonly email: string | null;
  readonly linkedin: string | null;
  readonly cvHref: string | null;
};

type Props = {
  readonly contact?: Contact;
};

type CopyState = "idle" | "copied" | "failed";

const COPY_MESSAGES: Record<CopyState, string> = {
  idle: "",
  copied: "Email address copied.",
  failed: "Couldn't copy. Select the address instead.",
};

/** Global contact panel: a side panel on desktop, a bottom sheet on mobile. */
export function ContactSheet({ contact = profile.contact }: Props) {
  const isOpen = useUiStore((state) => state.contactOpen);
  const closeContact = useUiStore((state) => state.closeContact);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) closeContact();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.sheet}
      aria-labelledby="contact-title"
      onClose={closeContact}
      onClick={handleBackdropClick}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 id="contact-title" className={styles.title}>
            Get in touch
          </h2>
          <button type="button" className={styles.close} onClick={closeContact}>
            Close
          </button>
        </header>
        <p className={styles.lede}>
          {profile.availability}: employment, freelance work and collaboration.
          <ReviewMarker decisions={profile.pending.roleLine} />
        </p>

        {contact.email ? <EmailBlock email={contact.email} /> : null}

        <ul className={styles.channels}>
          <li>
            <a href={contact.github} target="_blank" rel="noopener noreferrer">
              GitHub <span className={styles.meta}>github.com/Perez25882</span>
            </a>
          </li>
          {contact.linkedin ? (
            <li>
              <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </li>
          ) : null}
          {contact.cvHref ? (
            <li>
              <a href={contact.cvHref}>Download CV</a>
            </li>
          ) : null}
        </ul>

        {!contact.email || !contact.cvHref ? (
          <p className={styles.pending}>
            Email, contact form and CV will appear here once confirmed.
            <ReviewMarker decisions={profile.pending.contact} />
          </p>
        ) : null}
      </div>
    </dialog>
  );
}

function EmailBlock({ email }: { readonly email: string }) {
  const [intent, setIntent] = useState<ContactIntent>("Employment");
  const [copyState, setCopyState] = useState<CopyState>("idle");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  const mailto = `mailto:${email}?subject=${encodeURIComponent(`${intent} enquiry`)}`;

  return (
    <div className={styles.email}>
      <fieldset className={styles.intents}>
        <legend className={styles.legend}>I&apos;m getting in touch about</legend>
        {profile.intents.map((option) => (
          <button
            key={option}
            type="button"
            className={styles.intent}
            aria-pressed={intent === option}
            onClick={() => setIntent(option)}
          >
            {option}
          </button>
        ))}
      </fieldset>
      <div className={styles.emailRow}>
        <a className={styles.emailLink} href={mailto}>
          {email}
        </a>
        <button type="button" className={styles.copy} onClick={handleCopy}>
          Copy
        </button>
      </div>
      <p className={styles.status} role="status">
        {COPY_MESSAGES[copyState]}
      </p>
    </div>
  );
}
