import type { Metadata } from "next";
import Link from "next/link";
import { ContactButton } from "@/components/ContactButton";
import { ReviewMarker } from "@/components/ReviewMarker";
import { StatusChip, verificationChip } from "@/components/StatusChip";
import { capabilities } from "@/content/capabilities";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { SHOW_REVIEW_MARKERS } from "@/content/review";
import { story } from "@/content/story";
import type { Project } from "@/content/types";
import { formatMonth } from "@/lib/format";
import styles from "./quick.module.css";

export const metadata: Metadata = {
  title: "Quick View",
  description: `${profile.name}: selected work, story and skills at a glance.`,
};

/** Recruiter Quick View: everything readable in under a minute, no WebGL. */
export default function QuickViewPage() {
  return (
    <div data-theme="light" className={styles.page}>
      <div className={styles.column}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Quick View</p>
          <h1 className={styles.name}>{profile.name}</h1>
          <p className={styles.role}>
            {profile.roleLine}
            <span className={styles.available}>{profile.availability}</span>
            <ReviewMarker decisions={profile.pending.roleLine} />
          </p>
          <div className={styles.actions}>
            <ContactButton className={styles.primary} />
            <a className={styles.secondary} href={profile.contact.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <Link className={styles.secondary} href="/museum">
              Enter the museum
            </Link>
          </div>
        </header>

        <section aria-labelledby="build-title" className={styles.section}>
          <h2 id="build-title" className={styles.heading}>
            What I build
            <ReviewMarker decisions={profile.pending.whatIBuild} />
          </h2>
          <ul className={styles.build}>
            {profile.whatIBuild.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <section id="work" aria-labelledby="work-title" className={styles.section}>
          <h2 id="work-title" className={styles.heading}>
            Selected work
          </h2>
          <ol className={styles.projects}>
            {projects.map((project) => (
              <li key={project.slug}>
                <ProjectEntry project={project} />
              </li>
            ))}
          </ol>
        </section>

        <section id="story" aria-labelledby="story-title" className={styles.section}>
          <h2 id="story-title" className={styles.heading}>
            Story so far
          </h2>
          <ol className={styles.story}>
            {story.map((entry) => (
              <li key={entry.date}>
                <time dateTime={entry.date} className={styles.date}>
                  {formatMonth(entry.date)}
                </time>
                <div>
                  <h3 className={styles.storyTitle}>{entry.title}</h3>
                  <p className={styles.muted}>{entry.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className={styles.footnote}>Dates are first public commits, not project start dates.</p>
        </section>

        <section id="skills" aria-labelledby="skills-title" className={styles.section}>
          <h2 id="skills-title" className={styles.heading}>
            Skills
          </h2>
          <dl className={styles.skills}>
            {capabilities.map((group) => (
              <div key={group.group}>
                <dt>{group.group}</dt>
                <dd>{group.items.join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="contact" aria-labelledby="contact-title-quick" className={styles.section}>
          <h2 id="contact-title-quick" className={styles.heading}>
            Opportunities
          </h2>
          <p>Open to employment, freelance work and collaboration.</p>
          <div className={styles.actions}>
            <ContactButton className={styles.primary} label="Get in touch" />
          </div>
        </section>
      </div>
    </div>
  );
}

function ProjectEntry({ project }: { readonly project: Project }) {
  return (
    <article className={styles.project} aria-labelledby={`${project.slug}-title`}>
      <p className={styles.exhibit}>{project.exhibitTitle}</p>
      <div className={styles.projectHead}>
        <h3 id={`${project.slug}-title`} className={styles.projectName}>
          {project.name}
        </h3>
        <div className={styles.chips}>
          <StatusChip kind={project.status} />
          {project.isTeamProject ? <StatusChip kind="team" /> : null}
        </div>
      </div>
      <p>{project.purpose}</p>
      <dl className={styles.facts}>
        <div>
          <dt>Role</dt>
          <dd>
            {project.role}
            <ReviewMarker decisions={project.pending.filter((id) => id === "D1")} />
          </dd>
        </div>
        <div>
          <dt>Stack</dt>
          <dd className={styles.mono}>{project.stack.join(" · ")}</dd>
        </div>
      </dl>
      <ul className={styles.highlights}>
        {project.highlights.map((claim) => {
          const chip = verificationChip(claim.verification);
          return (
            <li key={claim.text}>
              {claim.text} {chip ? <StatusChip kind={chip} /> : null}
            </li>
          );
        })}
      </ul>
      <ProjectLinks project={project} />
    </article>
  );
}

function ProjectLinks({ project }: { readonly project: Project }) {
  const hasLinks = project.caseStudyHref || project.links.length > 0;
  const showWithheld = SHOW_REVIEW_MARKERS && project.withheldLinks.length > 0;
  if (!hasLinks && !showWithheld) return null;

  return (
    <div className={styles.links}>
      {project.caseStudyHref ? (
        <Link href={project.caseStudyHref} className={styles.link}>
          Case study <span aria-hidden="true">→</span>
        </Link>
      ) : null}
      {project.links.map((link) => (
        <a key={link.href} href={link.href} className={styles.link} target="_blank" rel="noopener noreferrer">
          {link.label} <span aria-hidden="true">↗</span>
        </a>
      ))}
      {showWithheld
        ? project.withheldLinks.map((withheld) => (
            <span key={withheld.label} className={styles.withheld}>
              {withheld.label} link withheld
              <ReviewMarker decisions={[withheld.reason]} />
            </span>
          ))
        : null}
    </div>
  );
}
