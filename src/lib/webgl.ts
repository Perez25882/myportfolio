export type WebGLSupport = "webgl2" | "webgl1" | "none";

type CanvasFactory = () => HTMLCanvasElement;

const defaultCanvas: CanvasFactory = () => document.createElement("canvas");

/** Probes WebGL once and releases the probe context so it does not count against the browser's context limit. */
export function detectWebGL(createCanvas: CanvasFactory = defaultCanvas): WebGLSupport {
  try {
    const canvas = createCanvas();
    const gl2 = canvas.getContext("webgl2");
    if (gl2) {
      gl2.getExtension("WEBGL_lose_context")?.loseContext();
      return "webgl2";
    }
    const gl1 = canvas.getContext("webgl");
    if (gl1) {
      gl1.getExtension("WEBGL_lose_context")?.loseContext();
      return "webgl1";
    }
    return "none";
  } catch {
    // Some privacy modes and blocked GPUs throw instead of returning null.
    return "none";
  }
}
