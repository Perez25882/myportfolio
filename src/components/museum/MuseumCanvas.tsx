"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { type Object3D, type PerspectiveCamera, Vector3 } from "three";
import {
  BronzeEnvironment,
  COURT_URL,
  FLOWDESK_URL,
  Ground,
  SKY,
  restPosition,
  useBakedScene,
  useCompiledScene,
} from "@/components/three/baked";
import { STALL_MS, type FrameSample, type RendererInfo } from "@/museum/benchmark";
import { orderRecorded } from "@/museum/demo";
import { STOPS, poseFor, type Stop } from "@/museum/stops";
import { useMuseumStore } from "@/store/museum";

const CAMERA_EASE = 3; // per second: about 1.5 s to settle
const MAX_DPR_TOUCH = 1.5;
const MAX_DPR_DESKTOP = 2;

const SEAM_OPENING = 0.35; // metres each cast half moves along the seam

function Court({ onReady, reducedMotion }: { readonly onReady: () => void; readonly reducedMotion: boolean }) {
  const scene = useBakedScene(COURT_URL);
  const open = useMuseumStore((state) => state.monumentOpen);
  const invalidate = useThree((state) => state.invalidate);
  const compiled = useCompiledScene(scene);
  // Once per loaded scene: the parent's callback changes identity on every render.
  const announceReady = useEffectEvent(onReady);
  useEffect(() => {
    if (compiled) announceReady();
  }, [compiled]);
  useEffect(() => invalidate(), [open, invalidate]);

  // The cast halves of each character: front halves face the arrival (Blender -Y, three.js +Z).
  const halves = useMemo(() => {
    const found: { node: Object3D; base: Vector3; direction: number }[] = [];
    scene.traverse((node) => {
      if (!node.name.startsWith("CT_monument_")) return;
      found.push({ node, base: restPosition(node), direction: node.name.includes("_front") ? 1 : -1 });
    });
    return found;
  }, [scene]);

  useFrame((_, delta) => {
    const k = reducedMotion ? 1 : 1 - Math.exp(-Math.min(delta, 0.1) * 2.5); // mass moves slowly
    let moving = false;
    for (const { node, base, direction } of halves) {
      const goalZ = base.z + (open ? direction * SEAM_OPENING : 0);
      node.position.setZ(node.position.z + (goalZ - node.position.z) * k);
      node.updateMatrix();
      if (Math.abs(goalZ - node.position.z) > 0.001) moving = true;
    }
    if (moving) invalidate();
  });

  return <primitive object={scene} visible={compiled} />;
}

// FlowDesk parts that move with the demonstration (names from blender/scripts/rooms/flowdesk.py).
const RUNTIME_PARTS = ["FD_pipeline_lid", "FD_floor_gate", "FD_order_slip"] as const;
type RuntimePart = (typeof RUNTIME_PARTS)[number];
const STATION_PITCH = 1.3; // metres between pipeline stations
// Station the order slip rests at after each demo step: start, understood, stopped at the floor gate, recorded.
const SLIP_STATION = [0, 3, 4, 6, 6];

/** Offset (three.js metres, Y up) from a part's exported position for the current stop and demo step. */
function partOffset(part: RuntimePart, stopId: string, progress: number): [number, number, number] {
  if (part === "FD_pipeline_lid") return [0, stopId === "beneath" ? 1.1 : 0, 0]; // Look beneath: the lid lifts
  if (part === "FD_floor_gate") return [0, progress >= 2 ? 0 : -0.78, 0]; // rises when the low offer is refused
  const station = SLIP_STATION[Math.min(progress, SLIP_STATION.length - 1)];
  return [0, 0, -station * STATION_PITCH]; // Blender +Y along the table is three.js -Z
}

function FlowDesk({ onReady, reducedMotion }: { readonly onReady: () => void; readonly reducedMotion: boolean }) {
  const scene = useBakedScene(FLOWDESK_URL);
  const stopId = useMuseumStore((state) => STOPS[state.stopIndex].id);
  const recorded = useMuseumStore((state) => orderRecorded(state.demoProgress));
  const invalidate = useThree((state) => state.invalidate);

  // Compile and upload now, while the visitor is still in the Court, so the first frame that
  // sees FlowDesk does not pay for it (the Phase 2 iPhone froze right here).
  const compiled = useCompiledScene(scene);
  const announceReady = useEffectEvent(onReady);
  useEffect(() => {
    if (compiled) announceReady();
  }, [compiled]);

  const progress = useMuseumStore((state) => state.demoProgress);
  const parts = useMemo(() => {
    const found: { prefix: RuntimePart; node: Object3D; base: Vector3 }[] = [];
    scene.traverse((node) => {
      const prefix = RUNTIME_PARTS.find((name) => node.name.startsWith(name));
      if (prefix && !found.some((part) => part.prefix === prefix)) found.push({ prefix, node, base: restPosition(node) });
    });
    return found;
  }, [scene]);
  useEffect(() => invalidate(), [stopId, progress, recorded, invalidate]);
  useFrame((state, delta) => {
    // The order slab appears on the owner's counter once the order is recorded.
    const slab = state.scene.getObjectByName("FD_order_slab");
    if (slab) slab.visible = recorded;

    let moving = false;
    const k = reducedMotion ? 1 : 1 - Math.exp(-Math.min(delta, 0.1) * 4);
    for (const { prefix, node, base } of parts) {
      const [dx, dy, dz] = partOffset(prefix, stopId, progress);
      const goal = new Vector3(base.x + dx, base.y + dy, base.z + dz);
      node.position.lerp(goal, k);
      node.updateMatrix();
      if (node.position.distanceTo(goal) > 0.001) moving = true;
    }
    if (moving) invalidate();
  });

  return <primitive object={scene} visible={compiled} />;
}

/** Eases the camera to the current stop's pose; cuts instantly for reduced motion or distant jumps. */
function CameraRig({ stop, cut, reducedMotion }: { readonly stop: Stop; readonly cut: number; readonly reducedMotion: boolean }) {
  const aspect = useThree((state) => state.size.width / state.size.height);
  const invalidate = useThree((state) => state.invalidate);
  const pose = poseFor(stop, aspect);
  const goalPosition = useMemo(() => new Vector3(...pose.position), [pose.position]);
  const goalTarget = useMemo(() => new Vector3(...pose.target), [pose.target]);
  const lookAt = useRef<Vector3 | null>(null);
  const snapNext = useRef(true);

  useEffect(() => {
    snapNext.current = true;
  }, [cut]);
  useEffect(() => invalidate(), [goalPosition, goalTarget, pose.fov, invalidate]);

  useFrame((state, delta) => {
    const camera = state.camera as PerspectiveCamera;
    const snap = reducedMotion || snapNext.current || lookAt.current === null;
    const k = snap ? 1 : 1 - Math.exp(-Math.min(delta, 0.1) * CAMERA_EASE);
    lookAt.current ??= goalTarget.clone();
    camera.position.lerp(goalPosition, k);
    lookAt.current.lerp(goalTarget, k);
    camera.fov += (pose.fov - camera.fov) * k;
    camera.updateProjectionMatrix();
    camera.lookAt(lookAt.current);
    snapNext.current = false;
    if (camera.position.distanceTo(goalPosition) > 0.005 || lookAt.current.distanceTo(goalTarget) > 0.005) invalidate();
  });
  return null;
}

interface PerfProbeProps {
  readonly onSample: (sample: FrameSample) => void;
  readonly onStall: (atMs: number, durationMs: number) => void;
  readonly onRenderer: (info: RendererInfo) => void;
}

/**
 * ?perf=1 only: renders continuously and reports, every second, the frame rate, the
 * longest frame and slow-frame counts, plus what the GPU drew (from three.js
 * renderer.info), and once the GPU name. Any gap between frames over STALL_MS is a stall.
 */
function PerfProbe({ onSample, onStall, onRenderer }: PerfProbeProps) {
  const frames = useRef(0);
  const since = useRef(0);
  const lastFrameAt = useRef<number | null>(null);
  const longest = useRef(0);
  const over50 = useRef(0);
  const over100 = useRef(0);
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const context = gl.getContext();
    const debug = context.getExtension("WEBGL_debug_renderer_info");
    const gpu = debug ? String(context.getParameter(debug.UNMASKED_RENDERER_WEBGL)) : "unavailable";
    onRenderer({ gpu, renderPixelRatio: Math.round(gl.getPixelRatio() * 100) / 100 });
  }, [gl, onRenderer]);

  useFrame((state) => {
    // Wall-clock gaps: the three.js clock would hide a frozen main thread inside one big delta.
    const at = performance.now();
    if (lastFrameAt.current !== null) {
      const gap = at - lastFrameAt.current;
      if (gap > STALL_MS) onStall(lastFrameAt.current, gap);
      longest.current = Math.max(longest.current, gap);
      if (gap > 50) over50.current += 1;
      if (gap > 100) over100.current += 1;
    }
    lastFrameAt.current = at;

    frames.current += 1;
    const now = state.clock.elapsedTime;
    if (now - since.current >= 1) {
      const { render, memory } = state.gl.info;
      onSample({
        fps: frames.current / (now - since.current),
        calls: render.calls,
        triangles: render.triangles,
        textures: memory.textures,
        geometries: memory.geometries,
        longestFrameMs: longest.current,
        framesOver50: over50.current,
        framesOver100: over100.current,
      });
      frames.current = 0;
      since.current = now;
      longest.current = 0;
      over50.current = 0;
      over100.current = 0;
    }
  });
  return null;
}

interface MuseumCanvasProps {
  readonly cut: number;
  readonly reducedMotion: boolean;
  readonly coarsePointer: boolean;
  readonly perfMode: boolean;
  readonly onCourtReady: () => void;
  readonly onFlowDeskReady: () => void;
  readonly onContextLost: () => void;
  readonly onFrameSample: (sample: FrameSample) => void;
  readonly onStall: (atMs: number, durationMs: number) => void;
  readonly onRenderer: (info: RendererInfo) => void;
  /** Every render pixel ratio the adaptive quality settles on, starting with the first. */
  readonly onPixelRatio: (ratio: number) => void;
}

export default function MuseumCanvas(props: MuseumCanvasProps) {
  const { cut, reducedMotion, coarsePointer, perfMode, onCourtReady, onFlowDeskReady, onContextLost, onFrameSample, onStall, onRenderer } =
    props;
  const stop = useMuseumStore((state) => STOPS[state.stopIndex]);
  const maxDpr = coarsePointer ? MAX_DPR_TOUCH : MAX_DPR_DESKTOP;
  const [dpr, setDpr] = useState(Math.min(maxDpr, typeof window === "undefined" ? 1 : window.devicePixelRatio));
  // A ratio change resizes the canvas and reallocates its buffers: the benchmark needs to see it.
  const announcePixelRatio = useEffectEvent(props.onPixelRatio);
  useEffect(() => announcePixelRatio(dpr), [dpr]);
  const [courtReady, setCourtReady] = useState(false);
  const [loadFlowDesk, setLoadFlowDesk] = useState(false);

  // Lazy loading: the FlowDesk room is fetched shortly after the Court is on screen,
  // or at once if the visitor heads there first. Once loaded it stays loaded.
  const headingToFlowDesk = stop.room === "flowdesk" || stop.id === "threshold";
  if (headingToFlowDesk && !loadFlowDesk) setLoadFlowDesk(true);
  useEffect(() => {
    if (!courtReady) return;
    const timer = window.setTimeout(() => setLoadFlowDesk(true), 1500);
    return () => window.clearTimeout(timer);
  }, [courtReady]);

  const handleCourtReady = () => {
    setCourtReady(true);
    onCourtReady();
  };

  return (
    <Canvas
      flat
      dpr={dpr}
      frameloop={perfMode ? "always" : "demand"}
      camera={{ near: 0.1, far: 400, fov: 50 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          onContextLost();
        });
      }}
      aria-hidden="true"
    >
      <color attach="background" args={[SKY]} />
      <PerformanceMonitor
        onDecline={() => setDpr((value) => Math.max(1, value - 0.25))}
        onIncline={() => setDpr((value) => Math.min(maxDpr, value + 0.25))}
      />
      <Ground />
      <BronzeEnvironment />
      <Suspense fallback={null}>
        <Court onReady={handleCourtReady} reducedMotion={reducedMotion} />
      </Suspense>
      {loadFlowDesk ? (
        <Suspense fallback={null}>
          <FlowDesk onReady={onFlowDeskReady} reducedMotion={reducedMotion} />
        </Suspense>
      ) : null}
      <CameraRig stop={stop} cut={cut} reducedMotion={reducedMotion} />
      {perfMode ? <PerfProbe onSample={onFrameSample} onStall={onStall} onRenderer={onRenderer} /> : null}
    </Canvas>
  );
}
