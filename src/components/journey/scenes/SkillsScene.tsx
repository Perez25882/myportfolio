"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Object3D, type InstancedMesh } from "three";
import { progressIn, view } from "@/journey/state";
import { CodeWorld, Floor, Label, TONE } from "./kit";

/**
 * Skills as one system rather than a logo grid: web and mobile interfaces on top, the backend
 * beneath, data at the base, columns of architecture between them and a security ring around
 * the whole. Requests travel down through the layers and responses come back up, with scroll.
 * AI-assisted engineering stands beside the stack: a way of working, not a layer.
 */

const TIER_GAP = 1.4;
const SLAB = { width: 6, height: 0.5, depth: 3.4 } as const;
const BASE_Y = 0.35;
const PACKETS = 6;
const DOWN_X = -2.6;
const UP_X = -0.2;

const tierY = (tier: number) => BASE_Y + tier * TIER_GAP;

export function SkillsScene({ index, labels }: { readonly index: number; readonly labels: boolean }) {
  const packets = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const top = tierY(2) + SLAB.height / 2 + 0.15;
  const bottom = tierY(0) + SLAB.height / 2 + 0.15;

  useFrame(() => {
    const p = progressIn(view.s, index);
    const mesh = packets.current;
    if (!mesh) return;
    for (let k = 0; k < PACKETS; k += 1) {
      const cycle = (p * 3 + k / PACKETS) % 1;
      // First half: a request goes down; second half: the response comes back up.
      const down = cycle < 0.5;
      const t = down ? cycle * 2 : (cycle - 0.5) * 2;
      dummy.position.set(down ? DOWN_X : UP_X, down ? top + (bottom - top) * t : bottom + (top - bottom) * t, 1.85);
      dummy.updateMatrix();
      mesh.setMatrixAt(k, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  const posts: [number, number, number][] = [];
  for (const tier of [0, 1]) {
    for (const x of [-3.7, 1.7]) for (const z of [-1.4, 1.4]) posts.push([x, (tierY(tier) + tierY(tier + 1)) / 2, z]);
  }

  return (
    <CodeWorld world="skills">
      <Floor color="#282522" />
      <Slab y={tierY(0)} x={-1} width={SLAB.width} colour="#4d4741" />
      <Slab y={tierY(1)} x={-1} width={SLAB.width} colour={TONE.laterite} />
      <Slab y={tierY(2)} x={-2.05} width={3.9} colour={TONE.plaster} />
      <Slab y={tierY(2)} x={1.95} width={1.9} colour={TONE.plasterShade} />
      {posts.map((position) => (
        <mesh key={position.join(",")} position={position}>
          <boxGeometry args={[0.14, TIER_GAP - SLAB.height, 0.14]} />
          <meshLambertMaterial color={TONE.bronze} />
        </mesh>
      ))}

      {/* Security: around every layer. */}
      <mesh position={[-1, tierY(1), 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[4.4, 0.05, 8, 96]} />
        <meshLambertMaterial color={TONE.bronze} emissive={TONE.bronze} emissiveIntensity={0.25} />
      </mesh>

      {/* AI-assisted engineering: beside the stack. */}
      <mesh position={[5.6, 0.6, 0.8]}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshLambertMaterial color={TONE.tealLight} />
      </mesh>

      <instancedMesh ref={packets} args={[undefined, undefined, PACKETS]}>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshBasicMaterial color="#ffd9ae" />
      </instancedMesh>

      {labels ? (
        <>
          <Label position={[-2.05, tierY(2) + 0.75, 0]}>Web interfaces</Label>
          <Label position={[1.95, tierY(2) + 0.75, 0]}>Mobile</Label>
          <Label position={[-1, tierY(1) + 0.55, 1.9]}>Backend</Label>
          <Label position={[-1, tierY(0) + 0.55, 1.9]}>Databases</Label>
          <Label position={[1.7, tierY(0) + 0.95, 1.6]}>Architecture</Label>
          <Label position={[-5.4, tierY(1) + 0.35, 0]}>Security</Label>
          <Label position={[5.6, 1.7, 0.8]}>AI-assisted engineering</Label>
        </>
      ) : null}
    </CodeWorld>
  );
}

function Slab({ y, x, width, colour }: { readonly y: number; readonly x: number; readonly width: number; readonly colour: string }) {
  return (
    <mesh position={[x, y, 0]}>
      <boxGeometry args={[width, SLAB.height, SLAB.depth]} />
      <meshLambertMaterial color={colour} />
    </mesh>
  );
}
