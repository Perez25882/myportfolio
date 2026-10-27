"use client";

import { useProgress } from "@react-three/drei";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, useEffect, useState, type ReactNode } from "react";
import { useIsCoarsePointer, usePrefersReducedMotion } from "@/lib/motion";
import { STOPS, stopIndexOf } from "@/museum/stops";
import { useMuseumStore } from "@/store/museum";
import { BenchmarkPanel } from "./BenchmarkPanel";
import { TourPanel } from "./TourPanel";
import { usePerfRecorder } from "./usePerfRecorder";
import styles from "./museum.module.css";

const MuseumCanvas = dynamic(() => import("./MuseumCanvas"), { ssr: false });

const SLOW_NETWORK_MS = 8000;

/** The 3D museum: canvas on one side (top on phones), the tour panel on the other. */
export function MuseumExperience() {
  const reducedMotion = usePrefersReducedMotion();
  const coarsePointer = useIsCoarsePointer();
  const [perfMode] = useState(() => new URLSearchParams(window.location.search).has("perf"));
  const [courtReady, setCourtReady] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const recorder = usePerfRecorder(perfMode);
  const stopIndex = useMuseumStore((state) => state.stopIndex);
  const cut = useMuseumStore((state) => state.cut);
  const goTo = useMuseumStore((state) => state.goTo);

  // Deep links: /museum?stop=beneath opens straight at that stop.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("stop");
    const index = requested ? stopIndexOf(requested) : -1;
    if (index >= 0) goTo(index);
  }, [goTo]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("stop", STOPS[stopIndex].id);
    window.history.replaceState(null, "", url);
  }, [stopIndex]);

  const retry = () => {
    setContextLost(false);
    setCourtReady(false);
    setCanvasKey((key) => key + 1);
  };

  return (
    <div className={styles.experience}>
      <h1 className="visually-hidden">PEREZ museum: guided 3D tour</h1>
      <div className={styles.stage}>
        {contextLost ? (
          <Fallback message="The 3D view stopped responding. Continue in Quick View, or try again." onRetry={retry} />
        ) : (
          <SceneBoundary onRetry={retry}>
            <MuseumCanvas
              key={canvasKey}
              cut={cut}
              reducedMotion={reducedMotion}
              coarsePointer={coarsePointer}
              perfMode={perfMode}
              onCourtReady={() => {
                setCourtReady(true);
                recorder.recordEvent("court ready");
              }}
              onFlowDeskReady={() => recorder.recordEvent("flowdesk ready")}
              onContextLost={() => {
                setContextLost(true);
                recorder.recordEvent("context lost");
              }}
              onFrameSample={recorder.recordSample}
              onStall={recorder.recordStall}
              onRenderer={recorder.recordRenderer}
              onPixelRatio={(ratio) => recorder.recordEvent(`pixel ratio ${Math.round(ratio * 100) / 100}`)}
            />
          </SceneBoundary>
        )}
        {cut > 0 ? <div key={cut} className={styles.fade} aria-hidden="true" /> : null}
        {!courtReady && !contextLost ? <Loader /> : null}
        {perfMode ? <BenchmarkPanel recorder={recorder} /> : null}
      </div>
      <TourPanel />
    </div>
  );
}

function Loader() {
  const { progress } = useProgress();
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), SLOW_NETWORK_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className={styles.loader} role="status">
      <p>Opening the Court… {Math.round(progress)}%</p>
      <div className={styles.loaderTrack} aria-hidden="true">
        <div className={styles.loaderLine} style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
      {slow ? <p>Taking a while on this connection. The Quick View has everything at a glance.</p> : null}
      <Link href="/quick">Skip to Quick View</Link>
    </div>
  );
}

function Fallback({ message, onRetry }: { readonly message: string; readonly onRetry: () => void }) {
  return (
    <div className={styles.fallback} role="alert">
      <p>{message}</p>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onRetry}>
          Try again
        </button>
        <Link className={styles.secondary} href="/quick">
          Quick View
        </Link>
        <Link className={styles.secondary} href="/work/flowdesk">
          FlowDesk case study
        </Link>
      </div>
    </div>
  );
}

interface BoundaryProps {
  readonly children: ReactNode;
  readonly onRetry: () => void;
}

/** A model that fails to load must not take the page down: show the fallback instead. */
class SceneBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <Fallback
          message="The museum's rooms didn't load. Read the FlowDesk case study or the Quick View instead."
          onRetry={() => {
            this.setState({ failed: false });
            this.props.onRetry();
          }}
        />
      );
    }
    return this.props.children;
  }
}
