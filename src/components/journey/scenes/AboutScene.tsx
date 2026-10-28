"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, Euler, Object3D, Quaternion, Vector3, type InstancedMesh, type Mesh } from "three";
import { smoothstep } from "@/journey/camera";
import { progressIn, span, view } from "@/journey/state";
import { CodeWorld, Floor, TONE, seeded } from "./kit";

/**
 * About: "Curiosity made me explore. Ambition made me build." Loose pieces lie scattered around
 * the court (exploring), then, as the visitor scrolls, they settle one level at a time into a
 * lattice tower (building). No spinning: each piece turns once, to its place, and stays.
 */

const LEVELS = 11;
const PITCH = 0.72;
const SIZE = 0.6;
const ASSEMBLE_FROM = 0.3;
const LEVEL_DELAY = 0.035;
const LEVEL_TIME = 0.14;

interface Piece {
  readonly home: Vector3;
  readonly scattered: Vector3;
  readonly turned: Quaternion;
  readonly level: number;
  readonly colour: string;
}

function layPieces(): Piece[] {
  const random = seeded(2026);
  const pieces: Piece[] = [];
  for (let level = 0; level < LEVELS; level += 1) {
    for (let gx = -1; gx <= 1; gx += 1) {
      for (let gz = -1; gz <= 1; gz += 1) {
        const corner = gx !== 0 && gz !== 0;
        const edge = !corner && (gx !== 0 || gz !== 0);
        // Corners rise the full height; the mid-edges alternate, which makes it a lattice.
        if (!corner && !(edge && level % 2 === 0)) continue;
        const angle = random() * Math.PI * 2;
        const radius = 4 + random() * 7;
        const roll = random();
        pieces.push({
          home: new Vector3(gx * PITCH, 0.3 + SIZE / 2 + level * PITCH, gz * PITCH),
          scattered: new Vector3(Math.cos(angle) * radius, 0.3 + random() * 6.5, Math.sin(angle) * radius * 0.7),
          turned: new Quaternion().setFromEuler(new Euler(random() * 3, random() * 3, random() * 3)),
          level,
          colour: roll > 0.86 ? TONE.bronze : roll > 0.74 ? TONE.laterite : TONE.plaster,
        });
      }
    }
  }
  return pieces;
}

const IDENTITY = new Quaternion();

export function AboutScene({ index }: { readonly index: number }) {
  const pieces = useMemo(() => layPieces(), []);
  const mesh = useRef<InstancedMesh>(null);
  const cap = useRef<Mesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    const instances = mesh.current;
    if (!instances) return;
    const colour = new Color();
    pieces.forEach((piece, i) => instances.setColorAt(i, colour.set(piece.colour)));
    if (instances.instanceColor) instances.instanceColor.needsUpdate = true;
  }, [pieces]);

  useFrame(() => {
    const p = progressIn(view.s, index);
    const instances = mesh.current;
    if (!instances) return;
    pieces.forEach((piece, i) => {
      const start = ASSEMBLE_FROM + piece.level * LEVEL_DELAY;
      const settled = smoothstep(span(p, start, start + LEVEL_TIME));
      // While scattered, each piece drifts a little with scroll: found, turned over, looked at.
      const drift = (1 - settled) * 0.35 * Math.sin(i * 1.7 + p * 4);
      dummy.position.lerpVectors(piece.scattered, piece.home, settled).y += drift;
      dummy.quaternion.slerpQuaternions(piece.turned, IDENTITY, settled);
      dummy.scale.setScalar(SIZE);
      dummy.updateMatrix();
      instances.setMatrixAt(i, dummy.matrix);
    });
    instances.instanceMatrix.needsUpdate = true;
    if (cap.current) cap.current.scale.setScalar(Math.max(0.001, smoothstep(span(p, 0.8, 0.9))));
  });

  return (
    <CodeWorld world="about">
      <Floor color="#24211f" />
      <mesh position-y={0.15}>
        <boxGeometry args={[3.6, 0.3, 3.6]} />
        <meshLambertMaterial color={TONE.basalt} />
      </mesh>
      <instancedMesh ref={mesh} args={[undefined, undefined, pieces.length]}>
        <boxGeometry />
        <meshLambertMaterial />
      </instancedMesh>
      <mesh ref={cap} position-y={0.3 + LEVELS * PITCH + 0.12}>
        <boxGeometry args={[2.3, 0.16, 2.3]} />
        <meshLambertMaterial color={TONE.bronze} />
      </mesh>
    </CodeWorld>
  );
}
