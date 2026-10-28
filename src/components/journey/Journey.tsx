"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { CHAPTERS } from "@/journey/chapters";
import { setScrollTarget } from "@/journey/state";
import { useIsCoarsePointer, usePrefersReducedMotion } from "@/lib/motion";
import { detectWebGL } from "@/lib/webgl";
import styles from "./journey.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const JourneyCanvas = dynamic(() => import("./JourneyCanvas"), { ssr: false });

/**
 * pending: the server render and the first moments, laid out for 3D with the poster behind;
 * 3d: the canvas is running; flat: no WebGL (or it failed), so chapters stack with their images.
 */
type Mode = "pending" | "3d" | "flat";

const IDLE_TIMEOUT_MS = 1200;
const ANCHOR_TOLERANCE_PX = 2;

interface JourneyProps {
  /** The courtyard render shown behind the opening until the 3D court is ready. */
  readonly poster: ReactNode;
  readonly children: ReactNode;
}

export function Journey({ poster, children }: JourneyProps) {
  const root = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const coarsePointer = useIsCoarsePointer();
  const [mode, setMode] = useState<Mode>("pending");
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [active, setActive] = useState(0);

  // The 3D bundle waits until the page's text has painted and the browser is idle.
  useEffect(() => {
    const start = () => setMode(detectWebGL() === "none" ? "flat" : "3d");
    // Safari has no requestIdleCallback.
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: IDLE_TIMEOUT_MS });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(start, 200);
    return () => window.clearTimeout(timer);
  }, []);

  const fallBack = (message: string) => {
    setNotice(message);
    setMode("flat");
  };

  // One scroll controller for the whole page: it turns the scroll position into the journey's
  // single number (chapter + progress). Text panels get a short, scrubbed entrance.
  useGSAP(
    () => {
      const sections = gsap.utils.toArray<HTMLElement>("[data-chapter]", root.current);
      let bounds: { top: number; span: number }[] = [];
      const measure = () => {
        bounds = sections.map((section, i) => {
          const rect = section.getBoundingClientRect();
          // The last chapter ends when the page does, not when its top leaves the screen.
          const span = i === sections.length - 1 ? Math.max(1, rect.height - window.innerHeight) : rect.height;
          return { top: rect.top + window.scrollY, span };
        });
      };
      let lastIndex = -1;
      const update = () => {
        // Section tops can fall between pixels; a chapter link scrolls to a whole pixel just above.
        const y = window.scrollY + ANCHOR_TOLERANCE_PX;
        let s = 0;
        for (let i = bounds.length - 1; i >= 0; i -= 1) {
          if (y >= bounds[i].top) {
            s = i + Math.min(1, (y - bounds[i].top) / bounds[i].span);
            break;
          }
        }
        setScrollTarget(s);
        const index = Math.min(sections.length - 1, Math.floor(s));
        if (index !== lastIndex) {
          lastIndex = index;
          setActive(index);
        }
      };

      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: update,
        onRefresh: () => {
          measure();
          update();
        },
      });
      measure();
      update();
      void document.fonts?.ready.then(() => ScrollTrigger.refresh());

      if (mode !== "3d" || reducedMotion) return;
      for (const panel of gsap.utils.toArray<HTMLElement>("[data-reveal]", root.current)) {
        gsap.fromTo(
          panel,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: { trigger: panel.parentElement, start: "top 90%", end: "top 55%", scrub: 0.5 },
          },
        );
      }
    },
    { scope: root, dependencies: [mode, reducedMotion], revertOnUpdate: true },
  );

  return (
    <div ref={root} className={styles.journey} data-mode={mode}>
      <div className={styles.stage} aria-hidden="true">
        <div className={`${styles.poster} ${ready ? styles.posterGone : ""}`}>{poster}</div>
        {mode === "3d" ? (
          <SceneBoundary onError={() => fallBack("The 3D scenes didn't load, so this page switched to its flat layout.")}>
            <JourneyCanvas
              reducedMotion={reducedMotion}
              coarsePointer={coarsePointer}
              onVeil={(opacity) => {
                if (veil.current) veil.current.style.opacity = String(opacity);
              }}
              onReady={() => setReady(true)}
              onContextLost={() => fallBack("The 3D view stopped responding, so this page switched to its flat layout.")}
            />
          </SceneBoundary>
        ) : null}
        <div ref={veil} className={styles.veil} />
      </div>

      {mode === "3d" && !ready ? (
        <p className={styles.status} role="status">
          Opening the court in 3D…
        </p>
      ) : null}
      {notice ? (
        <p className={styles.status} role="status">
          {notice}
        </p>
      ) : null}

      <nav className={styles.rail} aria-label="Chapters">
        <ol>
          {CHAPTERS.map((chapter, index) => (
            <li key={chapter.id}>
              <a href={`#${chapter.id}`} aria-current={index === active ? "location" : undefined}>
                <span className={styles.railLabel}>{chapter.nav}</span>
                <span className={styles.railMark} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {children}
    </div>
  );
}

interface BoundaryProps {
  readonly children: ReactNode;
  readonly onError: () => void;
}

/** A scene that fails to load must not take the page down: the text is all still there. */
class SceneBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
