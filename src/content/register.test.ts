import { describe, expect, it } from "vitest";
import { capabilities } from "./capabilities";
import { flowdeskCaseStudy } from "./flowdesk";
import { profile } from "./profile";
import { projects } from "./projects";
import { story } from "./story";

const VERIFICATIONS = ["verified", "self-reported", "pending"];

describe("content register", () => {
  it("gives every project a unique slug", () => {
    const slugs = projects.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("gives every highlight a known verification status and a source", () => {
    for (const project of projects) {
      for (const claim of project.highlights) {
        expect(VERIFICATIONS).toContain(claim.verification);
        expect(claim.source.trim()).not.toBe("");
      }
    }
  });

  it("only marks a project live when it links to the live site", () => {
    for (const project of projects.filter((p) => p.status === "live")) {
      expect(project.links.some((link) => link.label === "Live site")).toBe(true);
    }
  });

  it("credits the team in the role of every team project", () => {
    for (const project of projects.filter((p) => p.isTeamProject)) {
      expect(project.role.toLowerCase()).toMatch(/team/);
    }
  });

  it("never publishes a link that is still withheld", () => {
    for (const project of projects) {
      const published = new Set(project.links.map((link) => link.label));
      for (const withheld of project.withheldLinks) {
        expect(published.has(withheld.label)).toBe(false);
        expect(project.pending).toContain(withheld.reason);
      }
    }
  });

  it("contains no phone numbers, email addresses or tunnel URLs", () => {
    const text = JSON.stringify({ profile, projects, story, capabilities, flowdeskCaseStudy });
    expect(text).not.toMatch(/\+?233[\s-]?\d{2}/);
    expect(text).not.toMatch(/\b0\d{9}\b/);
    expect(text).not.toMatch(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
    expect(text).not.toMatch(/ngrok/i);
  });

  it("keeps story dates well-formed and in order", () => {
    const dates = story.map((entry) => entry.date);
    for (const date of dates) expect(date).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
    expect([...dates].sort()).toEqual(dates);
  });

  it("describes FlowDesk in seven strata with both captions", () => {
    expect(flowdeskCaseStudy.strata).toHaveLength(7);
    for (const stratum of flowdeskCaseStudy.strata) {
      expect(stratum.plain).not.toBe("");
      expect(stratum.technical).not.toBe("");
    }
  });
});
