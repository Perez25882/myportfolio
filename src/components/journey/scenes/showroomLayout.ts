import type { Vec3 } from "@/museum/stops";

/**
 * Where the project showroom's exhibits stand, in Blender coordinates (metres, +Y north, Z up).
 * Mirrors the constants in blender/scripts/rooms/showroom.py: change both together.
 */

export const LEDGERMIND = {
  pos: [-4.6, 63.45, 1.9] as Vec3, // where a sale leaves the till
  traySlots: [-3.0, -2.6, -2.2], // x of queue slots 1–3 (y 63.5, z 1.1)
  trayY: 63.5,
  trayZ: 1.1,
  linkFrom: [-4.6, 63.45, 2.6] as Vec3,
  linkTo: [4.2, 66.5, 3.3] as Vec3,
  stockFull: 2.4, // metres of bar at full stock
};

export const CITY = {
  top: 0.95,
  pitch: 0.42,
  cols: 24,
  rows: 21,
  x0: -((24 - 1) / 2) * 0.42,
  y0: 82.2,
  roadEvery: 5,
  roadOffset: 2,
  tickTower: [12, 12] as const,
  venues: [
    [4, 4],
    [19, 5],
    [9, 15],
    [15, 18],
  ] as const,
};

export function cityCell(col: number, row: number): [number, number] {
  return [CITY.x0 + col * CITY.pitch, CITY.y0 + row * CITY.pitch];
}

export const NETWORK = {
  centre: [0, 103.2] as const,
  daisTop: 0.25,
  resellers: 6,
  resellerRadius: 3.4,
  customerRadius: 5.3,
  frontendRadius: 4.4,
  adminDesk: [0, 105.6, 1.0] as Vec3,
};

/** A point on the JoyDataBundle dais at `radius` and `angle` (0 = north, clockwise). */
export function networkPoint(radius: number, angle: number, z: number): Vec3 {
  return [NETWORK.centre[0] + Math.sin(angle) * radius, NETWORK.centre[1] + Math.cos(angle) * radius, z];
}

export function resellerAngle(index: number): number {
  return (index / NETWORK.resellers) * Math.PI * 2 + Math.PI / NETWORK.resellers;
}
