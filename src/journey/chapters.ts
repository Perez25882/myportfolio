import type { Vec3 } from "@/museum/stops";

/**
 * The scroll journey on the home page: one continuous camera through ten chapters.
 * Camera keys are authored in Blender coordinates (metres, +Y north, Z up), like the tour stops,
 * and converted to three.js at runtime. Each key sits at a point (0–1) of its chapter's scroll.
 *
 * Worlds: the Court and the project showroom are Blender buildings around the origin; the camera
 * walks from one into the other and on through the showroom's four bays without a cut. About
 * and Skills are lightweight scenes built in code, placed far enough away that only one world is
 * ever on screen.
 */

export type ChapterId =
  | "opening"
  | "monument"
  | "flowdesk"
  | "ledgermind"
  | "accra"
  | "joydatabundle"
  | "about"
  | "skills"
  | "services"
  | "contact";

export type World = "court" | "showroom" | "about" | "skills";

export interface CameraKey {
  readonly at: number;
  readonly position: Vec3;
  readonly target: Vec3;
  /** Vertical field of view, degrees, for landscape screens. */
  readonly fov: number;
}

export interface Chapter {
  readonly id: ChapterId;
  /** Short label for the chapter rail. */
  readonly nav: string;
  readonly world: World;
  /** Scroll length in viewport heights. */
  readonly length: number;
  /** Background colour behind the scene. */
  readonly sky: string;
  readonly camera: readonly CameraKey[];
}

/** Blender-space origin of each world built in code. */
export const WORLD_ORIGIN: Record<World, Vec3> = {
  court: [0, 0, 0],
  showroom: [0, 0, 0],
  about: [1200, 0, 0],
  skills: [1500, 0, 0],
};

const SKY = "#a9c1d8";

const at = (world: World, [x, y, z]: Vec3): Vec3 => {
  const [ox, oy, oz] = WORLD_ORIGIN[world];
  return [ox + x, oy + y, oz + z];
};

const key = (world: World, atPoint: number, position: Vec3, target: Vec3, fov: number): CameraKey => ({
  at: atPoint,
  position: at(world, position),
  target: at(world, target),
  fov,
});

export const CHAPTERS: readonly Chapter[] = [
  {
    id: "opening",
    nav: "Start",
    world: "court",
    length: 1,
    sky: SKY,
    camera: [key("court", 0, [6, -21, 3.6], [-0.6, 18, 5], 40), key("court", 1, [4.8, -16.5, 3.2], [0, 0, 3.4], 42)],
  },
  {
    id: "monument",
    nav: "The monument",
    world: "court",
    length: 1.6,
    sky: SKY,
    camera: [
      key("court", 0, [4.8, -16.5, 3.2], [0, 0, 3.4], 42),
      key("court", 0.3, [5.5, -8, 2.4], [0.3, 0, 2.7], 42),
      // Low and close while the casts part: the steel cores show between the halves.
      key("court", 0.6, [3.2, -3.8, 1.7], [0.4, 0, 2.6], 52),
      // Rise beside it first, so the climb never crosses the 5.2 m crown.
      key("court", 0.72, [3.6, -3.2, 6.4], [0, 2, 3], 52),
      // Up and over (the sculpture stands 5.2 m with its plinth), already looking ahead to FlowDesk.
      key("court", 0.82, [0.5, 0.6, 7.5], [0, 22, 3.2], 55),
      key("court", 1, [0, 12, 3], [0, 28, 3.4], 55),
    ],
  },
  {
    id: "flowdesk",
    nav: "FlowDesk",
    world: "showroom",
    length: 2.4,
    sky: SKY,
    camera: [
      key("showroom", 0, [0, 12, 3], [0, 28, 3.4], 55),
      key("showroom", 0.2, [0.6, 27.5, 1.8], [0, 40, 2.4], 60),
      // The customer's phone wall, square-on.
      key("showroom", 0.38, [-1.2, 33.4, 2.4], [-7.05, 33.95, 2.7], 46),
      // Along the pipeline table, under the 3.6 m rail and clear of the table top.
      key("showroom", 0.56, [2.6, 38.6, 3], [0, 43.5, 0.9], 50),
      key("showroom", 0.7, [3.4, 44.5, 2.8], [0, 48.5, 0.9], 50),
      // The owner's board.
      key("showroom", 0.88, [0, 52.5, 2.6], [6, 54.3, 1.9], 52),
      key("showroom", 1, [0, 52.5, 2.6], [6, 54.3, 1.9], 52),
    ],
  },
  {
    id: "ledgermind",
    nav: "LedgerMind OS",
    world: "showroom",
    length: 2,
    sky: SKY,
    camera: [
      key("showroom", 0, [0, 52.5, 2.6], [6, 54.3, 1.9], 52),
      // Turn from the owner's board to the opening into the next bay (west of FlowDesk's shelves).
      key("showroom", 0.12, [-2.2, 55.5, 2.6], [-3, 64, 2.2], 55),
      // Through the opening, then round to the till, its queue tray and the connection leaving it.
      key("showroom", 0.2, [-1.8, 60.5, 3.2], [-3.2, 63.8, 1.4], 54),
      key("showroom", 0.3, [1.8, 60.6, 3.9], [-3.2, 63.8, 1.4], 52),
      key("showroom", 0.48, [1.8, 60.6, 3.9], [-3.2, 63.8, 1.4], 52),
      // Along the connection to the server as the queue syncs.
      key("showroom", 0.62, [-3, 61.2, 5], [4, 67, 2], 52),
      // Both stock figures: the counter's and the server's.
      key("showroom", 0.85, [-3.6, 60.8, 3.6], [1.6, 65.5, 1.6], 56),
      key("showroom", 1, [-3.6, 60.8, 3.6], [1.6, 65.5, 1.6], 56),
    ],
  },
  {
    id: "accra",
    nav: "Accra We Dey",
    world: "showroom",
    length: 1.6,
    sky: SKY,
    camera: [
      key("showroom", 0, [-3.6, 60.8, 3.6], [1.6, 65.5, 1.6], 56),
      // Past the server, through the opening, to the city model's shore.
      key("showroom", 0.18, [0, 72.5, 3], [0, 82, 1.2], 55),
      key("showroom", 0.36, [0, 78.6, 2.6], [0, 85.5, 0.95], 55),
      // Over the city, then down beside the game server's tower.
      key("showroom", 0.62, [4.2, 81, 4.2], [0.3, 86.5, 1], 52),
      key("showroom", 0.86, [-3.2, 84, 2.8], [0.3, 87.2, 1.4], 50),
      key("showroom", 1, [0, 89.5, 3.6], [0, 100, 1], 52),
    ],
  },
  {
    id: "joydatabundle",
    nav: "JoyDataBundle",
    world: "showroom",
    length: 1.6,
    sky: SKY,
    camera: [
      key("showroom", 0, [0, 89.5, 3.6], [0, 100, 1], 52),
      key("showroom", 0.22, [0, 95.6, 3.2], [0, 103.2, 0.6], 55),
      // Close to the resellers and the frontend ring, then the admin's payout review.
      key("showroom", 0.5, [-4.2, 98.4, 2.2], [-1, 103.5, 0.6], 52),
      key("showroom", 0.8, [2.6, 101, 2.4], [0, 105.6, 0.8], 50),
      key("showroom", 1, [0, 97, 5.5], [0, 104, 0.5], 50),
    ],
  },
  {
    id: "about",
    nav: "About",
    world: "about",
    length: 1.8,
    sky: "#1e1c1a",
    camera: [key("about", 0, [0, -19, 5], [0, 0, 4], 45), key("about", 1, [6.5, -13, 4.5], [0, 0, 4.5], 45)],
  },
  {
    id: "skills",
    nav: "Skills",
    world: "skills",
    length: 1.4,
    sky: "#1f1d1b",
    camera: [key("skills", 0, [-11, -17, 8], [-3, 0, 1.5], 45), key("skills", 1, [9, -17, 8], [1, 0, 1.5], 45)],
  },
  {
    id: "services",
    nav: "Work with me",
    world: "court",
    length: 1.2,
    sky: SKY,
    camera: [key("court", 0, [15, -18, 9], [0, 0, 2.5], 42), key("court", 1, [-15, -18, 9], [0, 0, 2.5], 42)],
  },
  {
    id: "contact",
    nav: "Contact",
    world: "court",
    // The finale holds on screen while the court turns to dusk behind it.
    length: 1.6,
    // Dusk: the finale's lighting change.
    sky: "#3b2b24",
    camera: [
      key("court", 0, [-15, -18, 9], [0, 0, 2.5], 42),
      // Down into the open court, not back under the south arcade's roof; aimed a little left so
      // the monument stands clear of the finale's text.
      key("court", 0.55, [-8, -11, 4.2], [-2, 0, 3], 44),
      key("court", 1, [5, -13, 3.4], [-2.5, 6, 3.6], 44),
    ],
  },
];

export function chapterIndexOf(id: string): number {
  return CHAPTERS.findIndex((chapter) => chapter.id === id);
}
