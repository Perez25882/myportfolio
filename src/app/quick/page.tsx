import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactButton } from "@/components/ContactButton";
import { ContactLinks } from "@/components/ContactLinks";
import { StatusChip, verificationChip } from "@/components/StatusChip";
import { Section } from "@/components/editorial/Section";
import ed from "@/components/editorial/editorial.module.css";
import { ProjectVisual } from "@/components/work/ProjectVisual";
import { flowdeskCaseStudy } from "@/content/flowdesk";
import { experiments } from "@/content/lab";
import { profile } from "@/content/profile";
import { getProject, projects } from "@/content/projects";
import { services } from "@/content/services";
import { currentFocus, familiarSkills, shippedSkills } from "@/content/skills";
import { story } from "@/content/story";
import type { Project } from "@/content/types";
import { formatMonth } from "@/lib/format";
import styles from "./quick.module.css";

export const metadata: Metadata = {
  title: "Portfolio",
  description: `${profile.name}: selected work, experience, skills and freelance services.`,
};

/** The 2D portfolio: complete on its own, no WebGL needed. */
export default function QuickViewPage() {
  return (
    <div data-theme="light" className={ed.page}>
      <div className={ed.wrap}>
        <Hero />
        <About />
        <Work />
        <Experience />
        <Skills />
        <WorkWithMe />
        <Lab />
        <InProgress />
        <Contact />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroText}>
        <p className={styles.availability}>
          <span className={styles.dot} aria-hidden="true" />
          {profile.availability}: employment, freelance work and collaboration
        </p>
        <h1 className={styles.name}>
          <span className={styles.cast}>{profile.name}</span>
        </h1>
        <p className={styles.role}>
          {profile.roleLine}
        </p>
        <p className={`${ed.lede} ${styles.statement}`}>
          I build software around how Ghanaian businesses already work: orders that arrive on WhatsApp, payments made
          with mobile money, and shops that have to keep selling when the internet drops. Sometimes I build whole worlds in
          the browser.
        </p>
        <div className={ed.actions}>
          <a className={`${ed.button} ${ed.primary}`} href="#work">
            See selected work
          </a>
          <Link className={`${ed.button} ${ed.secondary}`} href="/work-with-me">
            Work with me
          </Link>
          <Link className={ed.textLink} href="/museum">
            Enter the 3D museum
          </Link>
        </div>
      </div>
      <figure className={styles.portal}>
        <div className={styles.portalFrame}>
          <Image
            src="/images/arrival-landscape.webp"
            alt="The museum courtyard at morning: the bronze Code Monument on its plinth between two lattice towers."
            width={1920}
            height={1080}
            priority
            sizes="(max-width: 64rem) 92vw, 40vw"
            className={styles.portalImage}
          />
        </div>
        <figcaption className={styles.portalCaption}>
          The museum courtyard, built and lit in Blender. <Link href="/museum">Walk through it in 3D</Link>
        </figcaption>
      </figure>
    </header>
  );
}

function About() {
  return (
    <Section id="about" title="About" note="Who builds the work on this page.">
      <div className={ed.prose}>
        <p>
          I&apos;m Perez Tegbey, a Ghanaian developer who builds products end to end: the database, the backend, the
          interface, and lately the 3D.
        </p>
      </div>
      <p className={styles.motto}>
        {profile.narrativeLine[0]} {profile.narrativeLine[1]}
      </p>
      <h3 className={`${ed.subTitle} ${styles.buildTitle}`}>
        What I build
      </h3>
      <ul className={styles.build}>
        {profile.whatIBuild.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </Section>
  );
}

function Work() {
  return (
    <Section id="work" title="Selected work" note="Four projects. Self-reported figures are marked as such.">
      <ol className={styles.plates}>
        {projects.map((project) => (
          <li key={project.slug}>
            <ProjectPlate project={project} />
          </li>
        ))}
      </ol>
    </Section>
  );
}

function ProjectPlate({ project }: { readonly project: Project }) {
  return (
    <article className={styles.plate} aria-labelledby={`${project.slug}-title`}>
      <ProjectVisual slug={project.slug} />
      <div className={styles.plateBody}>
        <div className={styles.plateMain}>
          <div className={styles.plateHead}>
            <h3 id={`${project.slug}-title`} className={styles.plateTitle}>
              {project.name}
            </h3>
            <div className={styles.chips}>
              <StatusChip kind={project.status} />
              {project.isTeamProject ? <StatusChip kind="team" /> : null}
            </div>
          </div>
          <p className={styles.purpose}>{project.purpose}</p>
          <ul className={styles.highlights}>
            {project.highlights.slice(0, 2).map((claim) => {
              const chip = verificationChip(claim.verification);
              return (
                <li key={claim.text}>
                  {claim.text} {chip ? <StatusChip kind={chip} /> : null}
                </li>
              );
            })}
          </ul>
          <ProjectLinks project={project} />
        </div>
        <dl className={styles.facts}>
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
        </dl>
      </div>
    </article>
  );
}

function ProjectLinks({ project }: { readonly project: Project }) {
  return (
    <div className={styles.links}>
      {project.caseStudyHref ? (
        <Link href={project.caseStudyHref} className={ed.textLink}>
          Read the case study
        </Link>
      ) : null}
      {project.links.map((link) => (
        <a key={link.href} href={link.href} className={ed.textLink} target="_blank" rel="noopener noreferrer">
          {link.label} <span aria-hidden="true">↗</span>
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      ))}
    </div>
  );
}

function Experience() {
  return (
    <Section
      id="experience"
      title="Experience"
      note="Dated by first public commit, which isn't the same as a start date."
    >
      <ol className={styles.timeline}>
        {story.map((entry) => (
          <li key={entry.date}>
            <time dateTime={entry.date} className={styles.when}>
              {formatMonth(entry.date)}
            </time>
            <div>
              <h3 className={styles.timelineTitle}>{entry.title}</h3>
              <p className={ed.muted}>{entry.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className={styles.teamNote}>
        Team experience: frontend contributor in a three-person team on JoyDataBundle, a live product.
      </p>
    </Section>
  );
}

function Skills() {
  return (
    <Section id="skills" title="Skills" note="Grouped by what they make possible, and tied to the projects that show them.">
      <h3 className={`${ed.subTitle} ${styles.tierTitle}`}>Used in the projects above</h3>
      <ul className={styles.skillRows}>
        {shippedSkills.map((skill) => (
          <li key={skill.area} className={styles.skillRow}>
            <h4 className={styles.skillArea}>{skill.area}</h4>
            <p className={styles.skillCapability}>{skill.capability}</p>
            <p className={`${ed.mono} ${styles.skillTools}`}>{skill.tools.join(", ")}</p>
            <p className={styles.skillWhere}>
              Shown in{" "}
              {skill.projects.map((slug, index) => {
                const project = getProject(slug);
                if (!project) return null;
                return (
                  <span key={slug}>
                    {index > 0 ? (index === skill.projects.length - 1 ? " and " : ", ") : null}
                    <Link href={project.caseStudyHref ?? "#work"}>{project.name}</Link>
                  </span>
                );
              })}
            </p>
          </li>
        ))}
      </ul>
      <div className={styles.tiers}>
        <div>
          <h3 className={`${ed.subTitle} ${styles.tierTitle}`}>Also worked with</h3>
          <p className={ed.prose}>{familiarSkills.join(", ")}.</p>
        </div>
        <div>
          <h3 className={`${ed.subTitle} ${styles.tierTitle}`}>Current focus</h3>
          <p className={ed.prose}>{currentFocus}</p>
        </div>
      </div>
    </Section>
  );
}

function WorkWithMe() {
  return (
    <Section
      id="services"
      title="Work with me"
      tone="laterite"
      note="For businesses and individuals who need something built properly."
    >
      <ul className={styles.serviceList}>
        {services.map((service) => (
          <li key={service.id}>
            <h3 className={styles.serviceName}>{service.name}</h3>
            <p>{service.summary}</p>
          </li>
        ))}
      </ul>
      <div className={ed.actions}>
        <Link className={`${ed.button} ${ed.primary}`} href="/work-with-me">
          How a project works
        </Link>
        <ContactButton className={`${ed.button} ${ed.secondary}`} label="Start a conversation" />
      </div>
    </Section>
  );
}

function Lab() {
  return (
    <Section id="lab" title="Engineering and experiments" note="Smaller builds, and the tools behind this site.">
      <ol className={styles.lab}>
        {experiments.map((experiment) => (
          <li key={experiment.title} className={styles.labItem}>
            <time dateTime={experiment.date} className={styles.when}>
              {formatMonth(experiment.date)}
            </time>
            <div>
              <h3 className={styles.timelineTitle}>{experiment.title}</h3>
              <p className={ed.prose}>{experiment.body}</p>
              {experiment.href ? (
                <Link className={ed.textLink} href={experiment.href}>
                  {experiment.linkLabel}
                </Link>
              ) : null}
            </div>
            {experiment.href === "/museum" ? (
              <Image
                className={styles.labImage}
                src="/images/work/museum-monument.webp"
                alt="The bronze Code Monument in the museum courtyard, rendered in Blender."
                width={960}
                height={540}
                sizes="(max-width: 64rem) 90vw, 30vw"
              />
            ) : null}
          </li>
        ))}
      </ol>
    </Section>
  );
}

const IN_PROGRESS_NOTES: Record<string, string> = {
  flowdesk: flowdeskCaseStudy.statusNote,
  ledgermind: "Pre-launch. An adversarial audit has been run and its findings fixed (self-reported).",
  "accra-we-dey": "Pre-launch. Load-tested with 1,500 bots (self-reported).",
};

function InProgress() {
  const building = projects.filter((project) => project.status === "pre-launch");
  return (
    <Section id="in-progress" title="In progress" note="Being built now. None of these has launched.">
      <ul className={styles.progress}>
        {building.map((project) => (
          <li key={project.slug}>
            <h3 className={styles.timelineTitle}>
              <Link href={project.caseStudyHref ?? "#work"}>{project.name}</Link>
            </h3>
            <p className={ed.muted}>{IN_PROGRESS_NOTES[project.slug]}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Contact() {
  return (
    <Section id="contact" title="Hiring, or have something to build?" tone="basalt">
      <p className={ed.lede}>
        I&apos;m open to employment, freelance work and collaboration. Tell me what you&apos;re working on.
      </p>
      <div className={`${ed.actions} ${styles.contactActions}`}>
        <ContactButton className={`${ed.button} ${ed.primary}`} label="Get in touch" />
        <ContactLinks linkClassName={`${ed.button} ${ed.secondary}`} />
      </div>
    </Section>
  );
}
