import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { projects } from "@/content/projects";
import { services } from "@/content/services";
import QuickViewPage from "./page";

describe("Quick View", () => {
  it("introduces Perez with the role line and availability", () => {
    render(<QuickViewPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Perez Tegbey" })).toBeInTheDocument();
    expect(screen.getByText(/Open to work: employment, freelance work and collaboration/)).toBeInTheDocument();
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

  it("gives every project a case study and a described visual", () => {
    render(<QuickViewPage />);

    for (const project of projects) {
      const article = screen.getByRole("article", { name: project.name });
      expect(within(article).getByRole("link", { name: "Read the case study" })).toHaveAttribute(
        "href",
        `/work/${project.slug}`,
      );
      expect(within(article).getByRole("figure")).toBeInTheDocument();
    }
  });

  it("labels FlowDesk's screens as reconstructions and withholds its repository", () => {
    render(<QuickViewPage />);

    const flowdesk = screen.getByRole("article", { name: "FlowDesk" });
    expect(within(flowdesk).getByText(/not product screenshots/)).toBeInTheDocument();
    expect(within(flowdesk).queryByRole("link", { name: /Repository/ })).not.toBeInTheDocument();
  });

  it("opens external links in a new tab safely, and says so", () => {
    render(<QuickViewPage />);

    const joy = screen.getByRole("article", { name: "JoyDataBundle" });
    const live = within(joy).getByRole("link", { name: /Live site/ });
    expect(live).toHaveAttribute("target", "_blank");
    expect(live).toHaveAttribute("rel", "noopener noreferrer");
    expect(live).toHaveTextContent("(opens in a new tab)");
  });

  it("dates experience by first public commit, not start date", () => {
    render(<QuickViewPage />);

    const experience = screen.getByRole("region", { name: "Experience" });
    expect(within(experience).getByText("Oct 2024")).toBeInTheDocument();
    expect(screen.getByText(/isn't the same as a start date/)).toBeInTheDocument();
  });

  it("ties every shipped skill to a project, without self-rated levels", () => {
    render(<QuickViewPage />);

    const skills = screen.getByRole("region", { name: "Skills" });
    expect(within(skills).getAllByText(/Shown in/).length).toBeGreaterThan(0);
    expect(within(skills).queryByText(/%/)).not.toBeInTheDocument();
  });

  it("offers the freelance services with a way to start", () => {
    render(<QuickViewPage />);

    const work = screen.getByRole("region", { name: "Work with me" });
    for (const service of services) {
      expect(within(work).getByRole("heading", { name: service.name })).toBeInTheDocument();
    }
    expect(within(work).getByRole("link", { name: "How a project works" })).toHaveAttribute("href", "/work-with-me");
    expect(within(work).getByRole("button", { name: "Start a conversation" })).toBeInTheDocument();
  });

  it("lists only unlaunched projects as in progress", () => {
    render(<QuickViewPage />);

    const progress = screen.getByRole("region", { name: "In progress" });
    expect(within(progress).getAllByRole("listitem")).toHaveLength(3);
    expect(within(progress).queryByText("JoyDataBundle")).not.toBeInTheDocument();
  });
});
