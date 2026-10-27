import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewMarker } from "@/components/ReviewMarker";
import { Section } from "@/components/editorial/Section";
import ed from "@/components/editorial/editorial.module.css";
import { CaseHero, CaseNotes, NextProject } from "@/components/work/CaseStudy";
import styles from "@/components/work/case.module.css";
import { caseStudies, getCaseStudy } from "@/content/caseStudies";
import { getProject } from "@/content/projects";

/** Case studies for LedgerMind OS, Accra We Dey and JoyDataBundle. FlowDesk has its own page. */
export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata(props: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProject(slug);
  return project ? { title: project.name, description: project.purpose } : {};
}

export default async function CaseStudyPage(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const project = getProject(slug);
  const study = getCaseStudy(slug);
  if (!project || !study) notFound();

  const isTeam = project.isTeamProject;
  return (
    <article data-theme="light" className={ed.page} aria-labelledby="case-title">
      <div className={ed.wrap}>
        <CaseHero project={project} status={study.status} />

        <Section id="opening" title={slug === "accra-we-dey" ? "The idea" : "The problem"}>
          <h3 className={styles.openingTitle}>
            {study.opening.heading}
            <ReviewMarker decisions={study.pending.filter((id) => id !== "D1")} />
          </h3>
          <div className={ed.prose}>
            <p>{study.opening.body}</p>
          </div>
        </Section>

        <Section
          id="decisions"
          title={isTeam ? "Perez's part" : "Engineering decisions"}
          note="Each with where it was verified. Self-reported claims are marked."
        >
          <CaseNotes notes={study.notes} />
        </Section>

        <NextProject slug={slug} />
      </div>
    </article>
  );
}
