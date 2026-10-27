import { describe, expect, it } from "vitest";
import { DEMO_STEPS } from "./demo";
import { STOPS, isFlight, poseFor, stopIndexOf, toThree } from "./stops";

describe("tour stops", () => {
  it("converts Blender Z-up coordinates to three.js Y-up", () => {
    expect(toThree([1, 2, 3])).toEqual([1, 3, -2]);
  });

  it("uses the landscape composition for wide viewports and the portrait one for tall viewports", () => {
    const court = STOPS[0];
    expect(poseFor(court, 16 / 9).fov).toBe(court.landscape.fov);
    expect(poseFor(court, 9 / 16).fov).toBe(court.portrait.fov);
    expect(poseFor(court, 9 / 16).position).toEqual(toThree(court.portrait.position));
  });

  it("gives every stop a unique id, a title and a caption", () => {
    expect(new Set(STOPS.map((stop) => stop.id)).size).toBe(STOPS.length);
    for (const stop of STOPS) {
      expect(stop.title).not.toBe("");
      expect(stop.caption).not.toBe("");
    }
  });

  it("finds stops by id and reports unknown ids as -1", () => {
    expect(stopIndexOf("beneath")).toBe(STOPS.length - 1);
    expect(stopIndexOf("nowhere")).toBe(-1);
  });

  it("flies only between neighbouring stops", () => {
    expect(isFlight(2, 3)).toBe(true);
    expect(isFlight(3, 2)).toBe(true);
    expect(isFlight(0, 4)).toBe(false);
  });

  it("only sends the demonstration to stops that exist", () => {
    for (const step of DEMO_STEPS) {
      if (step.stop) expect(stopIndexOf(step.stop)).toBeGreaterThanOrEqual(0);
    }
  });
});
