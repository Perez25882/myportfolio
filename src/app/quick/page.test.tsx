import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { projects } from "@/content/projects";
import QuickViewPage from "./page";

describe("Quick View", () => {
  it("introduces Perez with the role line and availability", () => {
    render(<QuickViewPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Perez Tegbey" })).toBeInTheDocument();
    expect(screen.getAllByText("Open to work").length).toBeGreaterThan(0);
  });

  it("lists all four flagship projects with worded status chips", () => {
    render(<QuickViewPage />);

    const work = screen.getByRole("region", { name: "Selected work" });
    for (const project of projects) {
      expect(within(work).getByRole("heading", { level: 3, name: project.name })).toBeInTheDocument();
    }
    expect(within(work).getAllByText("Pre-launch")).toHaveLength(3);
    expect(within(work).getByText("Live")).toBeInTheDocument();
    expect(within(work).getByText("Team project")).toBeInTheDocument();
    expect(within(work).getAllByText("Self-reported").length).toBeGreaterThan(0);
  });

  it("links FlowDesk to its case study but not to its withheld repository", () => {
    render(<QuickViewPage />);

    const flowdesk = screen.getByRole("article", { name: "FlowDesk" });
    expect(within(flowdesk).getByRole("link", { name: /Case study/ })).toHaveAttribute("href", "/work/flowdesk");
    expect(within(flowdesk).queryByRole("link", { name: /Repository/ })).not.toBeInTheDocument();
    expect(within(flowdesk).getByText(/Repository link withheld/)).toBeInTheDocument();
  });

  it("opens external links in a new tab safely", () => {
    render(<QuickViewPage />);

    const joy = screen.getByRole("article", { name: "JoyDataBundle" });
    const live = within(joy).getByRole("link", { name: /Live site/ });
    expect(live).toHaveAttribute("target", "_blank");
    expect(live).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows the story with readable dates", () => {
    render(<QuickViewPage />);

    const storySection = screen.getByRole("region", { name: "Story so far" });
    expect(within(storySection).getByText("Oct 2024")).toBeInTheDocument();
    expect(within(storySection).getByText(/not project start dates/)).toBeInTheDocument();
  });
});
