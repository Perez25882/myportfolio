import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { STOPS, stopIndexOf } from "@/museum/stops";
import { useMuseumStore } from "@/store/museum";
import { TourPanel } from "./TourPanel";

afterEach(() => {
  useMuseumStore.setState({ stopIndex: 0, cut: 0, demoProgress: 0, monumentOpen: false });
});

describe("TourPanel", () => {
  it("starts at the Court with Previous disabled", () => {
    render(<TourPanel />);

    expect(screen.getByRole("heading", { name: "The Court" })).toBeInTheDocument();
    expect(screen.getByText(`Stop 1 of ${STOPS.length}`)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  it("moves with the Next button and the arrow keys", () => {
    render(<TourPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("heading", { name: "The Code Monument" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByRole("heading", { name: /FlowDesk · The Conversation Engine/ })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByRole("heading", { name: "The Code Monument" })).toBeInTheDocument();
  });

  it("ignores arrow keys with modifiers", () => {
    render(<TourPanel />);
    fireEvent.keyDown(window, { key: "ArrowRight", ctrlKey: true });
    expect(screen.getByRole("heading", { name: "The Court" })).toBeInTheDocument();
  });

  it("jumps from the stop list and counts a long jump as a cut", () => {
    render(<TourPanel />);

    fireEvent.click(screen.getByRole("button", { name: "All stops" }));
    const list = screen.getByRole("list");
    fireEvent.click(within(list).getByRole("button", { name: /Look beneath the surface/ }));

    expect(screen.getByRole("heading", { name: "Look beneath the surface" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All stops" })).toHaveAttribute("aria-expanded", "false");
    expect(useMuseumStore.getState().cut).toBe(1);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("offers a way out of 3D from the stop list", () => {
    render(<TourPanel />);
    fireEvent.click(screen.getByRole("button", { name: "All stops" }));
    expect(screen.getByRole("link", { name: "Leave 3D: open the portfolio" })).toHaveAttribute("href", "/quick");
  });

  it("opens the phone sheet with the stop list, and closes both with Less", () => {
    const { container } = render(<TourPanel />);
    const panel = container.querySelector("section");
    expect(panel).toHaveAttribute("data-expanded", "false");

    fireEvent.click(screen.getByRole("button", { name: "All stops" }));
    expect(panel).toHaveAttribute("data-expanded", "true");

    fireEvent.click(screen.getByRole("button", { name: /Less/ }));
    expect(panel).toHaveAttribute("data-expanded", "false");
    expect(screen.getByRole("button", { name: "All stops" })).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the sheet at the demonstration stops, and still lets the visitor fold it away", () => {
    act(() => useMuseumStore.getState().goTo(stopIndexOf("conversation")));
    const { container } = render(<TourPanel />);
    const panel = container.querySelector("section");
    expect(panel).toHaveAttribute("data-expanded", "true");

    fireEvent.click(screen.getByRole("button", { name: /Less/ }));
    expect(panel).toHaveAttribute("data-expanded", "false");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(panel).toHaveAttribute("data-expanded", "true");
  });

  it("closes the stop list with Escape", () => {
    render(<TourPanel />);
    fireEvent.click(screen.getByRole("button", { name: "All stops" }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByRole("button", { name: "All stops" })).toHaveAttribute("aria-expanded", "false");
  });

  it("links the threshold to the case study", () => {
    act(() => useMuseumStore.getState().goTo(stopIndexOf("threshold")));
    render(<TourPanel />);
    expect(screen.getByRole("link", { name: "Read the case study" })).toHaveAttribute("href", "/work/flowdesk");
  });

  it("runs the FlowDesk demonstration from the hall to the architecture", () => {
    act(() => useMuseumStore.getState().goTo(stopIndexOf("hall")));
    render(<TourPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Play the customer" }));
    expect(screen.getByText("Simulation")).toBeInTheDocument();
    expect(screen.getByText(/Not a live WhatsApp connection/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Do you have the wax print, half piece/ }));
    expect(screen.getByText(/GHS 250 each, GHS 500 for two/)).toBeInTheDocument();
    expect(screen.getByText("Order record")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Can you do GHS 200 each/ }));
    expect(screen.getByText(/Refused: below the floor/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /I'll pay with MoMo/ }));
    expect(screen.getByRole("heading", { name: "The owner's view" })).toBeInTheDocument();
    expect(screen.getByText(/Unconfirmed until checked/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "See how it works" }));
    expect(screen.getByRole("heading", { name: "Look beneath the surface" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Technical" })).toBeInTheDocument();
  });

  it("restarts the demonstration when it has finished", () => {
    act(() => {
      useMuseumStore.setState({ stopIndex: stopIndexOf("order"), demoProgress: 4 });
    });
    render(<TourPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Play again" }));

    expect(useMuseumStore.getState().demoProgress).toBe(0);
    expect(screen.getByRole("heading", { name: "Play the customer" })).toBeInTheDocument();
  });
});
