import { fireEvent, render, screen, within } from "@testing-library/react";
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
  it("offers the museum and the 2D portfolio from the first screen", () => {
    render(<ArrivalPage />);

    expect(screen.getByRole("heading", { level: 1, name: /PEREZ/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Enter Museum/ })).toHaveAttribute("href", "/museum");
    expect(screen.getByRole("link", { name: "View portfolio" })).toHaveAttribute("href", "/quick");
    expect(screen.getByRole("navigation", { name: "Sections" })).toBeInTheDocument();
  });
});

describe("FlowDesk case study", () => {
  it("labels the demonstration as a simulation and shows all seven strata", () => {
    render(<FlowDeskPage />);

    expect(screen.getByRole("heading", { level: 1, name: "FlowDesk" })).toBeInTheDocument();
    expect(screen.getByText(/Not a live WhatsApp connection, and not real customer data/)).toBeInTheDocument();
    const beneath = screen.getByRole("region", { name: "Look beneath the surface" });
    expect(within(beneath).getAllByRole("heading", { level: 3 })).toHaveLength(7);
    expect(screen.getByText("The price floor lives in the database, not the prompt.")).toBeInTheDocument();
  });

  it("lets the visitor play the conversation without the 3D museum", () => {
    render(<FlowDeskPage />);

    const demo = screen.getByRole("region", { name: "Play the customer" });
    expect(within(demo).getByText("Send the first message to start.")).toBeInTheDocument();
    fireEvent.click(within(demo).getByRole("button", { name: /Do you have the wax print, half piece/ }));
    expect(within(demo).getByText(/GHS 250 each, GHS 500 for two/)).toBeInTheDocument();
    expect(within(demo).getByRole("heading", { name: "Order record" })).toBeInTheDocument();
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
    expect(screen.getByRole("link", { name: "Open the portfolio" })).toHaveAttribute("href", "/quick");
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
