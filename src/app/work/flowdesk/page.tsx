import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CaptionToggle } from "@/components/CaptionToggle";
import { ReviewMarker } from "@/components/ReviewMarker";
import { StatusChip, verificationChip } from "@/components/StatusChip";
import { StrataList } from "@/components/StrataList";
import { Section } from "@/components/editorial/Section";
import ed from "@/components/editorial/editorial.module.css";
import { CaseHero, NextProject } from "@/components/work/CaseStudy";
import { ConversationDemo } from "@/components/work/ConversationDemo";
import caseStyles from "@/components/work/case.module.css";
import { flowdeskCaseStudy } from "@/content/flowdesk";
import { getProject } from "@/content/projects";
import styles from "./flowdesk.module.css";

const project = getProject("flowdesk");

export const metadata: Metadata = {
  title: "FlowDesk",
  description: project?.purpose,
};

/** FlowDesk case study: the 2D mirror of the FlowDesk room, with the demonstration playable here. */
export default function FlowDeskPage() {
  if (!project) throw new Error("FlowDesk is missing from the content register");

  return (
    <article data-theme="light" className={ed.page} aria-labelledby="case-title">
      <div className={ed.wrap}>
        <CaseHero project={project} status={flowdeskCaseStudy.statusNote} />

        <Section id="problem" title="The problem">
          <h3 className={caseStyles.openingTitle}>Orders, haggling and payment proof get lost in chat threads</h3>
          <div className={ed.prose}>
            <p>{flowdeskCaseStudy.problem}</p>
            <p>{flowdeskCaseStudy.answer}</p>
          </div>
        </Section>

        <Section
          id="demo"
          title="Play the customer"
          note="Send the customer's messages and watch what FlowDesk does with each one."
        >
          <ConversationDemo />
        </Section>

        <Section id="beneath" title="Look beneath the surface" note="Seven layers, in the order a message passes through them.">
          <div className={styles.beneathHead}>
            <CaptionToggle />
          </div>
          <StrataList strata={flowdeskCaseStudy.strata} />
          <blockquote className={styles.thesis}>
            <p>{flowdeskCaseStudy.thesis}</p>
          </blockquote>
        </Section>

        <Section id="evidence" title="Evidence" note="Checked in the repository. The repository itself isn't linked yet.">
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
          <p className={`${ed.muted} ${styles.withheld}`}>
            The repository link will be added once a setup document with private details has been cleaned.
            <ReviewMarker decisions={["D3"]} />
          </p>
        </Section>

        <Section id="exhibit" title="In the museum" note="FlowDesk is also a room in the 3D museum.">
          <figure className={styles.exhibit}>
            <Image
              src="/images/work/flowdesk-exhibit.webp"
              alt="The FlowDesk room in the museum: a basalt pipeline table with bronze stations, and the owner's board on the far wall."
              width={960}
              height={540}
              sizes="(max-width: 64rem) 92vw, 60vw"
            />
            <figcaption className={ed.muted}>
              The pipeline table, rendered in Blender. <Link href="/museum?stop=hall">Walk the room in 3D</Link>
            </figcaption>
          </figure>
        </Section>

        <NextProject slug="flowdesk" />
      </div>
    </article>
  );
}
