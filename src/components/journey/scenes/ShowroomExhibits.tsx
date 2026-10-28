"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, Object3D, Vector3, type InstancedMesh, type Mesh, type MeshBasicMaterial } from "three";
import { smoothstep } from "@/journey/camera";
import { progressIn, span, view } from "@/journey/state";
import { toThree, type Vec3 } from "@/museum/stops";
import { CITY, LEDGERMIND, NETWORK, cityCell, networkPoint, resellerAngle } from "./showroomLayout";
import { Label, TONE } from "./kit";

/**
 * The project showroom's moving parts, driven by scroll. The LedgerMind exhibit's parts come from
 * the baked showroom (SR_lm_*); the Accra city's players and server ticks, and the JoyDataBundle
 * network's orders and payouts, are drawn here over the baked models.
 */

export interface ShowroomChapters {
  readonly ledgermind: number;
  readonly accra: number;
  readonly joydatabundle: number;
}

const three = (point: Vec3) => new Vector3(...toThree(point));

// ---------------------------------------------------------------- LedgerMind OS

// Chapter progress at which each sale appears, leaves the counter and reaches the server.
const SALES = [
  { appear: 0.05, depart: 0.1, arrive: 0.2 },
  { appear: 0.32, depart: 0.58, arrive: 0.64 },
  { appear: 0.38, depart: 0.62, arrive: 0.68 },
  { appear: 0.44, depart: 0.66, arrive: 0.72 },
] as const;
const RESEND = { depart: 0.69, arrive: 0.76 }; // the third sale, sent again after a timeout
const OTHER_BRANCH_SALE = 0.5; // in this illustration another branch sells one while this shop is offline
const COUNTER_TAKES_SERVER = [0.8, 0.88] as const;
const STOCK_STEP = 0.2;
const ONLINE = { link: new Color(TONE.bronze), screen: new Color(TONE.online) };
const OFFLINE = { link: new Color("#3a3733"), screen: new Color(TONE.offline) };

interface LedgerMindParts {
  readonly tokens: (Object3D | null)[];
  readonly counterBar: Object3D | null;
  readonly serverBar: Object3D | null;
  readonly link: MeshBasicMaterial | null;
  readonly screen: MeshBasicMaterial | null;
  readonly rest: Vector3[];
}

function findLedgerMind(scene: Object3D): LedgerMindParts {
  const named = (name: string) => scene.getObjectByName(name) ?? null;
  const tokens = [0, 1, 2, 3].map((i) => named(`SR_lm_token_${i}`));
  const material = (name: string) => ((named(name) as Mesh | null)?.material as MeshBasicMaterial | undefined) ?? null;
  return {
    tokens,
    counterBar: named("SR_lm_bar_counter"),
    serverBar: named("SR_lm_bar_server"),
    link: material("SR_lm_link"),
    screen: material("SR_lm_screen"),
    rest: tokens.map((token) => token?.position.clone() ?? new Vector3()),
  };
}

const LINK_FROM = three(LEDGERMIND.linkFrom);
const LINK_TO = three(LEDGERMIND.linkTo);

/** Up from the tray (or the till, for the online sale) to the connection, then along it. */
function saleAt(out: Vector3, start: Vector3, travelled: number): Vector3 {
  if (travelled < 0.2) return out.lerpVectors(start, LINK_FROM, travelled / 0.2);
  return out.lerpVectors(LINK_FROM, LINK_TO, (travelled - 0.2) / 0.8);
}

function useLedgerMind(scene: Object3D, index: number) {
  const parts = useMemo(() => findLedgerMind(scene), [scene]);
  const scratch = useMemo(() => ({ v: new Vector3(), colour: new Color() }), []);
  const status = useRef<HTMLSpanElement>(null);

  useFrame(() => {
    const p = progressIn(view.s, index);
    const offline = span(p, 0.24, 0.3) * (1 - span(p, 0.54, 0.58));
    parts.link?.color.copy(ONLINE.link).lerp(OFFLINE.link, offline);
    parts.screen?.color.copy(ONLINE.screen).lerp(OFFLINE.screen, offline);

    let serverSold = p >= OTHER_BRANCH_SALE ? 1 : 0;
    let counterSold = 0;
    SALES.forEach((sale, slot) => {
      if (p >= sale.appear) counterSold += 1;
      if (p >= sale.arrive) serverSold += 1;
      const token = parts.tokens[slot];
      if (!token) return;
      const shown = p >= sale.appear && p < sale.arrive + 0.02;
      token.scale.setScalar(shown ? Math.max(0.001, span(p, sale.appear, sale.appear + 0.03)) : 0.001);
      const travelled = span(p, sale.depart, sale.arrive);
      token.position.copy(travelled === 0 ? parts.rest[slot] : saleAt(scratch.v, parts.rest[slot], travelled));
    });
    // The resent copy of the third sale travels as a second token behind it, then merges into it.
    const resend = parts.tokens[3];
    const resendTravel = span(p, RESEND.depart, RESEND.arrive);
    if (resend && resendTravel > 0 && resendTravel < 1 && p >= SALES[3].arrive) {
      resend.scale.setScalar(1);
      resend.position.copy(saleAt(scratch.v, parts.rest[3], resendTravel));
    }

    const server = 1 - (serverSold * STOCK_STEP) / LEDGERMIND.stockFull;
    const counterOwn = 1 - (counterSold * STOCK_STEP) / LEDGERMIND.stockFull;
    const counter = counterOwn + (server - counterOwn) * span(p, ...COUNTER_TAKES_SERVER);
    parts.serverBar?.scale.set(1, server, 1);
    parts.counterBar?.scale.set(1, counter, 1);

    if (status.current) {
      const text = p < 0.24 ? "Online" : p < 0.56 ? "Offline: sales wait on the till" : p < 0.78 ? "Back online: sending the queue" : "Synced";
      if (status.current.textContent !== text) status.current.textContent = text;
    }
  });

  return status;
}

// ---------------------------------------------------------------- Accra We Dey

const PLAYERS = 26;
const RINGS = 3;
const RING_REACH = 4.4; // metres across the model
const STREET_COLS = Array.from({ length: CITY.cols }, (_, col) => col).filter((col) => col % CITY.roadEvery === CITY.roadOffset);

function CityLife({ index }: { readonly index: number }) {
  const players = useRef<InstancedMesh>(null);
  const rings = useRef<(Mesh | null)[]>([]);
  const dummy = useMemo(() => new Object3D(), []);
  const walkers = useMemo(
    () =>
      Array.from({ length: PLAYERS }, (_, i) => ({
        x: cityCell(STREET_COLS[i % STREET_COLS.length], 0)[0] + (i % 2 ? 0.06 : -0.06),
        phase: (i * 0.618) % 1,
        pace: 0.6 + ((i * 0.37) % 0.9),
        direction: i % 3 === 0 ? -1 : 1,
      })),
    [],
  );
  const [towerX, towerY] = cityCell(...CITY.tickTower);
  const south = CITY.y0;
  const north = CITY.y0 + (CITY.rows - 1) * CITY.pitch;

  useFrame(() => {
    const p = progressIn(view.s, index);
    const mesh = players.current;
    if (mesh) {
      walkers.forEach((walker, i) => {
        const along = (((walker.phase + p * walker.pace * walker.direction) % 1) + 1) % 1;
        dummy.position.set(...toThree([walker.x, south + along * (north - south), CITY.top + 0.05]));
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
    rings.current.forEach((ring, k) => {
      if (!ring) return;
      const phase = (p * 4 + k / RINGS) % 1;
      ring.scale.setScalar(0.2 + phase * RING_REACH);
      (ring.material as MeshBasicMaterial).opacity = 0.6 * (1 - phase);
    });
  });

  return (
    <>
      <instancedMesh ref={players} args={[undefined, undefined, PLAYERS]}>
        <sphereGeometry args={[0.055, 8, 6]} />
        <meshBasicMaterial color={TONE.charcoal} />
      </instancedMesh>
      {Array.from({ length: RINGS }, (_, k) => (
        <mesh
          key={k}
          ref={(node) => {
            rings.current[k] = node;
          }}
          position={toThree([towerX, towerY, CITY.top + 0.02 + k * 0.002]) as unknown as [number, number, number]}
          rotation-x={-Math.PI / 2}
        >
          <ringGeometry args={[0.94, 1, 64]} />
          <meshBasicMaterial color={TONE.lateriteDeep} transparent opacity={0.5} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

// ---------------------------------------------------------------- JoyDataBundle

const ORDERS_START = 0.08;
const ORDERS_SPREAD = 0.3;
const ORDER_TRAVEL = 0.14;
const PAYOUT_TO_ADMIN = [0.54, 0.62] as const;
const REVIEWED_AT = 0.72; // payouts leave the admin desk once each has been confirmed
const PAYOUT_TRAVEL = 0.12;
const PACKET_Z = NETWORK.daisTop + 0.55;

function along(out: Vector3, points: readonly Vector3[], t: number): Vector3 {
  const legs = points.length - 1;
  const leg = Math.min(legs - 1, Math.floor(t * legs));
  return out.lerpVectors(points[leg], points[leg + 1], t * legs - leg);
}

function NetworkFlow({ index }: { readonly index: number }) {
  const orders = useRef<InstancedMesh>(null);
  const payouts = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const routes = useMemo(() => {
    const hub = three([NETWORK.centre[0], NETWORK.centre[1], PACKET_Z + 0.3]);
    const admin = three(NETWORK.adminDesk);
    const orderRoutes: Vector3[][] = [];
    const payoutRoutes: Vector3[][] = [];
    for (let i = 0; i < NETWORK.resellers; i += 1) {
      const angle = resellerAngle(i);
      const reseller = three(networkPoint(NETWORK.resellerRadius, angle, PACKET_Z + 0.2));
      for (let k = 0; k < 3; k += 1) orderRoutes.push([three(networkPoint(NETWORK.customerRadius, angle + (k - 1) * 0.2, PACKET_Z)), reseller, hub]);
      payoutRoutes.push([hub, admin, reseller]);
    }
    return { orderRoutes, payoutRoutes };
  }, []);

  useFrame(() => {
    const p = progressIn(view.s, index);
    const orderMesh = orders.current;
    if (orderMesh) {
      routes.orderRoutes.forEach((route, j) => {
        const start = ORDERS_START + (j / routes.orderRoutes.length) * ORDERS_SPREAD;
        const t = span(p, start, start + ORDER_TRAVEL);
        along(dummy.position, route, t);
        dummy.scale.setScalar(t > 0 && t < 1 ? 1 : 0);
        dummy.updateMatrix();
        orderMesh.setMatrixAt(j, dummy.matrix);
      });
      orderMesh.instanceMatrix.needsUpdate = true;
    }
    const payoutMesh = payouts.current;
    if (payoutMesh) {
      routes.payoutRoutes.forEach((route, i) => {
        // Hub to the admin desk, a pause while each payout is reviewed, then out to its reseller.
        const toDesk = smoothstep(span(p, PAYOUT_TO_ADMIN[0], PAYOUT_TO_ADMIN[1]));
        const leave = REVIEWED_AT + i * 0.02;
        const out = span(p, leave, leave + PAYOUT_TRAVEL);
        along(dummy.position, route, out > 0 ? 0.5 + out / 2 : toDesk / 2);
        if (out === 0) dummy.position.x += (i - (NETWORK.resellers - 1) / 2) * 0.16 * toDesk;
        dummy.scale.setScalar(toDesk > 0 && out < 1 ? 1 : 0);
        dummy.updateMatrix();
        payoutMesh.setMatrixAt(i, dummy.matrix);
      });
      payoutMesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={orders} args={[undefined, undefined, NETWORK.resellers * 3]}>
        <boxGeometry args={[0.16, 0.16, 0.16]} />
        <meshBasicMaterial color="#a9e6ee" />
      </instancedMesh>
      <instancedMesh ref={payouts} args={[undefined, undefined, NETWORK.resellers]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshBasicMaterial color="#e2b866" />
      </instancedMesh>
    </>
  );
}

// ---------------------------------------------------------------- All three bays

const at = (point: Vec3) => toThree(point) as unknown as [number, number, number];

export function ShowroomExhibits({ scene, chapters, active }: { readonly scene: Object3D; readonly chapters: ShowroomChapters; readonly active: number }) {
  const status = useLedgerMind(scene, chapters.ledgermind);
  const near = (index: number) => Math.abs(active - index) <= 1;
  const [towerX, towerY] = cityCell(...CITY.tickTower);
  const north = (angle: number, radius: number, z: number) => at(networkPoint(radius, angle, z));

  return (
    <>
      {near(chapters.accra) ? <CityLife index={chapters.accra} /> : null}
      {near(chapters.joydatabundle) ? <NetworkFlow index={chapters.joydatabundle} /> : null}

      {active === chapters.ledgermind ? (
        <>
          <Label position={at([-3.4, 63.5, 2.45])} labelRef={status}>
            Online
          </Label>
          <Label position={at([-2.6, 63.1, 0.75])}>Queue on the till</Label>
          <Label position={at([-1.6, 63.1, 2.6])}>Counter stock</Label>
          <Label position={at([4.2, 67.5, 4.2])}>Server</Label>
          <Label position={at([4.2, 66.2, 0.35])}>Server stock</Label>
        </>
      ) : null}
      {active === chapters.accra ? (
        <>
          <Label position={at([towerX, towerY, CITY.top + 1.55])}>Game server: the world moves in ticks</Label>
          <Label position={at([...cityCell(...CITY.venues[0]), CITY.top + 0.85])}>Venue</Label>
          <Label position={at([0, 81.0, CITY.top + 0.25])}>An Accra-inspired illustration, not the game&apos;s map</Label>
        </>
      ) : null}
      {active === chapters.joydatabundle ? (
        <>
          <Label position={at([NETWORK.centre[0], NETWORK.centre[1], 1.45])}>Backend, built by a teammate</Label>
          <Label position={at([0, 105.6, 1.4])}>Admin payout review: Perez</Label>
          <Label position={north(resellerAngle(1), NETWORK.resellerRadius, 1.3)}>Reseller</Label>
          <Label position={north(resellerAngle(4), NETWORK.customerRadius, 0.95)}>Customers</Label>
          <Label position={north(-Math.PI / 2, NETWORK.frontendRadius, 0.45)}>Frontend: Perez</Label>
        </>
      ) : null}
    </>
  );
}
