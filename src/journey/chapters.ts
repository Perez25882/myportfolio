import type { Vec3 } from "@/museum/stops";

/**
 * The scroll journey on the home page: one continuous camera through ten chapters.
 * Camera keys are authored in Blender coordinates (metres, +Y north, Z up), like the tour stops,
 * and converted to three.js at runtime. Each key sits at a point (0–1) of its chapter's scroll.
 *
 * Worlds: the Court and FlowDesk are the Blender rooms (around the origin). The other projects,
 * About and Skills are lightweight scenes built in code, each placed far enough away that only
 * one world is ever on screen.
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

export type World = "court" | "flowdesk" | "ledgermind" | "accra" | "network" | "about" | "skills";

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
  flowdesk: [0, 0, 0],
  ledgermind: [300, 0, 0],
  accra: [600, 0, 0],
  network: [900, 0, 0],
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
    world: "flowdesk",
    length: 2.4,
    sky: SKY,
    camera: [
      key("flowdesk", 0, [0, 12, 3], [0, 28, 3.4], 55),
      key("flowdesk", 0.2, [0.6, 27.5, 1.8], [0, 40, 2.4], 60),
      // The customer's phone wall, square-on.
      key("flowdesk", 0.38, [-1.2, 33.4, 2.4], [-7.05, 33.95, 2.7], 46),
      // Along the pipeline table, under the 3.6 m rail and clear of the table top.
      key("flowdesk", 0.56, [2.6, 38.6, 3], [0, 43.5, 0.9], 50),
      key("flowdesk", 0.7, [3.4, 44.5, 2.8], [0, 48.5, 0.9], 50),
      // The owner's board.
      key("flowdesk", 0.88, [0, 52.5, 2.6], [6, 54.3, 1.9], 52),
      key("flowdesk", 1, [0, 52.5, 2.6], [6, 54.3, 1.9], 52),
    ],
  },
  {
    id: "ledgermind",
    nav: "LedgerMind OS",
    world: "ledgermind",
    length: 2,
    sky: "#1d2623",
    camera: [
      key("ledgermind", 0, [-10, -13, 6], [0, 0, 1.2], 40),
      key("ledgermind", 0.45, [-5, -9, 3.6], [-3, 0, 1.2], 42),
      key("ledgermind", 0.8, [4.5, -9, 3.8], [4, 0, 1.6], 42),
      key("ledgermind", 1, [0, -15, 6.5], [0, 0, 1], 40),
    ],
  },
  {
    id: "accra",
    nav: "Accra We Dey",
    world: "accra",
    length: 1.6,
    sky: "#e6cfae",
    camera: [
      key("accra", 0, [-14, -32, 9], [0, -4, 0], 45),
      key("accra", 0.5, [4, -8, 12], [0, 8, 0], 45),
      key("accra", 0.82, [10, 7, 7], [0, 0, 3], 45),
      key("accra", 1, [0, -26, 26], [0, 2, 0], 45),
    ],
  },
  {
    id: "joydatabundle",
    nav: "JoyDataBundle",
    world: "network",
    length: 1.6,
    sky: "#0f2a2f",
    camera: [
      key("network", 0, [0, -28, 14], [0, 0, 2], 45),
      key("network", 0.5, [-7, -13, 6.5], [-4, 0, 2.5], 45),
      key("network", 0.8, [3, -7, 5], [0, 0, 3], 45),
      key("network", 1, [0, -32, 22], [0, 0, 0], 45),
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
