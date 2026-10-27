import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { formatMonth } from "@/lib/format";
import ArrivalPage from "./page";
import NotFound from "./not-found";
import FlowDeskPage from "./work/flowdesk/page";

// three.js cannot run in jsdom; the 3D experience is exercised in the browser instead.
vi.mock("@/components/museum/MuseumExperience", () => ({
  MuseumExperience: () => <p>3D museum experience</p>,
}));

describe("Arrival", () => {
  it("offers the museum and the Quick View from the first screen", () => {
    render(<ArrivalPage />);

    expect(screen.getByRole("heading", { level: 1, name: /PEREZ/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Enter Museum/ })).toHaveAttribute("href", "/museum");
    expect(screen.getByRole("link", { name: "Quick View" })).toHaveAttribute("href", "/quick");
    expect(screen.getByRole("navigation", { name: "Sections" })).toBeInTheDocument();
  });
});

describe("FlowDesk case study", () => {
  it("labels the demonstration as a simulation and shows all seven strata", () => {
    render(<FlowDeskPage />);

    expect(screen.getByRole("heading", { level: 1, name: "FlowDesk" })).toBeInTheDocument();
    expect(screen.getByText(/It is a simulation, not a live WhatsApp connection/)).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(7);
    expect(screen.getByText("The price floor lives in the database, not the prompt.")).toBeInTheDocument();
  });
});

describe("Museum gate", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("sends devices without WebGL to the Quick View", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const { default: MuseumPage } = await import("./museum/page");
    render(<MuseumPage />);

    expect(screen.getByRole("alert")).toHaveTextContent("can't show the 3D museum");
    expect(screen.getByRole("link", { name: "Open Quick View" })).toHaveAttribute("href", "/quick");
  });

  it("opens the 3D experience on capable devices", async () => {
    const loseContext = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      getExtension: () => ({ loseContext }),
    } as unknown as WebGL2RenderingContext);
    const { default: MuseumPage } = await import("./museum/page");
    render(<MuseumPage />);

    expect(screen.getByText("3D museum experience")).toBeInTheDocument();
    expect(loseContext).toHaveBeenCalledOnce();
  });
});

describe("Not found", () => {
  it("routes the visitor back to the entrance", () => {
    render(<NotFound />);
    expect(screen.getByRole("link", { name: "Return to the entrance" })).toHaveAttribute("href", "/");
  });
});

describe("formatMonth", () => {
  it("formats a year-month", () => {
    expect(formatMonth("2026-07")).toBe("Jul 2026");
  });

  it("rejects malformed input", () => {
    expect(() => formatMonth("2026-13")).toThrow(/YYYY-MM/);
  });
});
