"use client";

import { useEffect, useRef, useState } from "react";
import { MEASURE_MS, SETTLE_MS, formatReport, summariseStop, type DeviceInfo, type ModelTiming, type RendererInfo, type StopResult } from "@/museum/benchmark";
import { STOPS } from "@/museum/stops";
import { useMuseumStore } from "@/store/museum";
import type { PerfRecorder } from "./usePerfRecorder";
import styles from "./museum.module.css";

interface BenchmarkPanelProps {
  readonly recorder: PerfRecorder;
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function deviceInfo(renderer: RendererInfo | null): DeviceInfo {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return {
    userAgent: nav.userAgent,
    gpu: renderer?.gpu ?? "unknown",
    screen: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    devicePixelRatio: Math.round(window.devicePixelRatio * 100) / 100,
    renderPixelRatio: renderer?.renderPixelRatio ?? 0,
    cores: nav.hardwareConcurrency ?? null,
    memoryGb: nav.deviceMemory ?? null,
  };
}

function modelTimings(): ModelTiming[] {
  return performance
    .getEntriesByType("resource")
    .filter((entry) => entry.name.includes("/models/"))
    .map((entry) => {
      const resource = entry as PerformanceResourceTiming;
      return {
        file: resource.name.split("/").pop() ?? "",
        kb: Math.round(resource.transferSize / 1024),
        startMs: Math.round(resource.startTime),
        ms: Math.round(resource.duration),
      };
    });
}

/** ?perf=1 only: live frame rate, and a one-tap tour of every stop that produces a copyable report. */
export function BenchmarkPanel({ recorder }: BenchmarkPanelProps) {
  const { fps, renderer, clearSamples, readSamples, readStalls, readEvents } = recorder;
  const goTo = useMuseumStore((state) => state.goTo);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<string | null>(null);
  const [copyNote, setCopyNote] = useState("");
  // The run spans ~45 s; read the latest renderer info when the report is written, not when it started.
  const latestRenderer = useRef(renderer);
  useEffect(() => {
    latestRenderer.current = renderer;
  }, [renderer]);

  const run = async () => {
    setRunning(true);
    setReport(null);
    const runStartMs = Math.round(performance.now());
    const results: StopResult[] = [];
    for (let index = 0; index < STOPS.length; index += 1) {
      setProgress(index + 1);
      clearSamples();
      goTo(index);
      await wait(SETTLE_MS);
      const transition = readSamples();
      clearSamples();
      await wait(MEASURE_MS);
      results.push(summariseStop(STOPS[index].id, readSamples(), transition));
    }
    setReport(
      formatReport({
        device: deviceInfo(latestRenderer.current),
        results,
        models: modelTimings(),
        stalls: readStalls(),
        events: readEvents(),
        runStartMs,
      }),
    );
    setRunning(false);
  };

  const copy = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopyNote("Copied.");
    } catch {
      setCopyNote("Couldn't copy here. Select the text above and copy it.");
    }
  };

  return (
    <div className={styles.benchmark}>
      <p className={styles.fpsLive}>{fps !== null ? `${Math.round(fps)} fps` : "measuring…"}</p>
      {running ? (
        <p role="status">
          Measuring stop {progress} of {STOPS.length}…
        </p>
      ) : (
        <button type="button" className={styles.primary} onClick={run}>
          Run benchmark
        </button>
      )}
      {report ? (
        <>
          <pre className={styles.report}>{report}</pre>
          <button type="button" className={styles.secondary} onClick={copy}>
            Copy results
          </button>
          <p role="status">{copyNote}</p>
        </>
      ) : null}
    </div>
  );
}
