"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, Matrix4, Quaternion, Vector3, type InstancedMesh, type Mesh, type MeshBasicMaterial } from "three";
import { progressIn, span, view } from "@/journey/state";
import { CodeWorld, Floor, Label, TONE } from "./kit";

/**
 * LedgerMind OS: one branch's counter and the server, joined by the connection. Scroll plays
 * the verified offline-first behaviour (features/sync, docs/SYNC_PROTOCOL.md): a sale goes
 * through; the connection drops and sales queue on the device; it returns and the queue syncs,
 * and a resent sale is recognised by its idempotency key; the counter then takes the server's
 * stock. The other branch's sale is part of the illustration, and the chapter text says so.
 */

const TRAY = new Vector3(-2.2, 1.22, 0.35);
const TRAY_PITCH = 0.4;
const BEAM_FROM = new Vector3(-3.6, 1.95, 0.4);
const BEAM_TO = new Vector3(4.2, 2.8, -0.5);
const OFFLINE_SKY = new Color("#121719");

// Chapter progress at which each sale appears, leaves the counter and reaches the server.
const SALES = [
  { appear: 0.05, depart: 0.1, arrive: 0.2, queued: false },
  { appear: 0.32, depart: 0.6, arrive: 0.66, queued: true },
  { appear: 0.38, depart: 0.64, arrive: 0.7, queued: true },
  { appear: 0.44, depart: 0.68, arrive: 0.74, queued: true },
] as const;
const RESEND = { depart: 0.71, arrive: 0.78 }; // the third sale, sent again after a timeout
const OTHER_BRANCH_SALE = 0.5;
const COUNTER_TAKES_SERVER = [0.82, 0.9] as const;

const STOCK_FULL = 2.4;
const STOCK_STEP = 0.2;

function trayPosition(out: Vector3, slot: number): Vector3 {
  return out.copy(TRAY).setX(TRAY.x + (slot - 2) * TRAY_PITCH);
}

/** Up from the tray (or the terminal, for the online sale) to the beam, then along it. */
function salePosition(out: Vector3, slot: number, travelled: number, start: Vector3): Vector3 {
  if (slot === 0) start.copy(BEAM_FROM);
  else trayPosition(start, slot);
  if (travelled < 0.2) return out.lerpVectors(start, BEAM_FROM, travelled / 0.2);
  return out.lerpVectors(BEAM_FROM, BEAM_TO, (travelled - 0.2) / 0.8);
}

export function LedgerMindScene({ index, labels }: { readonly index: number; readonly labels: boolean }) {
  const beam = useRef<Mesh>(null);
  const screen = useRef<MeshBasicMaterial>(null);
  const tokens = useRef<(Mesh | null)[]>([]);
  const resend = useRef<Mesh>(null);
  const serverBar = useRef<Mesh>(null);
  const counterBar = useRef<Mesh>(null);
  const status = useRef<HTMLSpanElement>(null);
  const scratch = useMemo(() => ({ start: new Vector3(), sky: new Color() }), []);

  // The beam is a thin box laid from the counter's terminal to the server.
  const beamPose = useMemo(() => {
    const direction = BEAM_TO.clone().sub(BEAM_FROM);
    const quaternion = new Quaternion().setFromUnitVectors(new Vector3(1, 0, 0), direction.clone().normalize());
    return { length: direction.length(), middle: BEAM_FROM.clone().add(BEAM_TO).multiplyScalar(0.5), quaternion };
  }, []);

  useFrame((state) => {
    const p = progressIn(view.s, index);
    const offline = span(p, 0.24, 0.3) * (1 - span(p, 0.56, 0.6));

    if (beam.current) {
      const material = beam.current.material as MeshBasicMaterial;
      material.opacity = 0.9 - offline * 0.82;
      material.color.set(offline > 0.5 ? TONE.basalt : TONE.bronze);
    }
    screen.current?.color.set(offline > 0.5 ? TONE.offline : TONE.online);
    // The room cools while the shop is cut off. The rig set this chapter's sky earlier in the frame.
    if (offline > 0 && state.scene.background instanceof Color) {
      state.scene.background = scratch.sky.copy(state.scene.background).lerp(OFFLINE_SKY, offline * 0.8);
    }

    let serverSold = p >= OTHER_BRANCH_SALE ? 1 : 0;
    let counterSold = 0;
    SALES.forEach((sale, slot) => {
      if (p >= sale.appear) counterSold += 1;
      if (p >= sale.arrive) serverSold += 1;
      const token = tokens.current[slot];
      if (!token) return;
      token.visible = p >= sale.appear && p < sale.arrive + 0.02;
      if (!token.visible) return;
      const travelled = span(p, sale.depart, sale.arrive);
      if (travelled === 0 && sale.queued) trayPosition(token.position, slot);
      else salePosition(token.position, slot, travelled, scratch.start);
      token.scale.setScalar(Math.max(0.001, span(p, sale.appear, sale.appear + 0.03)));
    });

    if (resend.current) {
      const travelled = span(p, RESEND.depart, RESEND.arrive);
      resend.current.visible = travelled > 0 && travelled < 1;
      if (resend.current.visible) salePosition(resend.current.position, 3, travelled, scratch.start);
    }

    const serverStock = STOCK_FULL - serverSold * STOCK_STEP;
    const counterOwn = STOCK_FULL - counterSold * STOCK_STEP;
    const counterStock = counterOwn + (serverStock - counterOwn) * span(p, ...COUNTER_TAKES_SERVER);
    setBar(serverBar.current, serverStock);
    setBar(counterBar.current, counterStock);

    if (status.current) {
      const text =
        p < 0.24 ? "Online" : p < 0.58 ? "Offline: sales wait on the device" : p < 0.8 ? "Back online: sending the queue" : "Synced";
      if (status.current.textContent !== text) status.current.textContent = text;
    }
  });

  return (
    <CodeWorld world="ledgermind">
      <Floor color="#222d29" />
      <mesh position={[-1, 0.06, 0]}>
        <boxGeometry args={[14, 0.12, 6]} />
        <meshLambertMaterial color="#33403b" />
      </mesh>

      {/* The branch: counter, shelves and terminal. */}
      <mesh position={[-3, 0.5, 0.4]}>
        <boxGeometry args={[3.4, 1, 1]} />
        <meshLambertMaterial color={TONE.lateriteDeep} />
      </mesh>
      <mesh position={[-3, 1.04, 0.4]}>
        <boxGeometry args={[3.6, 0.08, 1.15]} />
        <meshLambertMaterial color={TONE.plaster} />
      </mesh>
      <mesh position={[-3, 1.2, -1.8]}>
        <boxGeometry args={[4.2, 2.4, 0.5]} />
        <meshLambertMaterial color={TONE.plasterShade} />
      </mesh>
      {[0.65, 1.3, 1.95].map((y) => (
        <mesh key={y} position={[-3, y, -1.5]}>
          <boxGeometry args={[4, 0.06, 0.3]} />
          <meshLambertMaterial color={TONE.basalt} />
        </mesh>
      ))}
      <Goods />
      <mesh position={[-3.6, 1.24, 0.4]}>
        <boxGeometry args={[0.12, 0.32, 0.12]} />
        <meshLambertMaterial color={TONE.charcoal} />
      </mesh>
      <mesh position={[-3.6, 1.58, 0.42]} rotation-x={-0.25}>
        <boxGeometry args={[0.72, 0.46, 0.05]} />
        <meshBasicMaterial ref={screen} color={TONE.online} />
      </mesh>
      <mesh position={[TRAY.x, 1.11, TRAY.z]}>
        <boxGeometry args={[1.4, 0.06, 0.45]} />
        <meshLambertMaterial color={TONE.charcoal} />
      </mesh>
      <mesh ref={counterBar} position={[-4.45, 1.08, 0.75]} userData={{ base: 1.08 }}>
        <boxGeometry args={[0.14, 1, 0.14]} />
        <meshLambertMaterial color={TONE.bronze} />
      </mesh>

      {/* The server: the authority on stock. */}
      <mesh position={[5, 1.7, -0.5]}>
        <boxGeometry args={[1.6, 3.4, 1.6]} />
        <meshLambertMaterial color={TONE.plaster} />
      </mesh>
      <mesh position={[5, 3.1, -0.5]}>
        <boxGeometry args={[1.64, 0.1, 1.64]} />
        <meshLambertMaterial color={TONE.ledgermind} />
      </mesh>
      <mesh ref={serverBar} position={[4.55, 0.25, 0.32]} userData={{ base: 0.25 }}>
        <boxGeometry args={[0.2, 1, 0.06]} />
        <meshLambertMaterial color={TONE.bronze} />
      </mesh>

      <mesh ref={beam} position={beamPose.middle} quaternion={beamPose.quaternion}>
        <boxGeometry args={[beamPose.length, 0.035, 0.035]} />
        <meshBasicMaterial color={TONE.bronze} transparent opacity={0.9} />
      </mesh>

      {SALES.map((sale, slot) => (
        <mesh
          key={sale.appear}
          ref={(node) => {
            tokens.current[slot] = node;
          }}
          visible={false}
        >
          <boxGeometry args={[0.28, 0.12, 0.34]} />
          <meshLambertMaterial color={TONE.plaster} emissive={TONE.bronze} emissiveIntensity={0.35} />
        </mesh>
      ))}
      <mesh ref={resend} visible={false}>
        <boxGeometry args={[0.28, 0.12, 0.34]} />
        <meshBasicMaterial color={TONE.offline} transparent opacity={0.55} />
      </mesh>

      {labels ? (
        <>
          <Label position={[-3, 2.75, 0.4]} labelRef={status}>
            Online
          </Label>
          <Label position={[TRAY.x, 0.62, 1.1]}>Queue on the device</Label>
          <Label position={[-4.45, 0.3, 1.1]}>Counter stock</Label>
          <Label position={[5, 3.75, -0.5]}>Server</Label>
          <Label position={[4.55, -0.15, 1]}>Server stock</Label>
        </>
      ) : null}
    </CodeWorld>
  );
}

function setBar(bar: Mesh | null, height: number) {
  if (!bar) return;
  bar.scale.y = height;
  bar.position.y = (bar.userData.base as number) + height / 2;
}

const GOODS = 18;
const GOODS_COLOURS = [TONE.ochre, TONE.ledgermind, TONE.laterite, TONE.plaster, TONE.tealLight];

/** Stock on the shelves: one instanced mesh, coloured per item. */
function Goods() {
  const mesh = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const goods = mesh.current;
    if (!goods) return;
    const matrix = new Matrix4();
    const colour = new Color();
    for (let i = 0; i < GOODS; i += 1) {
      const shelf = Math.floor(i / 6);
      goods.setMatrixAt(i, matrix.makeTranslation(-4.55 + (i % 6) * 0.62, 0.86 + shelf * 0.65, -1.5));
      goods.setColorAt(i, colour.set(GOODS_COLOURS[(i * 7) % GOODS_COLOURS.length]));
    }
    goods.instanceMatrix.needsUpdate = true;
    if (goods.instanceColor) goods.instanceColor.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, GOODS]}>
      <boxGeometry args={[0.4, 0.34, 0.24]} />
      <meshLambertMaterial />
    </instancedMesh>
  );
}
