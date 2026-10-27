import { describe, expect, it } from "vitest";
import { formatReport, summariseStop, verdict, type DeviceInfo, type FrameSample, type ReportInput } from "./benchmark";

const sample = (fps: number, calls = 20, triangles = 15000, longestFrameMs = 17, framesOver50 = 0, framesOver100 = 0): FrameSample => ({
  fps,
  calls,
  triangles,
  textures: 2,
  geometries: 30,
  longestFrameMs,
  framesOver50,
  framesOver100,
});

const DEVICE: DeviceInfo = {
  userAgent: "Test phone",
  gpu: "Test GPU",
  screen: "412x915",
  viewport: "412x800",
  devicePixelRatio: 2.6,
  renderPixelRatio: 1.5,
  cores: 8,
  memoryGb: null,
};

const report = (overrides: Partial<ReportInput>) =>
  formatReport({ device: DEVICE, results: [], models: [], stalls: [], events: [], runStartMs: 10_000, ...overrides });

describe("benchmark", () => {
  it("averages a stop's steady samples and keeps its worst second, longest frame and peak load", () => {
    const result = summariseStop("court", [sample(60), sample(30, 22, 15000, 80, 2, 0), sample(45, 18, 20000, 120, 1, 1)]);
    expect(result.steady).toEqual({
      avgFps: 45,
      minFps: 30,
      longestFrameMs: 120,
      framesOver50: 3,
      framesOver100: 1,
      calls: 22,
      triangles: 20000,
      samples: 3,
    });
  });

  it("keeps the arrival window apart from standing still", () => {
    const result = summariseStop("hall", [sample(59)], [sample(20, 20, 15000, 400, 3, 2)]);
    expect(result.transition.longestFrameMs).toBe(400);
    expect(result.steady.longestFrameMs).toBe(17);
  });

  it("reports an unmeasured stop as zero rather than failing", () => {
    expect(summariseStop("hall", []).steady.samples).toBe(0);
  });

  it("meets the target only when every stop averages 30 fps or more", () => {
    const passing = [summariseStop("court", [sample(40)]), summariseStop("hall", [sample(31)])];
    const failing = [summariseStop("court", [sample(40)]), summariseStop("hall", [sample(25)])];
    expect(verdict(passing).meetsTarget).toBe(true);
    expect(verdict(failing).meetsTarget).toBe(false);
    expect(verdict(failing).worstAvgFps).toBe(25);
  });

  it("fails the target when the run stalled, however high the average", () => {
    const results = [summariseStop("court", [sample(60)])];
    expect(verdict(results, [{ atMs: 12_000, durationMs: 5400, stopId: "threshold" }]).meetsTarget).toBe(false);
  });

  it("does not pass a benchmark with unmeasured stops", () => {
    expect(verdict([summariseStop("court", [sample(60)]), summariseStop("hall", [])]).meetsTarget).toBe(false);
    expect(verdict([]).meetsTarget).toBe(false);
  });

  it("formats a plain-text report a visitor can copy", () => {
    const text = report({
      results: [summariseStop("court", [sample(58)], [sample(50, 20, 15000, 40)])],
      models: [{ file: "court.glb", kb: 300, startMs: 900, ms: 450 }],
      events: [{ atMs: 3200, label: "court ready" }],
    });
    expect(text).toContain("GPU: Test GPU");
    expect(text).toContain("court | 58 | 58 | 17 | 0/0 | 40 | 20 | 15000");
    expect(text).toContain("Stalls over 250 ms: none");
    expect(text).toContain("30 fps target: met");
    expect(text).toContain("memory: unknown");
    expect(text).toContain("Timeline: court ready 3.2 s");
    expect(text).toContain("court.glb 300 KB, requested 0.9 s, 450 ms");
  });

  it("names a stop that rendered nothing as a stall, and dates every stall", () => {
    const text = report({
      results: [summariseStop("court", [sample(60)]), summariseStop("threshold", [])],
      stalls: [
        { atMs: 2000, durationMs: 300, stopId: "court" },
        { atMs: 14_500, durationMs: 5200, stopId: "threshold" },
      ],
    });
    expect(text).toContain("threshold | no frames rendered (stall)");
    expect(text).toContain("2.0 s for 300 ms at court (before the run)");
    expect(text).toContain("14.5 s for 5200 ms at threshold");
    expect(text).toContain("30 fps target: NOT met");
  });

  it("does not fail the run for a stall during the initial load", () => {
    const text = report({ results: [summariseStop("court", [sample(60)])], stalls: [{ atMs: 2000, durationMs: 300, stopId: "court" }] });
    expect(text).toContain("30 fps target: met");
  });
});
