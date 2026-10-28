import { describe, expect, it } from "vitest";
import { CHAPTERS, chapterIndexOf, type Chapter } from "./chapters";
import { fitToAspect, locate, poseAt, quantize, sampleKeys, smoothstep, veilAt, worldCuts } from "./camera";
import { progressIn, span } from "./state";

const keys = [
  { at: 0, position: [0, 0, 0], target: [0, 10, 0], fov: 40 },
  { at: 0.5, position: [10, 0, 0], target: [10, 10, 0], fov: 60 },
  { at: 1, position: [10, 10, 0], target: [10, 20, 0], fov: 60 },
] as const;

describe("smoothstep", () => {
  it("eases from 0 to 1 and clamps outside the range", () => {
    expect(smoothstep(-1)).toBe(0);
    expect(smoothstep(0.5)).toBe(0.5);
    expect(smoothstep(2)).toBe(1);
    expect(smoothstep(0.1)).toBeLessThan(0.1);
  });
});

describe("sampleKeys", () => {
  it("returns the keys themselves at their points", () => {
    expect(sampleKeys(keys, 0).position).toEqual([0, 0, 0]);
    expect(sampleKeys(keys, 0.5).position).toEqual([10, 0, 0]);
    expect(sampleKeys(keys, 1).target).toEqual([10, 20, 0]);
  });

  it("interpolates position, target and field of view between keys", () => {
    const pose = sampleKeys(keys, 0.25);
    expect(pose.position[0]).toBeCloseTo(5);
    expect(pose.fov).toBeCloseTo(50);
  });
});

describe("locate and poseAt", () => {
  it("splits a scroll value into chapter and progress, clamped to the journey", () => {
    expect(locate(2.25)).toEqual({ index: 2, progress: 0.25 });
    expect(locate(-3)).toEqual({ index: 0, progress: 0 });
    expect(locate(99)).toEqual({ index: CHAPTERS.length - 1, progress: 1 });
  });

  it("is continuous across every chapter boundary that is not a world cut", () => {
    const cuts = new Set(worldCuts());
    for (let i = 1; i < CHAPTERS.length; i += 1) {
      if (cuts.has(i)) continue;
      const before = poseAt(i - 1e-6);
      const after = poseAt(i);
      before.position.forEach((value, axis) => expect(value).toBeCloseTo(after.position[axis], 3));
    }
  });
});

describe("authored chapters", () => {
  it("keeps every chapter's keys ordered from 0 to 1", () => {
    for (const chapter of CHAPTERS) {
      const points = chapter.camera.map((key) => key.at);
      expect(points[0]).toBe(0);
      expect(points.at(-1)).toBe(1);
      expect([...points].sort((a, b) => a - b)).toEqual(points);
    }
  });

  it("keeps the camera above the monument while it passes over it", () => {
    const monument = chapterIndexOf("monument");
    for (let t = 0.7; t <= 0.9; t += 0.02) {
      const [x, y, z] = poseAt(monument + t).position;
      if (Math.abs(x) < 2 && Math.abs(y) < 2) expect(z).toBeGreaterThan(5.4);
    }
  });

  it("keeps the camera under the FlowDesk rail and above the table", () => {
    const flowdesk = chapterIndexOf("flowdesk");
    for (let t = 0.2; t <= 1; t += 0.02) {
      const [, y, z] = poseAt(flowdesk + t).position;
      if (y > 30.6) {
        expect(z).toBeLessThan(3.5);
        expect(z).toBeGreaterThan(1.3);
      }
    }
  });
});

describe("the showroom walk", () => {
  // Inner faces from blender/scripts/rooms/flowdesk.py and showroom.py.
  const HALF_WIDTH = 7.2;
  const CEILING = 10.8;
  const PARTITIONS = [
    { y0: 59.4, y1: 60, open0: -6, open1: 0 },
    { y0: 76.8, y1: 77.4, open0: -3.6, open1: 3.6 },
    { y0: 94.2, y1: 94.8, open0: -3.6, open1: 3.6 },
  ];

  it("stays inside the building and passes each partition through its opening", () => {
    for (const id of ["ledgermind", "accra", "joydatabundle"]) {
      const index = chapterIndexOf(id);
      for (let t = 0; t <= 1; t += 0.005) {
        const [x, y, z] = poseAt(index + t).position;
        expect(Math.abs(x)).toBeLessThan(HALF_WIDTH - 0.3);
        expect(z).toBeLessThan(CEILING - 0.5);
        for (const wall of PARTITIONS) {
          if (y > wall.y0 - 0.15 && y < wall.y1 + 0.15) {
            expect(x).toBeGreaterThan(wall.open0 + 0.3);
            expect(x).toBeLessThan(wall.open1 - 0.3);
            expect(z).toBeLessThan(6 - 0.3);
          }
        }
      }
    }
  });
});

describe("worldCuts and veilAt", () => {
  it("cuts between worlds but walks from the Court through the whole showroom", () => {
    const cuts = worldCuts();
    for (const id of ["flowdesk", "ledgermind", "accra", "joydatabundle", "contact"]) expect(cuts).not.toContain(chapterIndexOf(id));
    expect(cuts).toContain(chapterIndexOf("about"));
    expect(cuts).toContain(chapterIndexOf("services"));
  });

  it("is opaque at a cut and clear away from it", () => {
    expect(veilAt(3, [3])).toBe(1);
    expect(veilAt(3.5, [3])).toBe(0);
  });
});

describe("fitToAspect", () => {
  const pose = { position: [0, -10, 0], target: [0, 0, 0], fov: 40 } as const;

  it("leaves landscape poses alone", () => {
    expect(fitToAspect(pose, 1.6, false)).toBe(pose);
  });

  it("widens and steps back in an open world on a phone", () => {
    const fitted = fitToAspect(pose, 0.46, false);
    expect(fitted.fov).toBe(58);
    expect(fitted.position[1]).toBeCloseTo(-13.5);
  });

  it("only widens inside a walled room", () => {
    expect(fitToAspect(pose, 0.46, true).position).toEqual(pose.position);
  });
});

describe("quantize", () => {
  it("holds the last authored key passed", () => {
    const chapters: Chapter[] = [{ id: "opening", nav: "", world: "court", length: 1, sky: "", camera: keys }];
    expect(quantize(0.4, chapters)).toBe(0);
    expect(quantize(0.6, chapters)).toBe(0.5);
  });
});

describe("progressIn and span", () => {
  it("clamps progress to one chapter and maps part of it", () => {
    expect(progressIn(4.3, 4)).toBeCloseTo(0.3);
    expect(progressIn(2, 4)).toBe(0);
    expect(progressIn(6, 4)).toBe(1);
    expect(span(0.5, 0.4, 0.6)).toBeCloseTo(0.5);
  });
});
