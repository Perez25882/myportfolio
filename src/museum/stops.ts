/**
 * Guided-tour stops. Poses are authored in Blender coordinates (metres, +Y
 * north, Z up), the same space as the review cameras in
 * blender/scripts/review.py, and converted to three.js (Y up) at runtime.
 */

export type Vec3 = readonly [number, number, number];

export type StopId = "court" | "monument" | "threshold" | "hall" | "conversation" | "order" | "beneath";

export type Room = "court" | "flowdesk";

interface AuthoredPose {
  readonly position: Vec3;
  readonly target: Vec3;
  /** Vertical field of view in degrees. */
  readonly fov: number;
}

export type Pose = AuthoredPose;

export interface Stop {
  readonly id: StopId;
  readonly room: Room;
  readonly title: string;
  readonly caption: string;
  readonly landscape: AuthoredPose;
  readonly portrait: AuthoredPose;
}

/** Blender (x, y, z) with Z up → three.js (x, y, z) with Y up. */
export function toThree([x, y, z]: Vec3): Vec3 {
  return [x, z, -y];
}

export const STOPS: readonly Stop[] = [
  {
    id: "court",
    room: "court",
    title: "The Court",
    caption:
      "A courtyard museum of real projects. FlowDesk, the first wing, waits on the far side, between the two timber screens.",
    landscape: { position: [6.0, -21.0, 3.6], target: [-0.6, 18.0, 5.0], fov: 46 },
    // Lowered target: the F2 review showed the portrait frame was half sky.
    portrait: { position: [4.2, -16.8, 3.6], target: [-0.4, 18.0, 4.6], fov: 72 },
  },
  {
    id: "monument",
    room: "court",
    title: "The Code Monument",
    caption:
      "Three cast-bronze characters: the symbol that wraps every piece of code. Look beneath, and the casts part along their seams to show the steel inside.",
    landscape: { position: [8.5, -9.5, 2.2], target: [0.3, 0.0, 2.7], fov: 42 },
    portrait: { position: [4.6, -14.0, 2.0], target: [0.5, 0.0, 3.0], fov: 70 },
  },
  {
    id: "threshold",
    room: "court",
    title: "FlowDesk · The Conversation Engine",
    caption:
      "Many shops in Ghana sell over WhatsApp. FlowDesk turns those chats into tracked orders and confirmed payments.",
    landscape: { position: [3.0, 7.2, 1.7], target: [0.0, 26.0, 4.0], fov: 50 },
    portrait: { position: [2.4, 6.0, 1.7], target: [0.0, 26.0, 6.0], fov: 75 },
  },
  {
    id: "hall",
    room: "flowdesk",
    title: "Customer · System · Shop",
    caption:
      "One order's journey: from the customer's phone wall by the entrance, down FlowDesk's pipeline, to the shop owner's board at the far end.",
    // Just inside the south wall, raised, looking down the pipeline to the owner board (right).
    // The phone wall is beside the entrance, behind-left of this view; the next stop turns to it.
    landscape: { position: [1.2, 31.2, 3.4], target: [0.2, 50.0, 1.6], fov: 55 },
    portrait: { position: [1.2, 31.2, 3.4], target: [0.4, 50.0, 2.0], fov: 80 },
  },
  {
    id: "conversation",
    room: "flowdesk",
    title: "Play the customer",
    caption: "Send the customer's messages and watch what FlowDesk does with each one.",
    // Square-on to the customer's phone wall (west wall), so its messages can be read.
    landscape: { position: [-1.2, 33.4, 2.4], target: [-7.05, 33.95, 2.7], fov: 44 },
    portrait: { position: [0.4, 33.6, 2.4], target: [-7.05, 33.95, 2.7], fov: 70 },
  },
  {
    id: "order",
    room: "flowdesk",
    title: "The owner's view",
    caption: "The conversation is now a structured order on the shop owner's board, with the payment still unconfirmed.",
    // Facing the owner dashboard (east wall), wide enough to keep the counter where the order lands.
    landscape: { position: [0.0, 52.5, 2.6], target: [6.0, 54.3, 1.9], fov: 52 },
    portrait: { position: [-2.5, 52.8, 2.8], target: [6.0, 54.2, 1.9], fov: 72 },
  },
  {
    id: "beneath",
    room: "flowdesk",
    title: "Look beneath the surface",
    caption: "The pipeline table's lid lifts: seven layers handled that conversation, from the message arriving to the order on the shop's board.",
    // Over the pipeline table, looking down the stations into the opened pit.
    landscape: { position: [3.6, 40.6, 2.9], target: [0.0, 46.0, 0.8], fov: 50 },
    portrait: { position: [3.0, 39.8, 3.3], target: [0.0, 46.0, 0.9], fov: 72 },
  },
];

/** The pose for a viewport: portrait compositions below an aspect ratio of 1. */
export function poseFor(stop: Stop, aspect: number): Pose {
  const authored = aspect >= 1 ? stop.landscape : stop.portrait;
  return { position: toThree(authored.position), target: toThree(authored.target), fov: authored.fov };
}

export function stopIndexOf(id: string): number {
  return STOPS.findIndex((stop) => stop.id === id);
}

/** Neighbouring stops are flown between; anything further is a cut, so the camera never passes through walls. */
export function isFlight(from: number, to: number): boolean {
  return Math.abs(from - to) === 1;
}
