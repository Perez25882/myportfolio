"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { Color, Vector3, type DirectionalLight, type HemisphereLight, type Mesh, type PerspectiveCamera } from "three";
import { BronzeEnvironment, GROUND, SKY } from "@/components/three/baked";
import { fitToAspect, locate, poseAt, quantize, smoothstep, veilAt, worldCuts } from "@/journey/camera";
import { CHAPTERS, chapterIndexOf, type World } from "@/journey/chapters";
import { getScrollTarget, subscribeScrollTarget, view } from "@/journey/state";
import { toThree } from "@/museum/stops";
import { AboutScene } from "./scenes/AboutScene";
import { AccraScene } from "./scenes/AccraScene";
import { LedgerMindScene } from "./scenes/LedgerMindScene";
import { NetworkScene } from "./scenes/NetworkScene";
import { JourneyCourt, JourneyFlowDesk } from "./scenes/RoomScenes";
import { SkillsScene } from "./scenes/SkillsScene";

/**
 * The home page's one persistent canvas. A single rig turns the scroll value into the camera,
 * the sky, the lights and the veil, once per frame; every scene reads the same eased value.
 * The frame loop runs on demand: nothing is drawn while the page is still.
 */

const SCROLL_EASE = 7; // per second: the camera trails scroll by about a third of a second
const MAX_GLIDE = 1.2; // chapters: a longer jump (a chapter link) cuts behind the veil instead
const FLASH_FADE = 1.8; // per second
const MAX_DPR_TOUCH = 1.5;
const MAX_DPR_DESKTOP = 2;
const FAR = 220; // worlds sit 300 m apart, so only one is ever within reach
const FLOWDESK_IDLE_MS = 6000;
const VIEW_SHIFT = 0.13; // of the screen: frames the subject beside the text panel, not under it

const CODE_WORLDS = new Set<World>(["ledgermind", "accra", "network", "about", "skills"]);
const INDEX = {
  monument: chapterIndexOf("monument"),
  flowdesk: chapterIndexOf("flowdesk"),
  ledgermind: chapterIndexOf("ledgermind"),
  accra: chapterIndexOf("accra"),
  joydatabundle: chapterIndexOf("joydatabundle"),
  about: chapterIndexOf("about"),
  skills: chapterIndexOf("skills"),
  contact: chapterIndexOf("contact"),
};

interface RigProps {
  readonly reducedMotion: boolean;
  /** Receives the veil's opacity (0–1) whenever it changes. */
  readonly onVeil: (opacity: number) => void;
}

/**
 * Owns the camera, the sky, the one hemisphere and one sun (always mounted, so the lit
 * materials' shaders never change as worlds come and go), and the Court's ground.
 */
function JourneyRig({ reducedMotion, onVeil }: RigProps) {
  const invalidate = useThree((state) => state.invalidate);
  const cuts = useMemo(() => worldCuts(), []);
  const scratch = useMemo(() => ({ target: new Vector3(), from: new Color(), to: new Color(), sky: new Color(SKY) }), []);
  const hemisphere = useRef<HemisphereLight>(null);
  const sun = useRef<DirectionalLight>(null);
  const ground = useRef<Mesh>(null);
  const started = useRef(false);
  const flash = useRef(0);
  const lastVeil = useRef(-1);

  useEffect(() => subscribeScrollTarget(() => invalidate()), [invalidate]);

  useFrame((state, delta) => {
    const camera = state.camera as PerspectiveCamera;
    const dt = Math.min(delta, 0.1);
    const goal = getScrollTarget();
    let s = view.s;
    if (!started.current || reducedMotion) s = goal;
    else if (Math.abs(goal - s) > MAX_GLIDE) {
      s = goal;
      flash.current = 1;
    } else {
      s += (goal - s) * (1 - Math.exp(-dt * SCROLL_EASE));
      if (Math.abs(goal - s) < 1e-4) s = goal;
    }
    started.current = true;
    view.s = s;

    const { index, progress } = locate(s);
    const chapter = CHAPTERS[index];
    const { width, height } = state.size;
    const aspect = width / height;
    // Reduced motion: scenes still show the state the text describes, but the camera holds each
    // authored composition and cuts to the next instead of flying.
    const pose = fitToAspect(poseAt(reducedMotion ? quantize(s) : s), aspect, !CODE_WORLDS.has(chapter.world));
    camera.position.set(...toThree(pose.position));
    camera.lookAt(scratch.target.set(...toThree(pose.target)));
    camera.fov = pose.fov;
    // The text panel sits left on wide screens and low on phones: shift the frame away from it.
    if (aspect >= 1) camera.setViewOffset(width, height, -width * VIEW_SHIFT, 0, width, height);
    else camera.setViewOffset(width, height, 0, height * VIEW_SHIFT, width, height);
    camera.updateProjectionMatrix();

    // Sky: within one world, ease from the previous chapter's colour (the dusk finale); across a
    // cut, change under the veil.
    const previous = CHAPTERS[Math.max(0, index - 1)];
    const blend = index > 0 && !cuts.includes(index) ? smoothstep(progress / 0.6) : 1;
    scratch.sky.copy(scratch.from.set(previous.sky)).lerp(scratch.to.set(chapter.sky), blend);
    state.scene.background = scratch.sky;

    // The code-built worlds are lit; the baked rooms carry their own light and need none.
    const lit = CODE_WORLDS.has(chapter.world);
    if (hemisphere.current) hemisphere.current.intensity = lit ? 1.5 : 0;
    if (sun.current) sun.current.intensity = lit ? 2 : 0;
    if (ground.current) ground.current.visible = !lit;

    flash.current = Math.max(0, flash.current - dt * FLASH_FADE);
    const veilOpacity = reducedMotion ? 0 : Math.round(Math.max(veilAt(s, cuts), flash.current) * 100) / 100;
    if (veilOpacity !== lastVeil.current) {
      onVeil(veilOpacity);
      lastVeil.current = veilOpacity;
    }

    if (s !== goal || flash.current > 0) invalidate();
  }, -1);

  return (
    <>
      <hemisphereLight ref={hemisphere} args={["#f3ece2", "#3a332c", 0]} />
      <directionalLight ref={sun} position={[6, 10, 7]} intensity={0} />
      <mesh ref={ground} rotation-x={-Math.PI / 2} position-y={-0.32}>
        <planeGeometry args={[240, 240]} />
        <meshBasicMaterial color={GROUND} />
      </mesh>
    </>
  );
}

/** The active chapter, as React state: it changes about ten times on the way down, not per frame. */
function useActiveChapter(): number {
  const [active, setActive] = useState(() => locate(getScrollTarget()).index);
  useEffect(() => subscribeScrollTarget(() => setActive(locate(getScrollTarget()).index)), []);
  return active;
}

interface JourneyCanvasProps {
  readonly reducedMotion: boolean;
  readonly coarsePointer: boolean;
  readonly onVeil: (opacity: number) => void;
  readonly onReady: () => void;
  readonly onContextLost: () => void;
}

export default function JourneyCanvas({ reducedMotion, coarsePointer, onVeil, onReady, onContextLost }: JourneyCanvasProps) {
  const maxDpr = coarsePointer ? MAX_DPR_TOUCH : MAX_DPR_DESKTOP;
  const [dpr, setDpr] = useState(() => Math.min(maxDpr, window.devicePixelRatio));
  const active = useActiveChapter();
  const [courtReady, setCourtReady] = useState(false);
  const [loadFlowDesk, setLoadFlowDesk] = useState(false);
  const announceReady = useEffectEvent(onReady);

  // FlowDesk streams in once the visitor heads down the page, or after the Court has been quiet on
  // screen for a while: never in the same moments as the Court's own first frames.
  if (!loadFlowDesk && courtReady && active >= INDEX.monument && active <= INDEX.ledgermind) setLoadFlowDesk(true);
  useEffect(() => {
    if (!courtReady) return;
    announceReady();
    const timer = window.setTimeout(() => setLoadFlowDesk(true), FLOWDESK_IDLE_MS);
    return () => window.clearTimeout(timer);
  }, [courtReady]);

  // Code-built worlds exist only around their own chapter: built just before, released after.
  const near = (index: number) => Math.abs(active - index) <= 1;

  return (
    <Canvas
      flat
      dpr={dpr}
      frameloop="demand"
      camera={{ near: 0.1, far: FAR, fov: 40 }}
      gl={{ antialias: !coarsePointer || dpr < 1.5, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        // Checking each shader for errors asks the driver for its link status, which blocks the
        // main thread until compilation ends. Development builds keep the check.
        gl.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          onContextLost();
        });
      }}
      aria-hidden="true"
    >
      <PerformanceMonitor
        onDecline={() => setDpr((value) => Math.max(1, value - 0.25))}
        onIncline={() => setDpr((value) => Math.min(maxDpr, value + 0.25))}
      />
      <Suspense fallback={null}>
        <BronzeEnvironment />
        <JourneyCourt onReady={() => setCourtReady(true)} monumentIndex={INDEX.monument} contactIndex={INDEX.contact} />
      </Suspense>
      {loadFlowDesk ? (
        <Suspense fallback={null}>
          <JourneyFlowDesk onReady={() => undefined} index={INDEX.flowdesk} />
        </Suspense>
      ) : null}

      {near(INDEX.ledgermind) ? <LedgerMindScene index={INDEX.ledgermind} labels={active === INDEX.ledgermind} /> : null}
      {near(INDEX.accra) ? <AccraScene index={INDEX.accra} labels={active === INDEX.accra} dense={!coarsePointer} /> : null}
      {near(INDEX.joydatabundle) ? <NetworkScene index={INDEX.joydatabundle} labels={active === INDEX.joydatabundle} /> : null}
      {near(INDEX.about) ? <AboutScene index={INDEX.about} /> : null}
      {near(INDEX.skills) ? <SkillsScene index={INDEX.skills} labels={active === INDEX.skills} /> : null}

      <JourneyRig reducedMotion={reducedMotion} onVeil={onVeil} />
    </Canvas>
  );
}
