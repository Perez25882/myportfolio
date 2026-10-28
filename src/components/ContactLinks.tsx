import { profile } from "@/content/profile";

interface ContactLinksProps {
  /** Applied to every link, so each page can style them as its own buttons or text links. */
  readonly linkClassName?: string;
  readonly showEmails?: boolean;
}

/** Every direct way to reach Perez, as plain links: email, WhatsApp, phone, LinkedIn, GitHub and CV. */
export function ContactLinks({ linkClassName, showEmails = true }: ContactLinksProps) {
  const { contact } = profile;
  const external = { target: "_blank", rel: "noopener noreferrer", className: linkClassName } as const;
  return (
    <>
      {showEmails
        ? contact.emails.map((email) => (
            <a key={email} href={`mailto:${email}`} className={linkClassName}>
              {email}
            </a>
          ))
        : null}
      {contact.phone ? (
        <>
          <a href={contact.phone.whatsapp} {...external}>
            WhatsApp<span className="visually-hidden"> {contact.phone.display} (opens in a new tab)</span>
          </a>
          <a href={contact.phone.tel} className={linkClassName}>
            Call {contact.phone.display}
          </a>
        </>
      ) : null}
      {contact.linkedin ? (
        <a href={contact.linkedin} {...external}>
          LinkedIn<span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      ) : null}
      <a href={contact.github} {...external}>
        GitHub<span className="visually-hidden"> (opens in a new tab)</span>
      </a>
      {contact.cvHref ? (
        <a href={contact.cvHref} className={linkClassName}>
          CV
        </a>
      ) : null}
    </>
  );
}
