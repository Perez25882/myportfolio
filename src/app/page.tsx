import { getImageProps } from "next/image";
import { Journey } from "@/components/journey/Journey";
import {
  AboutChapter,
  ContactChapter,
  MonumentChapter,
  OpeningChapter,
  ServicesChapter,
  SkillsChapter,
} from "@/components/journey/PersonChapters";
import {
  AccraChapter,
  FlowDeskChapter,
  JoyDataBundleChapter,
  LedgerMindChapter,
} from "@/components/journey/ProjectChapters";

// Matches the phone breakpoint in journey.module.css.
const PORTRAIT_POSTER_QUERY = "(max-width: 40rem)";

/**
 * Home: one continuous scroll through the museum. Every chapter is server-rendered HTML, so the
 * page reads in full before (and without) the 3D; the canvas behind it is an enhancement.
 */
export default function HomePage() {
  return (
    <Journey poster={<ArrivalPoster />}>
      <OpeningChapter />
      <MonumentChapter />
      <FlowDeskChapter />
      <LedgerMindChapter />
      <AccraChapter />
      <JoyDataBundleChapter />
      <AboutChapter />
      <SkillsChapter />
      <ServicesChapter />
      <ContactChapter />
    </Journey>
  );
}

/**
 * The courtyard at morning, rendered in Blender (blender/scripts/review.py, CAM_poster_*), held
 * behind the opening until the 3D court is ready. Phones get the portrait frame.
 */
function ArrivalPoster() {
  const shared = { alt: "", sizes: "100vw", fetchPriority: "high", loading: "eager" } as const;
  const portrait = getImageProps({ ...shared, src: "/images/arrival-portrait-1080x1740.webp", width: 1080, height: 1740 }).props;
  const landscape = getImageProps({ ...shared, src: "/images/arrival-landscape.webp", width: 1920, height: 1080 }).props;
  return (
    <picture>
      <source media={PORTRAIT_POSTER_QUERY} srcSet={portrait.srcSet} sizes={portrait.sizes} />
      {/* Art direction needs <picture>; getImageProps keeps Next's optimised srcsets. */}
      <img {...landscape} alt="" />
    </picture>
  );
}
