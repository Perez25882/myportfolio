"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useEffectEvent, useMemo, useRef } from "react";
import { Color, MeshBasicMaterial, type Object3D } from "three";
import { COURT_URL, FLOWDESK_URL, restPosition, useBakedScene, useCompiledScene } from "@/components/three/baked";
import { smoothstep } from "@/journey/camera";
import { progressIn, span, view } from "@/journey/state";

/**
 * The two Blender rooms on the journey: the Court (with the Code Monument) and FlowDesk. Their
 * moving parts follow scroll instead of tour stops.
 */

const SEAM_OPENING = 0.35; // metres each cast half moves along the seam, as in the tour
const DUSK_TINT = new Color("#b0806a");
const WHITE = new Color("#ffffff");

interface RoomProps {
  readonly onReady: () => void;
}

export function JourneyCourt({ onReady, monumentIndex, contactIndex }: RoomProps & { readonly monumentIndex: number; readonly contactIndex: number }) {
  const scene = useBakedScene(COURT_URL);
  const compiled = useCompiledScene(scene);
  const announceReady = useEffectEvent(onReady);
  useEffect(() => {
    if (compiled) announceReady();
  }, [compiled]);

  const { halves, baked } = useMemo(() => {
    const found: { node: Object3D; direction: number }[] = [];
    const materials: MeshBasicMaterial[] = [];
    scene.traverse((node) => {
      if (node.name.startsWith("CT_monument_")) found.push({ node, direction: node.name.includes("_front") ? 1 : -1 });
      const material = (node as Object3D & { material?: unknown }).material;
      if (material instanceof MeshBasicMaterial) materials.push(material);
    });
    return { halves: found, baked: materials };
  }, [scene]);
  const lastDusk = useRef(-1);

  useFrame(() => {
    const monument = progressIn(view.s, monumentIndex);
    // The casts part as the camera comes in close, and close again once it has passed over.
    const open = smoothstep(span(monument, 0.3, 0.55)) * (1 - smoothstep(span(monument, 0.86, 1)));
    for (const { node, direction } of halves) {
      node.position.setZ(restPosition(node).z + direction * SEAM_OPENING * open);
      node.updateMatrix();
    }

    // The finale: the baked daylight warms and dims towards dusk.
    const dusk = Math.round(smoothstep(span(progressIn(view.s, contactIndex), 0, 0.7)) * 100) / 100;
    if (dusk !== lastDusk.current) {
      for (const material of baked) material.color.copy(WHITE).lerp(DUSK_TINT, dusk);
      lastDusk.current = dusk;
    }
  });

  return <primitive object={scene} visible={compiled} />;
}

const STATION_PITCH = 1.3; // metres between pipeline stations, as in the tour
const GATE_DROP = -0.78;
const LID_LIFT = 1.1;

export function JourneyFlowDesk({ onReady, index }: RoomProps & { readonly index: number }) {
  const scene = useBakedScene(FLOWDESK_URL);
  const compiled = useCompiledScene(scene);
  const announceReady = useEffectEvent(onReady);
  useEffect(() => {
    if (compiled) announceReady();
  }, [compiled]);

  const parts = useMemo(() => {
    const find = (prefix: string) => {
      let found: Object3D | null = null;
      scene.traverse((node) => {
        if (!found && node.name.startsWith(prefix)) found = node;
      });
      return found as Object3D | null;
    };
    return { lid: find("FD_pipeline_lid"), gate: find("FD_floor_gate"), slip: find("FD_order_slip"), slab: find("FD_order_slab") };
  }, [scene]);

  useFrame(() => {
    const p = progressIn(view.s, index);
    const { lid, gate, slip, slab } = parts;
    // The order's journey down the table: understood (station 3), stopped at the price floor
    // while the gate rises (4), then recorded (6) and placed on the owner's counter.
    const station = 3 * span(p, 0.46, 0.56) + span(p, 0.56, 0.6) + 2 * span(p, 0.72, 0.84);
    if (slip) {
      slip.position.setZ(restPosition(slip).z - station * STATION_PITCH);
      slip.updateMatrix();
    }
    if (gate) {
      gate.position.setY(restPosition(gate).y + GATE_DROP * (1 - span(p, 0.55, 0.6)));
      gate.updateMatrix();
    }
    if (lid) {
      // Lifted while the camera looks into the pipeline, so its seven layers show.
      lid.position.setY(restPosition(lid).y + LID_LIFT * smoothstep(span(p, 0.58, 0.68)) * (1 - smoothstep(span(p, 0.8, 0.88))));
      lid.updateMatrix();
    }
    // Shown on the owner's counter once recorded (scaled, as visibility is not settable by method).
    slab?.scale.setScalar(p >= 0.84 ? 1 : 0.0001);
  });

  return <primitive object={scene} visible={compiled} />;
}
