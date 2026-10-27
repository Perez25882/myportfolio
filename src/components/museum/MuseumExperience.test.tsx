import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { FrameSample } from "@/museum/benchmark";
import { stopIndexOf } from "@/museum/stops";
import { useMuseumStore } from "@/store/museum";
import { MuseumExperience } from "./MuseumExperience";

// jsdom has no WebGL: the canvas is replaced by a stub that exposes its callbacks.
interface StubProps {
  onCourtReady: () => void;
  onContextLost: () => void;
  onFrameSample: (sample: FrameSample) => void;
  onStall: (atMs: number, durationMs: number) => void;
  onRenderer: (info: { gpu: string; renderPixelRatio: number }) => void;
}

const SAMPLE: FrameSample = {
  fps: 58.6,
  calls: 21,
  triangles: 15000,
  textures: 2,
  geometries: 40,
  longestFrameMs: 18,
  framesOver50: 0,
  framesOver100: 0,
};

vi.mock("./MuseumCanvas", () => ({
  default: (props: StubProps) => (
    <div>
      <button type="button" onClick={props.onCourtReady}>court ready</button>
      <button type="button" onClick={props.onContextLost}>lose context</button>
      <button
        type="button"
        onClick={() => {
          props.onRenderer({ gpu: "Stub GPU", renderPixelRatio: 1.5 });
          props.onFrameSample(SAMPLE);
        }}
      >
        sample fps
      </button>
      <button type="button" onClick={() => props.onStall(performance.now(), 900)}>
        stall
      </button>
    </div>
  ),
}));
vi.mock("@react-three/drei", () => ({ useProgress: () => ({ progress: 40 }) }));

afterEach(() => {
  useMuseumStore.setState({ stopIndex: 0, cut: 0, demoProgress: 0, monumentOpen: false });
  window.history.replaceState(null, "", "/museum");
  vi.useRealTimers();
});

describe("MuseumExperience", () => {
  it("shows loading progress with a way out until the Court is ready", async () => {
    render(<MuseumExperience />);

    expect(screen.getByText(/Opening the Court… 40%/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Skip to the 2D portfolio" })).toHaveAttribute("href", "/quick");

    fireEvent.click(await screen.findByRole("button", { name: "court ready" }));
    expect(screen.queryByText(/Opening the Court/)).not.toBeInTheDocument();
  });

  it("explains a slow connection after eight seconds", () => {
    vi.useFakeTimers();
    render(<MuseumExperience />);
    act(() => vi.advanceTimersByTime(8000));
    expect(screen.getByText(/Taking a while on this connection/)).toBeInTheDocument();
  });

  it("recovers from a lost WebGL context", async () => {
    render(<MuseumExperience />);

    fireEvent.click(await screen.findByRole("button", { name: "lose context" }));
    expect(screen.getByRole("alert")).toHaveTextContent("The 3D view stopped responding");

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("button", { name: "court ready" })).toBeInTheDocument();
  });

  it("opens at the stop named in the URL and keeps the URL in step", async () => {
    window.history.replaceState(null, "", "/museum?stop=beneath");
    render(<MuseumExperience />);

    expect(useMuseumStore.getState().stopIndex).toBe(stopIndexOf("beneath"));
    expect(window.location.search).toContain("stop=beneath");
    expect(await screen.findByRole("heading", { name: "Look beneath the surface" })).toBeInTheDocument();
  });

  it("reports frame rate in performance mode", async () => {
    window.history.replaceState(null, "", "/museum?perf=1");
    render(<MuseumExperience />);

    fireEvent.click(await screen.findByRole("button", { name: "sample fps" }));
    expect(screen.getByText("59 fps")).toBeInTheDocument();
    expect(window.__museumFps).toContain(59);
  });

  const runBenchmark = async (duringFirstStop?: () => void) => {
    const sampleButton = await screen.findByRole("button", { name: "sample fps" });
    vi.useFakeTimers();
    fireEvent.click(screen.getByRole("button", { name: "Run benchmark" }));
    for (let stop = 0; stop < 7; stop += 1) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500);
      });
      fireEvent.click(sampleButton);
      if (stop === 0) duringFirstStop?.();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });
    }
    return screen.getByText(/PEREZ museum benchmark/);
  };

  it("runs the benchmark across every stop and produces a copyable report", async () => {
    window.history.replaceState(null, "", "/museum?perf=1");
    render(<MuseumExperience />);
    fireEvent.click(await screen.findByRole("button", { name: "court ready" }));

    const report = await runBenchmark();
    expect(report).toHaveTextContent("GPU: Stub GPU");
    expect(report).toHaveTextContent("beneath | 59 | 59 | 18 | 0/0 | no frames | 21 | 15000");
    expect(report).toHaveTextContent("Stalls over 250 ms: none");
    expect(report).toHaveTextContent("30 fps target: met");
    expect(report).toHaveTextContent(/Timeline: court ready/);

    Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("insecure")) }, configurable: true });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy results" }));
    });
    expect(screen.getByText(/Select the text above and copy it/)).toBeInTheDocument();
  });

  it("fails the benchmark when rendering stalls during the run, and says where", async () => {
    window.history.replaceState(null, "", "/museum?perf=1");
    render(<MuseumExperience />);

    const report = await runBenchmark(() => fireEvent.click(screen.getByRole("button", { name: "stall" })));
    expect(report).toHaveTextContent(/for 900 ms at court/);
    expect(report).toHaveTextContent("30 fps target: NOT met");
  });

  it("fades between distant stops", () => {
    const { container } = render(<MuseumExperience />);
    expect(container.querySelector("[class*='fade']")).toBeNull();
    act(() => useMuseumStore.getState().goTo(stopIndexOf("beneath")));
    expect(container.querySelector("[class*='fade']")).not.toBeNull();
  });
});
