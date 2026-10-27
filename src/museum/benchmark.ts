import type { StopId } from "./stops";

/**
 * One-tap benchmark for real devices (?perf=1 → "Run benchmark"). Tours every
 * stop, measures each for a fixed time, and produces a plain-text report the
 * visitor can copy and send back. The release gate is 30 fps on mid-range phones
 * with no stalls: the Phase 2 iPhone run averaged 59 fps yet froze entering FlowDesk.
 */

export const SETTLE_MS = 1500;
export const MEASURE_MS = 5000;
export const TARGET_FPS = 30;
/** A gap between rendered frames longer than this is a stall the visitor sees as a freeze. */
export const STALL_MS = 250;

/** One second of rendering, as reported by the canvas. */
export interface FrameSample {
  readonly fps: number;
  readonly calls: number;
  readonly triangles: number;
  readonly textures: number;
  readonly geometries: number;
  readonly longestFrameMs: number;
  readonly framesOver50: number;
  readonly framesOver100: number;
}

/** A freeze: no frame rendered for `durationMs`, starting `atMs` after navigation. */
export interface Stall {
  readonly atMs: number;
  readonly durationMs: number;
  readonly stopId: StopId;
}

/** Load milestones and page lifecycle changes, timed from navigation. */
export interface PageEvent {
  readonly atMs: number;
  readonly label: string;
}

export interface WindowSummary {
  readonly avgFps: number;
  readonly minFps: number;
  readonly longestFrameMs: number;
  readonly framesOver50: number;
  readonly framesOver100: number;
  readonly calls: number;
  readonly triangles: number;
  readonly samples: number;
}

export interface StopResult {
  readonly stopId: StopId;
  /** The camera move into the stop (SETTLE_MS), where uploads and shader compiles land. */
  readonly transition: WindowSummary;
  /** Standing still at the stop (MEASURE_MS). */
  readonly steady: WindowSummary;
}

/** What the canvas knows about the GPU and the resolution it renders at. */
export interface RendererInfo {
  readonly gpu: string;
  readonly renderPixelRatio: number;
}

export interface DeviceInfo {
  readonly userAgent: string;
  readonly gpu: string;
  readonly screen: string;
  readonly viewport: string;
  readonly devicePixelRatio: number;
  readonly renderPixelRatio: number;
  readonly cores: number | null;
  readonly memoryGb: number | null;
}

export interface ModelTiming {
  readonly file: string;
  readonly kb: number;
  readonly startMs: number;
  readonly ms: number;
}

const EMPTY_WINDOW: WindowSummary = {
  avgFps: 0,
  minFps: 0,
  longestFrameMs: 0,
  framesOver50: 0,
  framesOver100: 0,
  calls: 0,
  triangles: 0,
  samples: 0,
};

const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);

export function summariseWindow(samples: readonly FrameSample[]): WindowSummary {
  if (samples.length === 0) return EMPTY_WINDOW;
  const fps = samples.map((sample) => sample.fps);
  return {
    avgFps: Math.round(sum(fps) / fps.length),
    minFps: Math.round(Math.min(...fps)),
    longestFrameMs: Math.round(Math.max(...samples.map((sample) => sample.longestFrameMs))),
    framesOver50: sum(samples.map((sample) => sample.framesOver50)),
    framesOver100: sum(samples.map((sample) => sample.framesOver100)),
    calls: Math.max(...samples.map((sample) => sample.calls)),
    triangles: Math.max(...samples.map((sample) => sample.triangles)),
    samples: samples.length,
  };
}

export function summariseStop(stopId: StopId, steady: readonly FrameSample[], transition: readonly FrameSample[] = []): StopResult {
  return { stopId, transition: summariseWindow(transition), steady: summariseWindow(steady) };
}

export interface Verdict {
  readonly worstAvgFps: number;
  readonly worstMinFps: number;
  readonly maxCalls: number;
  readonly maxTriangles: number;
  readonly stalls: number;
  /** True when every stop rendered, averaged at least 30 fps, and nothing stalled during the run. */
  readonly meetsTarget: boolean;
}

export function verdict(results: readonly StopResult[], stalls: readonly Stall[] = []): Verdict {
  const measured = results.filter((result) => result.steady.samples > 0);
  if (measured.length === 0) {
    return { worstAvgFps: 0, worstMinFps: 0, maxCalls: 0, maxTriangles: 0, stalls: stalls.length, meetsTarget: false };
  }
  const worstAvgFps = Math.min(...measured.map((result) => result.steady.avgFps));
  return {
    worstAvgFps,
    worstMinFps: Math.min(...measured.map((result) => result.steady.minFps)),
    maxCalls: Math.max(...measured.map((result) => result.steady.calls)),
    maxTriangles: Math.max(...measured.map((result) => result.steady.triangles)),
    stalls: stalls.length,
    meetsTarget: measured.length === results.length && worstAvgFps >= TARGET_FPS && stalls.length === 0,
  };
}

const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

function stopLine({ stopId, transition, steady }: StopResult): string {
  if (steady.samples === 0) return `${stopId} | no frames rendered (stall)`;
  const arrival = transition.samples > 0 ? `${transition.longestFrameMs}` : "no frames";
  return [
    stopId,
    steady.avgFps,
    steady.minFps,
    steady.longestFrameMs,
    `${steady.framesOver50}/${steady.framesOver100}`,
    arrival,
    steady.calls,
    steady.triangles,
  ].join(" | ");
}

export interface ReportInput {
  readonly device: DeviceInfo;
  readonly results: readonly StopResult[];
  readonly models: readonly ModelTiming[];
  /** Every stall since the page opened; `runStartMs` separates load-time ones from the run. */
  readonly stalls: readonly Stall[];
  readonly events: readonly PageEvent[];
  readonly runStartMs: number;
}

function stallLine(stall: Stall, runStartMs: number): string {
  const when = stall.atMs < runStartMs ? " (before the run)" : "";
  return `${seconds(stall.atMs)} for ${Math.round(stall.durationMs)} ms at ${stall.stopId}${when}`;
}

export function formatReport({ device, results, models, stalls, events, runStartMs }: ReportInput): string {
  const summary = verdict(results, stalls.filter((stall) => stall.atMs >= runStartMs));
  const lines = [
    "PEREZ museum benchmark",
    `Device: ${device.userAgent}`,
    `GPU: ${device.gpu}`,
    `Screen ${device.screen} · viewport ${device.viewport} · DPR ${device.devicePixelRatio} (rendered at ${device.renderPixelRatio} on load; later changes are in the timeline)`,
    `CPU cores: ${device.cores ?? "unknown"} · memory: ${device.memoryGb !== null ? `${device.memoryGb} GB` : "unknown"}`,
    "",
    "Stop | avg fps | min fps | longest frame ms | frames >50/>100 ms | arrival longest frame ms | draw calls | triangles",
    ...results.map(stopLine),
    "",
    `Worst stop average: ${summary.worstAvgFps} fps · lowest second: ${summary.worstMinFps} fps`,
    `Stalls over ${STALL_MS} ms: ${stalls.length ? stalls.map((stall) => stallLine(stall, runStartMs)).join(" · ") : "none"}`,
    `30 fps target: ${summary.meetsTarget ? "met" : "NOT met"}`,
    "",
    `Timeline: ${events.length ? events.map((event) => `${event.label} ${seconds(event.atMs)}`).join(" · ") : "not recorded"}`,
    `Benchmark started: ${seconds(runStartMs)}`,
    `Models: ${
      models.length ? models.map((m) => `${m.file} ${m.kb} KB, requested ${seconds(m.startMs)}, ${m.ms} ms`).join(" · ") : "not recorded"
    }`,
  ];
  return lines.join("\n");
}
