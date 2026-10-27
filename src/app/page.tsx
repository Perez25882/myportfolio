import { getImageProps } from "next/image";
import Link from "next/link";
import { ReviewMarker } from "@/components/ReviewMarker";
import { Wordmark } from "@/components/Wordmark";
import { profile } from "@/content/profile";
import styles from "./page.module.css";

const SECTION_LINKS = [
  { href: "/quick#work", label: "Selected work" },
  { href: "/quick#experience", label: "Experience" },
  { href: "/quick#skills", label: "Skills" },
  { href: "/work-with-me", label: "Work with me" },
] as const;

// Matches the stacked layout breakpoint in page.module.css.
const PORTRAIT_POSTER_QUERY = "(max-width: 40rem)";

/** Arrival: HTML first, readable before any 3D loads. */
export default function ArrivalPage() {
  return (
    <section className={styles.arrival} aria-labelledby="arrival-title">
      <ArrivalPoster />

      <div className={styles.content}>
        <p className={styles.availability}>
          <span className={styles.dot} aria-hidden="true" />
          {profile.availability} · {profile.roleLine}
          <ReviewMarker decisions={profile.pending.roleLine} />
        </p>

        <h1 id="arrival-title" className={styles.title}>
          <Wordmark size="lg" showLockup />
        </h1>

        <p className={styles.narrative}>
          {profile.narrativeLine[0]}
          <br />
          {profile.narrativeLine[1]}
          <ReviewMarker decisions={profile.pending.narrativeLine} />
        </p>

        <p className={styles.intro}>{profile.intro}</p>

        <div className={styles.actions}>
          <Link href="/museum" className={styles.primary}>
            Enter Museum <span aria-hidden="true">→</span>
          </Link>
          <Link href="/quick" className={styles.secondary}>
            View portfolio
          </Link>
        </div>

        <nav aria-label="Sections" className={styles.sections}>
          {SECTION_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

    </section>
  );
}

/**
 * The courtyard at morning, rendered in Blender (blender/scripts/review.py, CAM_poster_*).
 * Art-directed: phones get a portrait frame with the Code Monument in the top band.
 */
function ArrivalPoster() {
  const shared = { alt: "", sizes: "100vw", fetchPriority: "high", loading: "eager" } as const;
  const portrait = getImageProps({ ...shared, src: "/images/arrival-portrait-1080x1740.webp", width: 1080, height: 1740 }).props;
  const landscape = getImageProps({ ...shared, src: "/images/arrival-landscape.webp", width: 1920, height: 1080 }).props;
  return (
    <div className={styles.poster} aria-hidden="true">
      <picture>
        <source media={PORTRAIT_POSTER_QUERY} srcSet={portrait.srcSet} sizes={portrait.sizes} />
        {/* Art direction needs <picture>; getImageProps keeps Next's optimised srcsets. */}
        <img {...landscape} alt="" className={styles.posterImage} />
      </picture>
    </div>
  );
}
