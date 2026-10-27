import { useSyncExternalStore } from "react";

function mediaQueryStore(query: string) {
  const subscribe = (onChange: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  };
  const getSnapshot = () => window.matchMedia(query).matches;
  return { subscribe, getSnapshot };
}

const reducedMotion = mediaQueryStore("(prefers-reduced-motion: reduce)");
const coarsePointer = mediaQueryStore("(pointer: coarse)");

/** True when the visitor asked the OS for less motion. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(reducedMotion.subscribe, reducedMotion.getSnapshot, () => false);
}

/** True on touch-first devices (phones, tablets): used to cap render resolution. */
export function useIsCoarsePointer(): boolean {
  return useSyncExternalStore(coarsePointer.subscribe, coarsePointer.getSnapshot, () => false);
}
