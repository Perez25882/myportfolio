import { afterEach, describe, expect, it, vi } from "vitest";
import { detectWebGL } from "./webgl";

function fakeContext() {
  const loseContext = vi.fn();
  return { context: { getExtension: () => ({ loseContext }) }, loseContext };
}

function canvasWith(contexts: Partial<Record<"webgl2" | "webgl", unknown>>) {
  return () => ({ getContext: (id: "webgl2" | "webgl") => contexts[id] ?? null }) as unknown as HTMLCanvasElement;
}

describe("detectWebGL", () => {
  afterEach(() => vi.restoreAllMocks());

  it("prefers WebGL 2 and releases the probe context", () => {
    const { context, loseContext } = fakeContext();
    expect(detectWebGL(canvasWith({ webgl2: context }))).toBe("webgl2");
    expect(loseContext).toHaveBeenCalledOnce();
  });

  it("falls back to WebGL 1", () => {
    const { context, loseContext } = fakeContext();
    expect(detectWebGL(canvasWith({ webgl: context }))).toBe("webgl1");
    expect(loseContext).toHaveBeenCalledOnce();
  });

  it("reports none when no context is available", () => {
    expect(detectWebGL(canvasWith({}))).toBe("none");
  });

  it("reports none when the browser throws", () => {
    const throwing = () => {
      throw new Error("GPU blocked");
    };
    expect(detectWebGL(throwing)).toBe("none");
  });

  it("uses a real canvas by default", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(detectWebGL()).toBe("none");
  });
});
