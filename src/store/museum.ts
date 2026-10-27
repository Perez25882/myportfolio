import { create } from "zustand";
import { DEMO_STEPS, type DemoProgress } from "@/museum/demo";
import { STOPS, isFlight, stopIndexOf } from "@/museum/stops";

interface MuseumState {
  readonly stopIndex: number;
  /** Increments whenever the camera should cut (fade) instead of flying. */
  readonly cut: number;
  readonly demoProgress: DemoProgress;
  /** Code Monument "Look beneath": the cast halves part along their seams. */
  readonly monumentOpen: boolean;
  toggleMonument: () => void;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  playDemoStep: () => void;
  resetDemo: () => void;
}

const clampStop = (index: number) => Math.min(Math.max(index, 0), STOPS.length - 1);

/** Tour position and demonstration progress for the 3D museum. */
export const useMuseumStore = create<MuseumState>()((set, get) => {
  const moveTo = (index: number) => {
    const { stopIndex, cut } = get();
    const target = clampStop(index);
    if (target === stopIndex) return {};
    // Leaving a stop returns the monument to rest.
    return { stopIndex: target, cut: isFlight(stopIndex, target) ? cut : cut + 1, monumentOpen: false };
  };

  return {
    stopIndex: 0,
    cut: 0,
    demoProgress: 0,
    monumentOpen: false,
    toggleMonument: () => set({ monumentOpen: !get().monumentOpen }),
    goTo: (index) => set(moveTo(index)),
    next: () => set(moveTo(get().stopIndex + 1)),
    prev: () => set(moveTo(get().stopIndex - 1)),
    playDemoStep: () => {
      const { demoProgress, stopIndex } = get();
      const step = DEMO_STEPS[demoProgress];
      if (!step) return;
      set({ demoProgress: demoProgress + 1, ...moveTo(step.stop ? stopIndexOf(step.stop) : stopIndex) });
    },
    resetDemo: () => set({ demoProgress: 0, ...moveTo(stopIndexOf("conversation")) }),
  };
});
