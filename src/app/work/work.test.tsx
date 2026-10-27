import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { caseStudies } from "@/content/caseStudies";
import { process, services } from "@/content/services";
import WorkWithMePage from "../work-with-me/page";
import CaseStudyPage, { generateStaticParams } from "./[slug]/page";

async function renderCaseStudy(slug: string) {
  const page = await CaseStudyPage({ params: Promise.resolve({ slug }), searchParams: Promise.resolve({}) });
  return render(page);
}

describe("Case studies", () => {
  it("builds a page for every project with case-study content", () => {
    expect(generateStaticParams().map((params) => params.slug)).toEqual(caseStudies.map((study) => study.slug));
  });

  it("shows each engineering decision with its source, marking self-reported claims", async () => {
    await renderCaseStudy("ledgermind");

    expect(screen.getByRole("heading", { level: 1, name: "LedgerMind OS" })).toBeInTheDocument();
    const decisions = screen.getByRole("region", { name: "Engineering decisions" });
    expect(within(decisions).getByRole("heading", { name: "Sent twice, counted once" })).toBeInTheDocument();
    expect(within(decisions).getAllByText(/Source:/)).toHaveLength(6);
    expect(within(decisions).getByText("Self-reported")).toBeInTheDocument();
  });

  it("credits a team project as Perez's part, not his alone", async () => {
    await renderCaseStudy("joydatabundle");

    const part = screen.getByRole("region", { name: "Perez's part" });
    expect(screen.getByText("Team project")).toBeInTheDocument();
    expect(within(part).getByText(/The backend was built by a teammate/)).toBeInTheDocument();
  });

  it("leads onward to the next project", async () => {
    await renderCaseStudy("accra-we-dey");

    const onward = screen.getByRole("navigation", { name: "More work" });
    expect(within(onward).getByRole("link", { name: /JoyDataBundle/ })).toHaveAttribute("href", "/work/joydatabundle");
  });
});

describe("Work with me", () => {
  it("explains every service and the steps of a project, in order", () => {
    render(<WorkWithMePage />);

    for (const service of services) {
      expect(screen.getByRole("heading", { level: 3, name: service.name })).toBeInTheDocument();
    }
    const steps = within(screen.getByRole("region", { name: "How a project works" })).getAllByRole("listitem");
    expect(steps.map((step) => within(step).getByRole("heading").textContent)).toEqual(process.map((step) => step.title));
  });

  it("states no prices, testimonials or client results", () => {
    const { container } = render(<WorkWithMePage />);

    expect(container.textContent).not.toMatch(/GHS|\$|£|€|testimonial|clients say/i);
  });

  it("always offers a way to start", () => {
    render(<WorkWithMePage />);

    expect(screen.getAllByRole("button", { name: "Start a conversation" }).length).toBeGreaterThan(0);
  });
});
