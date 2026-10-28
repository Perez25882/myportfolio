"use client";

import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import type { Group } from "three";
import { WORLD_ORIGIN, type World } from "@/journey/chapters";
import { toThree } from "@/museum/stops";
import styles from "../journey.module.css";

/**
 * Shared pieces for the worlds built in code (LedgerMind, Accra, the JoyDataBundle network,
 * About and Skills). Their geometry is authored in three.js coordinates (Y up, +Z toward the
 * arriving camera) relative to the world's origin. Materials are Lambert: lit by the canvas's one
 * hemisphere and one sun, which stay mounted so no shader is recompiled on the way through.
 */

/** The museum's materials: plaster, laterite, bronze and basalt, plus each project's own colour. */
export const TONE = {
  plaster: "#e9e1d4",
  plasterShade: "#cdc2b1",
  sand: "#d8c3a2",
  charcoal: "#2a2724",
  laterite: "#a0583a",
  lateriteDeep: "#74432e",
  ochre: "#c08a4a",
  bronze: "#b48a4e",
  basalt: "#3a3733",
  ledgermind: "#3f5a52",
  online: "#7fc4a4",
  offline: "#d4a35a",
  teal: "#0f7c8f",
  tealLight: "#69b9c4",
} as const;

/** Small deterministic random numbers, so every visitor sees the same city and the same fragments. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Triple = [number, number, number];

/** A world's origin in three.js coordinates. */
export function worldPosition(world: World): Triple {
  return toThree(WORLD_ORIGIN[world]) as unknown as Triple;
}

interface WorldProps {
  readonly world: World;
  readonly children: ReactNode;
}

/**
 * A code-built world, placed at its origin and kept hidden until its shaders are compiled off
 * the main thread (the same guard the Blender rooms use), so arriving never stalls a frame.
 */
export function CodeWorld({ world, children }: WorldProps) {
  const group = useRef<Group>(null);
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);
  const invalidate = useThree((state) => state.invalidate);
  const [compiled, setCompiled] = useState(false);

  useEffect(() => {
    if (!group.current) return;
    let cancelled = false;
    gl.compileAsync(group.current, camera, scene).then(() => {
      if (cancelled) return;
      setCompiled(true);
      invalidate();
    });
    return () => {
      cancelled = true;
    };
  }, [gl, camera, scene, invalidate]);

  return (
    <group ref={group} position={worldPosition(world)} visible={compiled}>
      {children}
    </group>
  );
}

interface LabelProps {
  readonly position: Triple;
  readonly children: ReactNode;
  readonly labelRef?: RefObject<HTMLSpanElement | null>;
}

/**
 * A readable label pinned to a point in the scene. Decorative for assistive technology: the
 * chapter's text panel says the same thing in the page itself.
 */
export function Label({ position, children, labelRef }: LabelProps) {
  return (
    <Html position={position} center zIndexRange={[4, 0]} pointerEvents="none">
      <span ref={labelRef} className={styles.label} aria-hidden="true">
        {children}
      </span>
    </Html>
  );
}

interface FloorProps {
  readonly color: string;
  readonly size?: number;
}

/** A floor wider than the camera can see (its far plane is 220 m), in the sky's colour family. */
export function Floor({ color, size = 460 }: FloorProps) {
  return (
    <mesh rotation-x={-Math.PI / 2}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

