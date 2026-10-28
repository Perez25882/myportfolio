"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { profile, type ContactIntent } from "@/content/profile";
import { useUiStore } from "@/store/ui";
import styles from "./ContactSheet.module.css";

type Contact = {
  readonly github: string;
  readonly emails: readonly string[];
  readonly linkedin: string | null;
  readonly phone: { readonly display: string; readonly tel: string; readonly whatsapp: string } | null;
  readonly cvHref: string | null;
};

type Props = {
  readonly contact?: Contact;
};

type CopyState = { readonly status: "idle" } | { readonly status: "copied"; readonly email: string } | { readonly status: "failed" };

function copyMessage(state: CopyState): string {
  if (state.status === "copied") return `${state.email} copied.`;
  if (state.status === "failed") return "Couldn't copy. Select the address instead.";
  return "";
}

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
        </p>

        {contact.emails.length > 0 ? <EmailBlock emails={contact.emails} /> : null}

        <ul className={styles.channels}>
          {contact.phone ? (
            <>
              <li>
                <a href={contact.phone.whatsapp} target="_blank" rel="noopener noreferrer">
                  WhatsApp <span className={styles.meta}>{contact.phone.display}</span>
                </a>
              </li>
              <li>
                <a href={contact.phone.tel}>
                  Call <span className={styles.meta}>{contact.phone.display}</span>
                </a>
              </li>
            </>
          ) : null}
          {contact.linkedin ? (
            <li>
              <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </li>
          ) : null}
          <li>
            <a href={contact.github} target="_blank" rel="noopener noreferrer">
              GitHub <span className={styles.meta}>github.com/Perez25882</span>
            </a>
          </li>
          {contact.cvHref ? (
            <li>
              <a href={contact.cvHref}>Download CV</a>
            </li>
          ) : null}
        </ul>

        <p className={styles.project}>
          Planning a project?{" "}
          <Link href="/work-with-me" onClick={closeContact}>
            See how working together works
          </Link>
        </p>
      </div>
    </dialog>
  );
}

function EmailBlock({ emails }: { readonly emails: readonly string[] }) {
  const [intent, setIntent] = useState<ContactIntent>("Employment");
  const [copyState, setCopyState] = useState<CopyState>({ status: "idle" });

  const handleCopy = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopyState({ status: "copied", email });
    } catch {
      setCopyState({ status: "failed" });
    }
  };

  const subject = encodeURIComponent(`${intent} enquiry`);

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
      {emails.map((email) => (
        <div key={email} className={styles.emailRow}>
          <a className={styles.emailLink} href={`mailto:${email}?subject=${subject}`}>
            {email}
          </a>
          <button type="button" className={styles.copy} onClick={() => handleCopy(email)} aria-label={`Copy ${email}`}>
            Copy
          </button>
        </div>
      ))}
      <p className={styles.status} role="status">
        {copyMessage(copyState)}
      </p>
    </div>
  );
}
