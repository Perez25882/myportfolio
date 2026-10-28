"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BufferGeometry, Float32BufferAttribute, Object3D, Vector3, type InstancedMesh } from "three";
import { progressIn, span, view } from "@/journey/state";
import { CodeWorld, Floor, Label, TONE } from "./kit";

/**
 * JoyDataBundle as a distribution network: customers buy from resellers, orders flow to the
 * backend, and payouts flow back to resellers through an admin review. Perez's part is shown
 * exactly as the record has it: the frontend, and the admin payout flow. The backend is a
 * teammate's and is drawn in a muted tone.
 */

const RESELLERS = 6;
const CUSTOMERS_EACH = 3;
const RESELLER_RADIUS = 7;
const CUSTOMER_RADIUS = 12;
const FRONTEND_RADIUS = 9.5;
const HUB = new Vector3(0, 1.2, 0);
const ADMIN = new Vector3(0, 1, -3.8);

const ORDERS_START = 0.08;
const ORDERS_SPREAD = 0.3;
const ORDER_TRAVEL = 0.14;
const PAYOUT_TO_ADMIN = [0.54, 0.62] as const;
const REVIEWED_AT = 0.72; // payouts leave the admin desk once each has been confirmed
const PAYOUT_TRAVEL = 0.12;

const resellerAt = (i: number, y = 0.45) => {
  const angle = (i / RESELLERS) * Math.PI * 2 + Math.PI / RESELLERS;
  return new Vector3(Math.sin(angle) * RESELLER_RADIUS, y, Math.cos(angle) * RESELLER_RADIUS);
};
const customerAt = (i: number, k: number) => {
  const angle = (i / RESELLERS) * Math.PI * 2 + Math.PI / RESELLERS + (k - 1) * 0.22;
  return new Vector3(Math.sin(angle) * CUSTOMER_RADIUS, 0.25, Math.cos(angle) * CUSTOMER_RADIUS);
};

/** Position at t (0–1) along a polyline, by equal shares per leg. */
function along(out: Vector3, points: readonly Vector3[], t: number): Vector3 {
  const legs = points.length - 1;
  const leg = Math.min(legs - 1, Math.floor(t * legs));
  return out.lerpVectors(points[leg], points[leg + 1], t * legs - leg);
}

export function NetworkScene({ index, labels }: { readonly index: number; readonly labels: boolean }) {
  const orders = useRef<InstancedMesh>(null);
  const payouts = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  const routes = useMemo(() => {
    const orderRoutes: Vector3[][] = [];
    for (let i = 0; i < RESELLERS; i += 1) {
      for (let k = 0; k < CUSTOMERS_EACH; k += 1) orderRoutes.push([customerAt(i, k).setY(0.6), resellerAt(i, 1), HUB.clone()]);
    }
    const payoutRoutes = Array.from({ length: RESELLERS }, (_, i) => [ADMIN.clone(), resellerAt(i, 1.1)]);
    return { orderRoutes, payoutRoutes };
  }, []);

  const edges = useMemo(() => {
    const points: number[] = [];
    const push = (a: Vector3, b: Vector3) => points.push(a.x, a.y, a.z, b.x, b.y, b.z);
    for (let i = 0; i < RESELLERS; i += 1) {
      push(resellerAt(i, 0.06), new Vector3(0, 0.06, 0));
      push(resellerAt(i, 0.06), ADMIN.clone().setY(0.06));
      for (let k = 0; k < CUSTOMERS_EACH; k += 1) push(customerAt(i, k).setY(0.06), resellerAt(i, 0.06));
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
    return geometry;
  }, []);

  useFrame(() => {
    const p = progressIn(view.s, index);
    const orderMesh = orders.current;
    if (orderMesh) {
      routes.orderRoutes.forEach((route, j) => {
        const start = ORDERS_START + (j / routes.orderRoutes.length) * ORDERS_SPREAD;
        const t = span(p, start, start + ORDER_TRAVEL);
        const moving = t > 0 && t < 1;
        along(dummy.position, route, t);
        dummy.scale.setScalar(moving ? 1 : 0);
        dummy.updateMatrix();
        orderMesh.setMatrixAt(j, dummy.matrix);
      });
      orderMesh.instanceMatrix.needsUpdate = true;
    }
    const payoutMesh = payouts.current;
    if (payoutMesh) {
      routes.payoutRoutes.forEach((route, i) => {
        const toAdmin = span(p, PAYOUT_TO_ADMIN[0], PAYOUT_TO_ADMIN[1]);
        const leave = REVIEWED_AT + i * 0.02;
        const out = span(p, leave, leave + PAYOUT_TRAVEL);
        if (out > 0) along(dummy.position, route, out);
        else dummy.position.lerpVectors(HUB, ADMIN, toAdmin).setX((i - (RESELLERS - 1) / 2) * 0.28 * toAdmin);
        dummy.scale.setScalar(toAdmin > 0 && out < 1 ? 1 : 0);
        dummy.updateMatrix();
        payoutMesh.setMatrixAt(i, dummy.matrix);
      });
      payoutMesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <CodeWorld world="network">
      <Floor color="#13323a" />
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#3d6f78" />
      </lineSegments>

      {/* Backend: a teammate's work, drawn muted. */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[1.5, 1.6, 1.2, 32]} />
        <meshLambertMaterial color="#5b6b6d" />
      </mesh>

      {/* The admin payout review: Perez's flow. */}
      <mesh position={[ADMIN.x, 0.45, ADMIN.z]}>
        <boxGeometry args={[1.8, 0.9, 1]} />
        <meshLambertMaterial color={TONE.bronze} />
      </mesh>

      {/* The frontend customers and resellers use: Perez's part. */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.05}>
        <ringGeometry args={[FRONTEND_RADIUS - 0.12, FRONTEND_RADIUS + 0.12, 96]} />
        <meshBasicMaterial color={TONE.teal} />
      </mesh>

      {Array.from({ length: RESELLERS }, (_, i) => (
        <mesh key={`reseller-${i}`} position={resellerAt(i)}>
          <boxGeometry args={[1.1, 0.9, 1.1]} />
          <meshLambertMaterial color={TONE.tealLight} />
        </mesh>
      ))}
      {Array.from({ length: RESELLERS * CUSTOMERS_EACH }, (_, j) => (
        <mesh key={`customer-${j}`} position={customerAt(Math.floor(j / CUSTOMERS_EACH), j % CUSTOMERS_EACH)}>
          <cylinderGeometry args={[0.3, 0.3, 0.5, 16]} />
          <meshLambertMaterial color={TONE.plaster} />
        </mesh>
      ))}

      <instancedMesh ref={orders} args={[undefined, undefined, RESELLERS * CUSTOMERS_EACH]}>
        <boxGeometry args={[0.26, 0.26, 0.26]} />
        <meshBasicMaterial color="#a9e6ee" />
      </instancedMesh>
      <instancedMesh ref={payouts} args={[undefined, undefined, RESELLERS]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshBasicMaterial color="#e2b866" />
      </instancedMesh>

      {labels ? (
        <>
          <Label position={[0, 2.2, 0.4]}>Backend, built by a teammate</Label>
          <Label position={[ADMIN.x, 1.7, ADMIN.z]}>Admin payout review: Perez</Label>
          <Label position={[resellerAt(0).x, 1.6, resellerAt(0).z]}>Reseller</Label>
          <Label position={[customerAt(1, 1).x, 1.2, customerAt(1, 1).z]}>Customers</Label>
          <Label position={[-FRONTEND_RADIUS, 0.8, 0]}>Frontend: Perez</Label>
        </>
      ) : null}
    </CodeWorld>
  );
}
