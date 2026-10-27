"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CaptionToggle } from "@/components/CaptionToggle";
import { StatusChip } from "@/components/StatusChip";
import { StrataList } from "@/components/StrataList";
import { flowdeskCaseStudy } from "@/content/flowdesk";
import { STOPS, stopIndexOf, type StopId } from "@/museum/stops";
import { useMuseumStore } from "@/store/museum";
import { DemoPanel } from "./DemoPanel";
import styles from "./museum.module.css";

function isTyping(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

/** Caption, stop-specific content and tour controls. Every 3D moment has its words here, in the DOM. */
export function TourPanel() {
  const stopIndex = useMuseumStore((state) => state.stopIndex);
  const next = useMuseumStore((state) => state.next);
  const prev = useMuseumStore((state) => state.prev);
  const goTo = useMuseumStore((state) => state.goTo);
  const monumentOpen = useMuseumStore((state) => state.monumentOpen);
  const toggleMonument = useMuseumStore((state) => state.toggleMonument);
  const [listOpen, setListOpen] = useState(false);
  // Phones: the panel is a sheet over the scene. The demonstration stops open it as the full
  // interaction view; elsewhere it is a caption peek. "More"/"Less" overrides that for the
  // current stop only, and the stop list (which holds the way out of 3D) always opens it.
  const [sheetOverride, setSheetOverride] = useState<{ readonly stopId: StopId; readonly open: boolean } | null>(null);
  const stop = STOPS[stopIndex];
  const isLast = stopIndex === STOPS.length - 1;
  const demoStop = stop.id === "conversation" || stop.id === "order";
  const sheetOpen = listOpen || (sheetOverride?.stopId === stop.id ? sheetOverride.open : demoStop);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || isTyping(event.target)) return;
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
      if (event.key === "Escape") setListOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const jumpTo = (index: number) => {
    goTo(index);
    setListOpen(false);
  };

  return (
    <section className={styles.panel} data-expanded={sheetOpen} aria-labelledby="stop-title">
      <button
        type="button"
        className={styles.sheetToggle}
        aria-expanded={sheetOpen}
        onClick={() => {
          setSheetOverride({ stopId: stop.id, open: !sheetOpen });
          if (sheetOpen) setListOpen(false);
        }}
      >
        {sheetOpen ? "Less ▾" : "More ▴"}
      </button>
      <p className={styles.eyebrow}>
        Stop {stopIndex + 1} of {STOPS.length}
      </p>
      <h2 id="stop-title" className={styles.title}>
        {stop.title}
      </h2>
      <p className={styles.caption} aria-live="polite">
        {stop.caption}
      </p>

      {stop.id === "monument" ? (
        <div className={styles.actions}>
          <button type="button" className={styles.primary} aria-pressed={monumentOpen} onClick={toggleMonument}>
            {monumentOpen ? "Close the casts" : "Look beneath"}
          </button>
        </div>
      ) : null}

      {stop.id === "threshold" ? (
        <div className={styles.inline}>
          <StatusChip kind="pre-launch" />
          <Link href="/work/flowdesk">Read the case study</Link>
        </div>
      ) : null}

      {stop.id === "hall" ? (
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={() => goTo(stopIndexOf("conversation"))}>
            Play the customer
          </button>
        </div>
      ) : null}

      {stop.id === "conversation" || stop.id === "order" ? <DemoPanel /> : null}

      {stop.id === "beneath" ? (
        <div className={styles.beneath}>
          <CaptionToggle />
          <StrataList strata={flowdeskCaseStudy.strata} />
          <p className={styles.thesis}>{flowdeskCaseStudy.thesis}</p>
        </div>
      ) : null}

      <nav className={styles.tourNav} aria-label="Tour">
        <button type="button" onClick={prev} disabled={stopIndex === 0}>
          Previous
        </button>
        <button type="button" aria-expanded={listOpen} aria-controls="stop-list" onClick={() => setListOpen((open) => !open)}>
          All stops
        </button>
        <button type="button" onClick={next} disabled={isLast}>
          Next
        </button>
      </nav>

      {listOpen ? (
        <div id="stop-list">
          <ol className={styles.stopList}>
            {STOPS.map((item, index) => (
              <li key={item.id}>
                <button type="button" aria-current={index === stopIndex ? "step" : undefined} onClick={() => jumpTo(index)}>
                  <span className={styles.stopNumber}>{index + 1}</span> {item.title}
                </button>
              </li>
            ))}
          </ol>
          <Link className={styles.leave} href="/quick">
            Leave 3D · Quick View
          </Link>
        </div>
      ) : null}
    </section>
  );
}
