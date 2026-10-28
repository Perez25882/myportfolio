import type { Vec3 } from "@/museum/stops";
import { CHAPTERS, type CameraKey, type Chapter } from "./chapters";

/**
 * The journey camera as a pure function of scroll. The page's scroll position is one number,
 * s = chapter index + progress through that chapter (0–1), so the camera, the scenes and the
 * veil all read the same value and can never disagree.
 */

export interface CameraPose {
  readonly position: Vec3;
  readonly target: Vec3;
  readonly fov: number;
}

const PORTRAIT_FOV_BOOST = 18; // degrees added at the narrowest phone aspect
const PORTRAIT_PULLBACK = 0.35; // extra distance from the target, open worlds only
const NARROWEST_ASPECT = 0.55;
const MAX_FOV = 80;

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Eases in and out of each key, so the camera settles on every composition before moving on. */
export function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixVec = (a: Vec3, b: Vec3, t: number): Vec3 => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

/** The pose at point t (0–1) of a chapter's keys. */
export function sampleKeys(keys: readonly CameraKey[], t: number): CameraPose {
  const first = keys[0];
  if (t <= first.at || keys.length === 1) return first;
  for (let i = 1; i < keys.length; i += 1) {
    const to = keys[i];
    if (t <= to.at) {
      const from = keys[i - 1];
      const local = smoothstep((t - from.at) / (to.at - from.at));
      return { position: mixVec(from.position, to.position, local), target: mixVec(from.target, to.target, local), fov: mix(from.fov, to.fov, local) };
    }
  }
  return keys[keys.length - 1];
}

/** The chapter index and progress (0–1) for a scroll value. */
export function locate(s: number, chapters: readonly Chapter[] = CHAPTERS): { readonly index: number; readonly progress: number } {
  const last = chapters.length - 1;
  const clamped = Math.min(last + 1, Math.max(0, s));
  const index = Math.min(last, Math.floor(clamped));
  return { index, progress: clamped - index };
}

export function poseAt(s: number, chapters: readonly Chapter[] = CHAPTERS): CameraPose {
  const { index, progress } = locate(s, chapters);
  return sampleKeys(chapters[index].camera, progress);
}

/**
 * Portrait screens see less width, so the camera widens its lens and, in the open worlds built
 * in code, steps back. In the walled Blender rooms (the Court and FlowDesk) it only widens:
 * stepping back would put it through a wall.
 */
export function fitToAspect(pose: CameraPose, aspect: number, enclosed: boolean): CameraPose {
  if (aspect >= 1) return pose;
  const narrow = clamp01((1 - aspect) / (1 - NARROWEST_ASPECT));
  const fov = Math.min(MAX_FOV, pose.fov + PORTRAIT_FOV_BOOST * narrow);
  if (enclosed) return { ...pose, fov };
  const scale = 1 + PORTRAIT_PULLBACK * narrow;
  const [px, py, pz] = pose.position;
  const [tx, ty, tz] = pose.target;
  return { position: [tx + (px - tx) * scale, ty + (py - ty) * scale, tz + (pz - tz) * scale], target: pose.target, fov };
}

/**
 * Reduced motion: the camera holds each authored composition and cuts to the next, instead of
 * flying between them. Returns the scroll value of the key last passed.
 */
export function quantize(s: number, chapters: readonly Chapter[] = CHAPTERS): number {
  const { index, progress } = locate(s, chapters);
  const keys = chapters[index].camera;
  let at = keys[0].at;
  for (const key of keys) if (key.at <= progress + 1e-6 && key.at < 1) at = key.at;
  return index + at;
}

/** Points where the scene changes world (not the Court to FlowDesk walk): covered by a veil. */
export function worldCuts(chapters: readonly Chapter[] = CHAPTERS): readonly number[] {
  // The Court and FlowDesk share one Blender space: the camera walks from one into the other.
  const rooms = new Set(["court", "flowdesk"]);
  const continuous = (a: string, b: string) => a === b || (rooms.has(a) && rooms.has(b));
  const cuts: number[] = [];
  for (let i = 1; i < chapters.length; i += 1) {
    if (!continuous(chapters[i - 1].world, chapters[i].world)) cuts.push(i);
  }
  return cuts;
}

const VEIL_HALF_WIDTH = 0.08; // in chapters: the veil fades over the last and first 8% either side

/** Veil opacity (0–1) at scroll value s: opaque exactly at a world cut. */
export function veilAt(s: number, cuts: readonly number[]): number {
  let veil = 0;
  for (const cut of cuts) veil = Math.max(veil, 1 - Math.abs(s - cut) / VEIL_HALF_WIDTH);
  return smoothstep(veil);
}
