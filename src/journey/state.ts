/**
 * The journey's scroll position, s = chapter index + progress (see camera.ts).
 *
 * Deliberately a mutable module value, not React state: ScrollTrigger writes it on every scroll
 * frame and the canvas reads it inside useFrame, so scrolling never re-renders a component.
 * Listeners are told only that it changed, so the on-demand canvas knows to draw a frame.
 */

type Listener = () => void;

let target = 0;
const listeners = new Set<Listener>();

export function getScrollTarget(): number {
  return target;
}

export function setScrollTarget(value: number): void {
  if (value === target) return;
  target = value;
  for (const listener of listeners) listener();
}

export function subscribeScrollTarget(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Progress (0–1) through chapter `index` at scroll value s: 0 before it, 1 after it. */
export function progressIn(s: number, index: number): number {
  return Math.min(1, Math.max(0, s - index));
}

/** 0 to 1 as `progress` moves from `start` to `end`: drives a scene event across part of a chapter. */
export function span(progress: number, start: number, end: number): number {
  return Math.min(1, Math.max(0, (progress - start) / (end - start)));
}

/**
 * What the canvas is showing: the scroll target eased over a few frames by the camera rig, and
 * read by every scene in the same frame. Written only by the rig.
 */
export const view = { s: 0 };
