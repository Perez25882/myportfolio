import type { Metadata } from "next";
import Link from "next/link";
import { CaptionToggle } from "@/components/CaptionToggle";
import { ReviewMarker } from "@/components/ReviewMarker";
import { StatusChip, verificationChip } from "@/components/StatusChip";
import { StrataList } from "@/components/StrataList";
import { flowdeskCaseStudy } from "@/content/flowdesk";
import { getProject } from "@/content/projects";
import styles from "./flowdesk.module.css";

const project = getProject("flowdesk");

export const metadata: Metadata = {
  title: "FlowDesk",
  description: project?.purpose,
};

/** FlowDesk case study: the HTML mirror of the FlowDesk exhibition room. */
export default function FlowDeskPage() {
  if (!project) throw new Error("FlowDesk is missing from the content register");

  return (
    <article className={styles.page} aria-labelledby="flowdesk-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>Exhibit · {project.exhibitTitle}</p>
        <h1 id="flowdesk-title" className={styles.title}>
          {project.name}
        </h1>
        <p className={styles.lede}>{project.purpose}</p>
        <div className={styles.meta}>
          <StatusChip kind={project.status} />
          <span>{flowdeskCaseStudy.statusNote}</span>
        </div>
        <p className={styles.role}>
          Role: {project.role}
          <ReviewMarker decisions={project.pending.filter((id) => id === "D1")} />
        </p>
      </header>

      <section aria-labelledby="problem-title" className={styles.section}>
        <h2 id="problem-title" className={styles.heading}>
          The problem
        </h2>
        <p>{flowdeskCaseStudy.problem}</p>
        <p>{flowdeskCaseStudy.answer}</p>
      </section>

      <section aria-labelledby="beneath-title" className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 id="beneath-title" className={styles.heading}>
            Look beneath the surface
          </h2>
          <CaptionToggle />
        </div>
        <p className={styles.muted}>
          Seven layers, from a WhatsApp message arriving to an order on the shop&apos;s board.
        </p>
        <StrataList strata={flowdeskCaseStudy.strata} />
        <blockquote className={styles.thesis}>{flowdeskCaseStudy.thesis}</blockquote>
      </section>

      <section aria-labelledby="demo-title" className={styles.section}>
        <h2 id="demo-title" className={styles.heading}>
          The demonstration
        </h2>
        <p>
          A scripted simulation arrives with the FlowDesk room: a customer orders, FlowDesk identifies the products, the
          customer offers less, the shop&apos;s price floor holds, and the order is recorded. It is a simulation, not a
          live WhatsApp connection.
        </p>
      </section>

      <section aria-labelledby="evidence-title" className={styles.section}>
        <h2 id="evidence-title" className={styles.heading}>
          Evidence
        </h2>
        <ul className={styles.evidence}>
          {project.highlights.map((claim) => {
            const chip = verificationChip(claim.verification);
            return (
              <li key={claim.text}>
                {claim.text} {chip ? <StatusChip kind={chip} /> : null}
              </li>
            );
          })}
        </ul>
        <p className={styles.muted}>
          The repository link will be added once a setup document with private details has been cleaned.
          <ReviewMarker decisions={["D3"]} />
        </p>
      </section>

      <nav aria-label="Case study" className={styles.nav}>
        <Link href="/quick#work">← All selected work</Link>
        <Link href="/museum">Enter the museum</Link>
      </nav>
    </article>
  );
}
