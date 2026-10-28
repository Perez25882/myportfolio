"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, Matrix4, Object3D, type InstancedMesh, type Mesh, type MeshBasicMaterial } from "three";
import { progressIn, view } from "@/journey/state";
import { CodeWorld, Floor, Label, TONE, seeded } from "./kit";

/**
 * Accra We Dey, told as a miniature city: an Accra-inspired illustration, not the game's own
 * map or art (the chapter text says so). Players move along the streets, venues stand in the
 * open squares, and the game server's ticks ripple out across the city. Everything moves with
 * scroll, never on a timer, so the scene costs nothing while the page is still.
 */

const PITCH = 1.7;
const SOUTH_EDGE = 8; // three.js +Z is south: the sea lies beyond
const ROAD_EVERY = 5;
const ROAD_OFFSET = 2;
const SERVER = [0, 0, -7] as const;
const RINGS = 3;
const RING_REACH = 17;
const BLOCK_COLOURS = [TONE.plaster, TONE.plasterShade, "#e6d6bd", TONE.laterite, TONE.ochre, "#d9c8ad"];

interface City {
  readonly cols: number;
  readonly rows: number;
  readonly blocks: readonly { x: number; z: number; height: number; colour: string }[];
  readonly squares: readonly { x: number; z: number }[];
  readonly streets: readonly number[]; // x of each north–south street
}

const colX = (col: number, cols: number) => (col - (cols - 1) / 2) * PITCH;
const rowZ = (row: number, rows: number) => SOUTH_EDGE - (rows - 1 - row) * PITCH;

function layCity(dense: boolean): City {
  const random = seeded(1957); // any fixed seed: the same city for everyone
  const cols = dense ? 21 : 15;
  const rows = dense ? 18 : 14;
  const blocks: { x: number; z: number; height: number; colour: string }[] = [];
  const squares: { x: number; z: number }[] = [];
  const streets: number[] = [];
  for (let col = 0; col < cols; col += 1) {
    if (col % ROAD_EVERY === ROAD_OFFSET) {
      streets.push(colX(col, cols));
      continue;
    }
    for (let row = 0; row < rows; row += 1) {
      if (row % ROAD_EVERY === ROAD_OFFSET) continue;
      const x = colX(col, cols);
      const z = rowZ(row, rows);
      const roll = random();
      if (roll < 0.035 && squares.length < 4 && Math.abs(x) > 3) {
        squares.push({ x, z });
        continue;
      }
      if (roll < 0.1) continue; // yards and open ground
      const tall = random() > 0.93 ? 1.5 : 0;
      blocks.push({ x, z, height: 0.35 + random() * 0.85 + tall, colour: BLOCK_COLOURS[Math.floor(random() * BLOCK_COLOURS.length)] });
    }
  }
  return { cols, rows, blocks, squares, streets };
}

interface AccraProps {
  readonly index: number;
  readonly labels: boolean;
  readonly dense: boolean;
}

export function AccraScene({ index, labels, dense }: AccraProps) {
  const city = useMemo(() => layCity(dense), [dense]);
  const playerCount = dense ? 30 : 18;
  const blocks = useRef<InstancedMesh>(null);
  const players = useRef<InstancedMesh>(null);
  const rings = useRef<(Mesh | null)[]>([]);
  const walkers = useMemo(() => {
    const random = seeded(233);
    const north = rowZ(0, city.rows);
    return Array.from({ length: playerCount }, () => ({
      street: city.streets[Math.floor(random() * city.streets.length)] + (random() > 0.5 ? 0.25 : -0.25),
      phase: random(),
      pace: 0.6 + random() * 0.9,
      direction: random() > 0.5 ? 1 : -1,
      north,
    }));
  }, [city, playerCount]);
  const dummy = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    const mesh = blocks.current;
    if (!mesh) return;
    const matrix = new Matrix4();
    const colour = new Color();
    city.blocks.forEach((block, i) => {
      matrix.makeScale(1.15, block.height, 1.15).setPosition(block.x, block.height / 2, block.z);
      mesh.setMatrixAt(i, matrix);
      mesh.setColorAt(i, colour.set(block.colour));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [city]);

  useFrame(() => {
    const p = progressIn(view.s, index);
    const mesh = players.current;
    if (mesh) {
      walkers.forEach((walker, i) => {
        const along = (((walker.phase + p * walker.pace * walker.direction) % 1) + 1) % 1;
        dummy.position.set(walker.street, 0.2, walker.north + along * (SOUTH_EDGE - walker.north));
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
    rings.current.forEach((ring, k) => {
      if (!ring) return;
      const phase = (p * 4 + k / RINGS) % 1;
      ring.scale.setScalar(0.5 + phase * RING_REACH);
      (ring.material as MeshBasicMaterial).opacity = 0.55 * (1 - phase);
    });
  });

  return (
    <CodeWorld world="accra">
      <Floor color="#dcc7a6" />
      {/* The Gulf of Guinea along the city's south edge. */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, SOUTH_EDGE + 1.6 + 40]}>
        <planeGeometry args={[180, 80]} />
        <meshBasicMaterial color="#7d9b95" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, SOUTH_EDGE + 1.1]}>
        <planeGeometry args={[180, 1]} />
        <meshBasicMaterial color="#efe2c9" />
      </mesh>

      <instancedMesh ref={blocks} args={[undefined, undefined, city.blocks.length]}>
        <boxGeometry />
        <meshLambertMaterial />
      </instancedMesh>

      <instancedMesh ref={players} args={[undefined, undefined, playerCount]}>
        <sphereGeometry args={[0.17, 10, 8]} />
        <meshLambertMaterial color={TONE.charcoal} />
      </instancedMesh>

      {city.squares.map((square) => (
        <group key={`${square.x},${square.z}`} position={[square.x, 0, square.z]}>
          <mesh rotation-x={-Math.PI / 2} position-y={0.04}>
            <circleGeometry args={[0.7, 24]} />
            <meshLambertMaterial color={TONE.plaster} />
          </mesh>
          <mesh position-y={1.1}>
            <cylinderGeometry args={[0.09, 0.09, 2.2, 8]} />
            <meshLambertMaterial color={TONE.bronze} />
          </mesh>
          <mesh position-y={2.25}>
            <sphereGeometry args={[0.22, 12, 10]} />
            <meshLambertMaterial color={TONE.bronze} emissive={TONE.bronze} emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}

      {/* The game server: the world advances in ticks. */}
      <mesh position={[SERVER[0], 2.25, SERVER[2]]}>
        <cylinderGeometry args={[0.45, 0.55, 4.5, 16]} />
        <meshLambertMaterial color={TONE.basalt} />
      </mesh>
      <mesh position={[SERVER[0], 4.6, SERVER[2]]}>
        <cylinderGeometry args={[0.5, 0.5, 0.2, 16]} />
        <meshLambertMaterial color={TONE.bronze} />
      </mesh>
      {Array.from({ length: RINGS }, (_, k) => (
        <mesh
          key={k}
          ref={(node) => {
            rings.current[k] = node;
          }}
          rotation-x={-Math.PI / 2}
          position={[SERVER[0], 0.06 + k * 0.002, SERVER[2]]}
        >
          <ringGeometry args={[0.94, 1, 64]} />
          <meshBasicMaterial color={TONE.lateriteDeep} transparent opacity={0.5} depthWrite={false} />
        </mesh>
      ))}

      {labels ? (
        <>
          <Label position={[SERVER[0], 5.4, SERVER[2]]}>Game server: the world moves in ticks</Label>
          {city.squares.slice(0, 2).map((square) => (
            <Label key={`${square.x},${square.z}`} position={[square.x, 2.9, square.z]}>
              Venue
            </Label>
          ))}
          <Label position={[city.streets[0] ?? 0, 0.9, 2]}>Players on the street</Label>
        </>
      ) : null}
    </CodeWorld>
  );
}
