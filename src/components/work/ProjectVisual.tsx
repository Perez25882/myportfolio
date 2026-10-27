import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./work.module.css";

/**
 * One purposeful visual per flagship project. Real images where they exist; where they don't,
 * a diagram of the verified engineering. Each caption says exactly what the image is.
 */

const ACCENTS: Record<string, string> = {
  flowdesk: "#2f5a4a",
  ledgermind: "#3f5a52",
  "accra-we-dey": "#9a5a34",
  joydatabundle: "#0f7c8f",
};

export function accentFor(slug: string): string {
  return ACCENTS[slug] ?? "var(--basalt)";
}

interface ProjectVisualProps {
  readonly slug: string;
  /** "plate" in Quick View; "hero" at the top of a case study. */
  readonly size?: "plate" | "hero";
}

export function ProjectVisual({ slug, size = "plate" }: ProjectVisualProps) {
  const visual = VISUALS[slug];
  if (!visual) return null;
  return (
    <figure className={`${styles.visual} ${styles[size]}`} style={{ "--accent": accentFor(slug) } as React.CSSProperties}>
      <div className={styles.mat}>{visual.body}</div>
      <figcaption className={styles.caption}>{visual.caption}</figcaption>
    </figure>
  );
}

const VISUALS: Record<string, { readonly body: ReactNode; readonly caption: string }> = {
  flowdesk: {
    body: (
      <div className={styles.flowdesk}>
        <Image
          className={styles.board}
          src="/images/work/flowdesk-board.webp"
          width={1080}
          height={600}
          sizes="(max-width: 64rem) 90vw, 50vw"
          alt="The shop owner's order board: one new order for two half pieces of wax print, GHS 460, payment unconfirmed."
        />
        <Image
          className={styles.phone}
          src="/images/work/flowdesk-chat.webp"
          width={540}
          height={1000}
          sizes="(max-width: 64rem) 35vw, 16vw"
          alt="The customer's WhatsApp chat: asking for wax print, offering GHS 200, settling on GHS 460 and paying with MoMo."
        />
      </div>
    ),
    caption:
      "Interface reconstructions made for the museum from FlowDesk's verified behaviour, not product screenshots.",
  },
  ledgermind: {
    body: <LedgerMindSync />,
    caption: "How a sale survives a dropped connection, from the verified sync design.",
  },
  "accra-we-dey": {
    body: <AccraServer />,
    caption: "How the world is shared between players. The load-test figure is self-reported.",
  },
  joydatabundle: {
    body: (
      <Image
        className={styles.screenshot}
        src="/images/work/joydatabundle-site.webp"
        width={1440}
        height={900}
        sizes="(max-width: 64rem) 90vw, 55vw"
        alt="JoyDataBundle's public home page: 'Sell data bundles and earn commission', with buttons to get started or sign in."
      />
    ),
    caption:
      "The live site, captured on 27 October 2026. A team project: Perez worked on the frontend, including the admin payout flow.",
  },
};

function LedgerMindSync() {
  return (
    <ol className={styles.flow} aria-label="A sale's path through LedgerMind OS">
      <li className={styles.node}>
        <span className={styles.nodeTitle}>At the counter</span>
        <span>The sale is rung up, even with the internet down.</span>
      </li>
      <li className={styles.node}>
        <span className={styles.nodeTitle}>Queued on the device</span>
        <span className={styles.keys} aria-hidden="true">
          <span>sale · key 7f3a</span>
          <span>sale · key 7f3b</span>
          <span>sale · key 7f3c</span>
        </span>
        <span>Each sale keeps its key. Repeated failures go to a dead-letter list.</span>
      </li>
      <li className={styles.node}>
        <span className={styles.nodeTitle}>On the server</span>
        <span>A key seen twice is counted once.</span>
        <span>Stock figures come from here.</span>
        <span>Each branch sees only its own rows.</span>
      </li>
    </ol>
  );
}

function AccraServer() {
  return (
    <ol className={styles.flow} aria-label="How Accra We Dey shares one world between players">
      <li className={styles.node}>
        <span className={styles.nodeTitle}>Players&apos; phones</span>
        <span>Three.js draws the city in the mobile browser. Nothing to install.</span>
      </li>
      <li className={styles.node}>
        <span className={styles.nodeTitle}>Game server</span>
        <span>uWebSockets.js runs the world in ticks.</span>
        <span className={styles.figure}>7–13 ms per tick with 1,500 bots</span>
      </li>
      <li className={styles.node}>
        <span className={styles.nodeTitle}>Storage</span>
        <span>Postgres and Redis behind the server.</span>
      </li>
    </ol>
  );
}
