import Link from "next/link";
import { StatusChip, verificationChip } from "@/components/StatusChip";
import ed from "@/components/editorial/editorial.module.css";
import type { CaseNote } from "@/content/caseStudies";
import { projects } from "@/content/projects";
import type { Project } from "@/content/types";
import { ProjectVisual } from "./ProjectVisual";
import styles from "./case.module.css";

/** The top of every case study: what it is, where it stands, who did what, and its visual. */
export function CaseHero({ project, status }: { readonly project: Project; readonly status: string }) {
  return (
    <>
      <header className={styles.hero}>
        <Link className={styles.trail} href="/quick#work">
          Selected work
        </Link>
        <h1 id="case-title" className={styles.title}>
          {project.name}
        </h1>
        <p className={`${ed.lede} ${styles.purpose}`}>{project.purpose}</p>
        <dl className={styles.meta}>
          <div>
            <dt>Status</dt>
            <dd>
              <span className={styles.chips}>
                <StatusChip kind={project.status} />
                {project.isTeamProject ? <StatusChip kind="team" /> : null}
              </span>
              {status}
            </dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>
              {project.role}
            </dd>
          </div>
          <div>
            <dt>Built with</dt>
            <dd className={ed.mono}>{project.stack.join(", ")}</dd>
          </div>
          {project.links.length > 0 ? (
            <div>
              <dt>Links</dt>
              <dd className={styles.links}>
                {project.links.map((link) => (
                  <a key={link.href} href={link.href} className={ed.textLink} target="_blank" rel="noopener noreferrer">
                    {link.label} <span aria-hidden="true">↗</span>
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
      </header>
      <ProjectVisual slug={project.slug} size="hero" />
    </>
  );
}

/** Engineering decisions, each with where it was verified. Not a sequence, so not numbered. */
export function CaseNotes({ notes }: { readonly notes: readonly CaseNote[] }) {
  return (
    <ul className={styles.notes}>
      {notes.map((note) => {
        const chip = verificationChip(note.verification);
        return (
          <li key={note.title} className={styles.note}>
            <h3 className={styles.noteTitle}>{note.title}</h3>
            <div>
              <p className={ed.prose}>
                {note.body} {chip ? <StatusChip kind={chip} /> : null}
              </p>
              <p className={styles.source}>
                Source: <span className={ed.mono}>{note.source}</span>
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** The way onward: the next flagship project, the full list, and the museum. */
export function NextProject({ slug }: { readonly slug: string }) {
  const index = projects.findIndex((project) => project.slug === slug);
  const next = projects[(index + 1) % projects.length];
  return (
    <nav aria-label="More work" className={styles.onward}>
      <Link href={next.caseStudyHref ?? "/quick#work"} className={styles.next}>
        <span className={styles.nextLabel}>Next project</span>
        <span className={styles.nextName}>{next.name}</span>
        <span className={styles.nextPurpose}>{next.purpose}</span>
      </Link>
      <div className={ed.actions}>
        <Link className={ed.textLink} href="/quick#work">
          All selected work
        </Link>
        <Link className={ed.textLink} href="/work-with-me">
          Work with me
        </Link>
        <Link className={ed.textLink} href="/museum">
          Enter the 3D museum
        </Link>
      </div>
    </nav>
  );
}
