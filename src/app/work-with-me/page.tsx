import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactButton } from "@/components/ContactButton";
import { ReviewMarker } from "@/components/ReviewMarker";
import { Section } from "@/components/editorial/Section";
import ed from "@/components/editorial/editorial.module.css";
import { profile } from "@/content/profile";
import { process, services, servicesPending } from "@/content/services";
import styles from "./services.module.css";

export const metadata: Metadata = {
  title: "Work with me",
  description: "Websites, web apps, online shops and internal tools, built by Perez Tegbey from first conversation to launch.",
};

/** Work with me: freelance services, written for a business owner who isn't technical. */
export default function WorkWithMePage() {
  return (
    <div data-theme="light" className={ed.page}>
      <div className={ed.wrap}>
        <header className={styles.hero}>
          <h1 className={styles.title}>Work with me</h1>
          <p className={`${ed.lede} ${styles.lede}`}>
            I design and build websites, web apps and internal tools for businesses and individuals, from the first
            conversation to launch.
            <ReviewMarker decisions={servicesPending} />
          </p>
          <div className={ed.actions}>
            <ContactButton className={`${ed.button} ${ed.primary}`} label="Start a conversation" />
            <Link className={`${ed.button} ${ed.secondary}`} href="/quick#work">
              See the work
            </Link>
          </div>
        </header>

        <Section id="services" title="What I can build for you" note="In plain terms, with work on this site that shows the same kind of build.">
          <ul className={styles.services}>
            {services.map((service) => (
              <li key={service.id} className={styles.service}>
                <h3 className={styles.serviceName}>{service.name}</h3>
                <div>
                  <p className={styles.summary}>{service.summary}</p>
                  <ul className={styles.includes}>
                    {service.includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className={styles.evidence}>
                    See it in{" "}
                    {service.evidence.map((item, index) => (
                      <span key={item.href + item.label}>
                        {index > 0 ? " and " : null}
                        <Link href={item.href}>{item.label}</Link>
                      </span>
                    ))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="process" title="How a project works" note="Four steps, in this order.">
          <ol className={styles.process}>
            {process.map((step) => (
              <li key={step.title} className={styles.step}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p>{step.detail}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="proof" title="Work to look at first" note="Real projects, with what's verified and what isn't.">
          <ul className={styles.proof}>
            <ProofItem
              href="/work/flowdesk"
              src="/images/work/flowdesk-board.webp"
              width={1080}
              height={600}
              focus="0 35%"
              title="FlowDesk"
              detail="WhatsApp orders and payments for small shops. An interface reconstruction."
            />
            <ProofItem
              href="/work/joydatabundle"
              src="/images/work/joydatabundle-site.webp"
              width={1440}
              height={900}
              title="JoyDataBundle"
              detail="A live reseller platform, built in a team of three."
            />
            <ProofItem
              href="/museum"
              src="/images/work/museum-monument.webp"
              width={960}
              height={540}
              title="The 3D museum"
              detail="This site's own 3D world, built to run on phones."
            />
          </ul>
        </Section>

        <Section id="ready" title="Before you get in touch">
          <div className={ed.prose}>
            <p>It helps to know three things, but none of them has to be decided yet:</p>
            <ul className={styles.ready}>
              <li>What your business or project does, and who the site is for.</li>
              <li>What isn&apos;t working today, or what you&apos;d like people to be able to do.</li>
              <li>Any date you&apos;re working towards.</li>
            </ul>
          </div>
        </Section>

        <Section id="start" title="Tell me what you need built" tone="basalt">
          <p className={ed.lede}>{profile.availability} for freelance projects, as well as employment and collaboration.</p>
          <div className={`${ed.actions} ${styles.closing}`}>
            <ContactButton className={`${ed.button} ${ed.primary}`} label="Start a conversation" />
            <a className={`${ed.button} ${ed.secondary}`} href={profile.contact.github} target="_blank" rel="noopener noreferrer">
              GitHub <span className="visually-hidden">(opens in a new tab)</span>
            </a>
            <ReviewMarker decisions={profile.pending.contact} />
          </div>
        </Section>
      </div>
    </div>
  );
}

interface ProofItemProps {
  readonly href: string;
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly title: string;
  readonly detail: string;
  /** Where the crop centres; the board's order card sits at its left. */
  readonly focus?: string;
}

function ProofItem({ href, src, width, height, title, detail, focus = "center" }: ProofItemProps) {
  return (
    <li>
      <Link href={href} className={styles.proofLink}>
        <span className={styles.proofImage}>
          <Image
            src={src}
            alt=""
            width={width}
            height={height}
            sizes="(max-width: 48rem) 92vw, 25vw"
            style={{ objectPosition: focus }}
          />
        </span>
        <span className={styles.proofTitle}>{title}</span>
        <span className={styles.proofDetail}>{detail}</span>
      </Link>
    </li>
  );
}
