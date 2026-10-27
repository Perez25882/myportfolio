import { useCallback, useEffect, useRef, useState } from "react";
import type { FrameSample, PageEvent, RendererInfo, Stall } from "@/museum/benchmark";
import { STOPS } from "@/museum/stops";
import { useMuseumStore } from "@/store/museum";

declare global {
  interface Window {
    __museumFps?: number[];
  }
}

export interface PerfRecorder {
  readonly fps: number | null;
  readonly renderer: RendererInfo | null;
  readonly recordSample: (sample: FrameSample) => void;
  readonly recordStall: (atMs: number, durationMs: number) => void;
  readonly recordEvent: (label: string) => void;
  readonly recordRenderer: (info: RendererInfo) => void;
  readonly clearSamples: () => void;
  readonly readSamples: () => readonly FrameSample[];
  readonly readStalls: () => readonly Stall[];
  readonly readEvents: () => readonly PageEvent[];
}

const now = () => Math.round(performance.now());

/**
 * What ?perf=1 measures: one sample per rendered second, every stall, and a timeline of
 * load milestones and page visibility (a hidden tab stops rendering; that is not a stall).
 */
export function usePerfRecorder(enabled: boolean): PerfRecorder {
  const [fps, setFps] = useState<number | null>(null);
  const [renderer, setRenderer] = useState<RendererInfo | null>(null);
  const samples = useRef<readonly FrameSample[]>([]);
  const stalls = useRef<readonly Stall[]>([]);
  const events = useRef<readonly PageEvent[]>([]);

  const recordEvent = useCallback((label: string) => {
    events.current = [...events.current, { atMs: now(), label }];
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onVisibility = () => recordEvent(document.visibilityState === "hidden" ? "hidden" : "visible");
    const onPageHide = () => recordEvent("pagehide");
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [enabled, recordEvent]);

  const recordSample = useCallback((sample: FrameSample) => {
    setFps(sample.fps);
    samples.current = [...samples.current, sample];
    window.__museumFps = [...(window.__museumFps ?? []), Math.round(sample.fps)];
  }, []);

  const recordStall = useCallback((atMs: number, durationMs: number) => {
    const hidden = events.current.some((event) => event.label === "hidden" && event.atMs >= atMs - 50 && event.atMs <= atMs + durationMs);
    if (hidden) return;
    const stopId = STOPS[useMuseumStore.getState().stopIndex].id;
    stalls.current = [...stalls.current, { atMs: Math.round(atMs), durationMs: Math.round(durationMs), stopId }];
  }, []);

  const clearSamples = useCallback(() => {
    samples.current = [];
  }, []);
  const readSamples = useCallback(() => samples.current, []);
  const readStalls = useCallback(() => stalls.current, []);
  const readEvents = useCallback(() => events.current, []);

  return {
    fps,
    renderer,
    recordSample,
    recordStall,
    recordEvent,
    recordRenderer: setRenderer,
    clearSamples,
    readSamples,
    readStalls,
    readEvents,
  };
}
