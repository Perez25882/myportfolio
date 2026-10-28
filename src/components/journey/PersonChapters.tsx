import Image from "next/image";
import Link from "next/link";
import { ContactButton } from "@/components/ContactButton";
import { ContactLinks } from "@/components/ContactLinks";
import { Wordmark } from "@/components/Wordmark";
import { profile } from "@/content/profile";
import { services } from "@/content/services";
import { familiarSkills, shippedSkills } from "@/content/skills";
import { story } from "@/content/story";
import { formatMonth } from "@/lib/format";
import { Beat, Chapter, FlatVisual } from "./Chapter";
import styles from "./journey.module.css";

/**
 * The chapters around the projects: the opening in the court, the Code Monument, About, Skills,
 * Work with me and the contact finale. Facts about Perez come from profile.ts, which records
 * which ones the founder supplied.
 */

const toolsFor = (area: string) => shippedSkills.find((skill) => skill.area === area)?.tools ?? [];

function listInWords(items: readonly string[]): string {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

export function OpeningChapter() {
  return (
    <Chapter id="opening">
      <Beat surface="bare" className={styles.hero}>
        <p className={styles.availability}>
          <span className={styles.dot} aria-hidden="true" />
          {profile.availability}
        </p>
        <h1 id="opening-title" className={styles.heroTitle}>
          <Wordmark size="lg" showLockup />
        </h1>
        <p className={styles.headline}>{profile.headline}</p>
        <p className={styles.lede}>
          I&apos;m {profile.name}, a {profile.role.toLowerCase()} in {profile.location}. Scroll to walk through what I&apos;ve
          built, or go straight to what you need.
        </p>
        <nav aria-label="Jump to" className={styles.jump}>
          <a href="#flowdesk" className={styles.primaryButton}>
            See the projects
          </a>
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <ContactButton className={styles.textButton} />
          <Link href="/quick">2D portfolio</Link>
          {profile.contact.cvHref ? <a href={profile.contact.cvHref}>CV</a> : null}
        </nav>
        <p className={styles.cue} aria-hidden="true">
          Scroll to begin
        </p>
      </Beat>
    </Chapter>
  );
}

export function MonumentChapter() {
  return (
    <Chapter id="monument">
      <Beat>
        <h2 id="monument-title" className={styles.title}>
          The Code Monument
        </h2>
        <p>
          Three cast-bronze characters, <span className={styles.code}>&lt; / &gt;</span>: the symbols that wrap every piece
          of code. Everything I build starts there, so this is where my story starts too.
        </p>
        <FlatVisual>
          <Image
            src="/images/work/museum-monument.webp"
            width={960}
            height={540}
            sizes="(max-width: 48rem) 100vw, 44rem"
            alt="The Code Monument in the courtyard: three bronze characters on a stone plinth, rendered in Blender."
          />
        </FlatVisual>
      </Beat>
      <Beat>
        <h3 className={styles.beatTitle}>Beyond it, the showroom</h3>
        <p>
          The building across the court is my project showroom: four bays, one for each project I&apos;ve built. In each,
          you&apos;ll see what it does first, then how it works underneath.
        </p>
      </Beat>
    </Chapter>
  );
}

export function AboutChapter() {
  const interests = listInWords(profile.interests.map((interest) => interest.toLowerCase()));
  return (
    <Chapter id="about" tone="basalt">
      <Beat>
        <h2 id="about-title" className={styles.title}>
          {profile.narrativeLine[0]}
        </h2>
        <p>
          I&apos;m {profile.name}, a {profile.role.toLowerCase()} based in {profile.location}, and a {profile.education}.
        </p>
        <p>I&apos;m drawn to {interests}.</p>
      </Beat>
      <Beat>
        <h2 className={styles.title}>{profile.narrativeLine[1]}</h2>
        <p>
          That curiosity turned into things that work: commerce backends, an offline-first retail system, a multiplayer world
          in the browser, and this museum. What keeps me going is building products that mean something to the people who
          use them.
        </p>
      </Beat>
      <Beat>
        <h3 className={styles.beatTitle}>Experience</h3>
        <ol className={styles.timeline}>
          {story.map((entry) => (
            <li key={entry.date}>
              <span className={styles.when}>{formatMonth(entry.date)}</span>
              <span>
                <strong>{entry.title}.</strong> {entry.detail}
              </span>
            </li>
          ))}
        </ol>
        <p className={styles.small}>Months are first public commits, not start dates.</p>
      </Beat>
    </Chapter>
  );
}

interface SkillArea {
  readonly area: string;
  readonly detail: string;
}

function SkillList({ areas }: { readonly areas: readonly SkillArea[] }) {
  return (
    <dl className={styles.skills}>
      {areas.map((entry) => (
        <div key={entry.area}>
          <dt>
            {entry.area}
          </dt>
          <dd>{entry.detail}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SkillsChapter() {
  const layers: SkillArea[] = [
    { area: "Web interfaces", detail: listInWords(toolsFor("Web interfaces")) },
    { area: "Mobile", detail: listInWords([...toolsFor("Mobile"), "Expo and React Native"]) },
    { area: "Backend", detail: listInWords(["Node.js", ...toolsFor("Commerce backends")]) },
    { area: "Databases", detail: listInWords([...toolsFor("Data and access"), "Redis"]) },
  ];
  const practices: SkillArea[] = [
    { area: "Architecture", detail: "Message queues that don't lose orders, offline-first sync and realtime game servers." },
    { area: "Security", detail: "Security reviews, row-level access, and guardrails that keep an AI assistant inside the shop's prices." },
    { area: "AI-assisted engineering", detail: "AI tools as part of how software is designed, built and reviewed." },
  ];
  return (
    <Chapter id="skills">
      <Beat>
        <h2 id="skills-title" className={styles.title}>
          How the pieces fit
        </h2>
        <p>
          One system rather than a list of logos: interfaces on top, the backend beneath, data at the base, architecture
          holding the layers together and security around all of it.
        </p>
        <SkillList areas={layers} />
      </Beat>
      <Beat>
        <SkillList areas={practices} />
        <p className={styles.small}>Also used: {listInWords(familiarSkills.filter((skill) => !skill.startsWith("Expo")))}.</p>
        <p className={styles.links}>
          <Link href="/quick#skills" className={styles.primaryLink}>
            Every skill, with where it was used
          </Link>
        </p>
      </Beat>
    </Chapter>
  );
}

export function ServicesChapter() {
  return (
    <Chapter id="services" tone="laterite">
      <Beat>
        <h2 id="services-title" className={styles.title}>
          Work with me
        </h2>
        <p>I build software for businesses and people who need it to work.</p>
        <ul className={styles.services}>
          {services.map((service) => (
            <li key={service.id}>{service.name}</li>
          ))}
        </ul>
        <p className={styles.cta}>Have a project in mind? Let&apos;s build it.</p>
        <p className={styles.links}>
          <ContactButton className={styles.primaryButton} label="Tell me about it" />
          <Link href="/work-with-me">How working together works</Link>
        </p>
      </Beat>
    </Chapter>
  );
}

export function ContactChapter() {
  return (
    <Chapter id="contact" tone="basalt">
      <Beat surface="basalt" className={styles.finale}>
        <h2 id="contact-title" className={styles.finaleTitle}>
          Let&apos;s build something together.
        </h2>
        <p className={styles.lede}>For a job, a freelance project or a collaboration. Tell me what you&apos;re working on.</p>
        <p className={styles.finaleActions}>
          <ContactButton className={styles.primaryButton} label="Contact Perez" />
          <ContactLinks />
          <Link href="/work-with-me">Work with me</Link>
          <Link href="/quick">2D portfolio</Link>
        </p>
      </Beat>
    </Chapter>
  );
}
