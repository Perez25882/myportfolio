import Link from "next/link";
import type { ReactNode } from "react";
import { ReviewMarker } from "@/components/ReviewMarker";
import { StatusChip } from "@/components/StatusChip";
import { ProjectVisual } from "@/components/work/ProjectVisual";
import { getCaseStudy } from "@/content/caseStudies";
import { flowdeskCaseStudy } from "@/content/flowdesk";
import { getProject } from "@/content/projects";
import type { Project } from "@/content/types";
import { Beat, Chapter, FlatVisual } from "./Chapter";
import styles from "./journey.module.css";

/**
 * The four flagship projects, each told across a few beats while its scene plays behind. Every
 * sentence comes from the verified content modules (projects.ts, flowdesk.ts, caseStudies.ts);
 * the full case study is one link away from each chapter.
 */

function required<T>(value: T | undefined, name: string): T {
  if (value === undefined) throw new Error(`Missing content: ${name}`);
  return value;
}

const flowdesk = required(getProject("flowdesk"), "flowdesk");
const ledgermind = required(getProject("ledgermind"), "ledgermind");
const accra = required(getProject("accra-we-dey"), "accra-we-dey");
const joydata = required(getProject("joydatabundle"), "joydatabundle");
const ledgermindStudy = required(getCaseStudy("ledgermind"), "ledgermind case study");
const accraStudy = required(getCaseStudy("accra-we-dey"), "accra case study");
const joydataStudy = required(getCaseStudy("joydatabundle"), "joydatabundle case study");

const note = (notes: readonly { title: string; body: string }[], title: string) =>
  required(notes.find((entry) => entry.title === title), title).body;

function ProjectHead({ project, number, id }: { readonly project: Project; readonly number: number; readonly id: string }) {
  return (
    <>
      <p className={styles.kicker}>
        <span>Project {number} of 4</span>
        <StatusChip kind={project.status} />
        {project.isTeamProject ? <StatusChip kind="team" /> : null}
      </p>
      <h2 id={id} className={styles.title}>
        {project.name}
      </h2>
      <p className={styles.subtitle}>{project.exhibitTitle}</p>
    </>
  );
}

function CaseLinks({ project, extra }: { readonly project: Project; readonly extra?: ReactNode }) {
  return (
    <p className={styles.links}>
      {project.caseStudyHref ? (
        <Link href={project.caseStudyHref} className={styles.primaryLink}>
          Read the {project.name} case study
        </Link>
      ) : null}
      {project.links.map((link) => (
        <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
          {link.label}
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      ))}
      {extra}
    </p>
  );
}

export function FlowDeskChapter() {
  const strata = flowdeskCaseStudy.strata;
  const stratum = (id: string) => required(strata.find((entry) => entry.id === id), id);
  return (
    <Chapter id="flowdesk">
      <Beat>
        <ProjectHead project={flowdesk} number={1} id="flowdesk-title" />
        <p>{flowdesk.purpose}</p>
        <FlatVisual>
          <ProjectVisual slug="flowdesk" />
        </FlatVisual>
      </Beat>
      <Beat>
        <h3 className={styles.beatTitle}>It starts with a chat</h3>
        <p>{flowdeskCaseStudy.problem}</p>
        <p>{flowdeskCaseStudy.answer}</p>
      </Beat>
      <Beat>
        <h3 className={styles.beatTitle}>Seven layers handle every message</h3>
        <ol className={styles.layers}>
          {strata.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.title}</strong>
              <span className={styles.layerPlain}> {entry.plain}</span>
            </li>
          ))}
        </ol>
        <p className={styles.thesis}>{flowdeskCaseStudy.thesis}</p>
      </Beat>
      <Beat>
        <h3 className={styles.beatTitle}>The owner sees the order</h3>
        <p>
          {stratum("shop-view").plain} {stratum("money").plain}
        </p>
        <p className={styles.small}>{flowdeskCaseStudy.statusNote}</p>
        <CaseLinks project={flowdesk} extra={<Link href="/museum?stop=conversation">Play the customer in the guided tour</Link>} />
        <ReviewMarker decisions={flowdesk.pending} />
      </Beat>
    </Chapter>
  );
}

export function LedgerMindChapter() {
  const notes = ledgermindStudy.notes;
  return (
    <Chapter id="ledgermind">
      <Beat>
        <ProjectHead project={ledgermind} number={2} id="ledgermind-title" />
        <p>{ledgermindStudy.opening.body}</p>
        <FlatVisual>
          <ProjectVisual slug="ledgermind" />
        </FlatVisual>
      </Beat>
      <Beat>
        <h3 className={styles.beatTitle}>The connection drops</h3>
        <p>{note(notes, "Sales wait on the device")}</p>
      </Beat>
      <Beat>
        <h3 className={styles.beatTitle}>Sent twice, counted once</h3>
        <p>{note(notes, "Sent twice, counted once")}</p>
      </Beat>
      <Beat>
        <h3 className={styles.beatTitle}>The server decides stock</h3>
        <p>{note(notes, "The server decides stock")}</p>
        <p className={styles.small}>
          In this illustration another branch sells one item while this shop is offline, so the counter&apos;s figure
          changes after the sync. {ledgermindStudy.status}
        </p>
        <CaseLinks project={ledgermind} />
        <ReviewMarker decisions={ledgermind.pending} />
      </Beat>
    </Chapter>
  );
}

export function AccraChapter() {
  const notes = accraStudy.notes;
  return (
    <Chapter id="accra">
      <Beat>
        <ProjectHead project={accra} number={3} id="accra-title" />
        <p>{accraStudy.opening.body}</p>
        <p className={styles.small}>This city is an Accra-inspired illustration, not the game&apos;s own map or art.</p>
        <FlatVisual>
          <ProjectVisual slug="accra-we-dey" />
        </FlatVisual>
      </Beat>
      <Beat>
        <h3 className={styles.beatTitle}>A city to move around</h3>
        <p>{note(notes, "A map of the real city")}</p>
        <p>{note(notes, "Characters built by script")}</p>
      </Beat>
      <Beat>
        <h3 className={styles.beatTitle}>Built for a crowd</h3>
        <p>
          {note(notes, "Built for a crowd")} <StatusChip kind="self-reported" />
        </p>
        <p className={styles.small}>{accraStudy.status}</p>
        <CaseLinks project={accra} />
        <ReviewMarker decisions={accra.pending} />
      </Beat>
    </Chapter>
  );
}

export function JoyDataBundleChapter() {
  const notes = joydataStudy.notes;
  return (
    <Chapter id="joydatabundle">
      <Beat>
        <ProjectHead project={joydata} number={4} id="joydatabundle-title" />
        <p>{joydataStudy.opening.body}</p>
        <FlatVisual>
          <ProjectVisual slug="joydatabundle" />
        </FlatVisual>
      </Beat>
      <Beat>
        <h3 className={styles.beatTitle}>Perez&apos;s part: the frontend</h3>
        <p>{note(notes, "A team of three")}</p>
        <p className={styles.small}>In the scene, the backend is drawn in grey: it is a teammate&apos;s work.</p>
      </Beat>
      <Beat>
        <h3 className={styles.beatTitle}>Payouts checked before they&apos;re paid</h3>
        <p>{note(notes, "Payouts that are checked before they're paid")}</p>
        <p className={styles.small}>{note(notes, "Live")}</p>
        <CaseLinks project={joydata} />
        <ReviewMarker decisions={joydata.pending} />
      </Beat>
    </Chapter>
  );
}
