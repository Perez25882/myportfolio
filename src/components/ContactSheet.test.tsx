import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useUiStore } from "@/store/ui";
import { ContactButton } from "./ContactButton";
import { ContactSheet } from "./ContactSheet";

const WITH_EMAIL = {
  github: "https://github.com/Perez25882",
  email: "hello@example.com",
  linkedin: "https://www.linkedin.com/in/example",
  cvHref: "/cv.pdf",
};

function setClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
}

describe("ContactSheet", () => {
  afterEach(() => vi.restoreAllMocks());

  it("opens from the Contact button and shows the GitHub profile", () => {
    render(
      <>
        <ContactButton />
        <ContactSheet />
      </>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Contact" }));

    expect(screen.getByRole("dialog", { name: "Get in touch" })).toBeVisible();
    expect(screen.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", "https://github.com/Perez25882");
  });

  it("closes from the Close button", () => {
    render(<ContactSheet />);
    act(() => useUiStore.getState().openContact());

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(useUiStore.getState().contactOpen).toBe(false);
  });

  it("explains that email and CV are pending when they are not configured", () => {
    render(<ContactSheet />);
    act(() => useUiStore.getState().openContact());

    expect(screen.getByText(/will appear here once confirmed/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copy" })).not.toBeInTheDocument();
  });

  it("builds the email subject from the chosen intent", () => {
    render(<ContactSheet contact={WITH_EMAIL} />);
    act(() => useUiStore.getState().openContact());

    fireEvent.click(screen.getByRole("button", { name: "Freelance" }));

    expect(screen.getByRole("button", { name: "Freelance" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: "hello@example.com" })).toHaveAttribute(
      "href",
      "mailto:hello@example.com?subject=Freelance%20enquiry",
    );
    expect(screen.getByRole("link", { name: "Download CV" })).toHaveAttribute("href", "/cv.pdf");
    expect(screen.queryByText(/will appear here once confirmed/)).not.toBeInTheDocument();
  });

  it("confirms when the email address is copied", async () => {
    setClipboard(() => Promise.resolve());
    render(<ContactSheet contact={WITH_EMAIL} />);
    act(() => useUiStore.getState().openContact());

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    expect(await screen.findByText("Email address copied.")).toBeInTheDocument();
  });

  it("says so when copying fails", async () => {
    setClipboard(() => Promise.reject(new Error("denied")));
    render(<ContactSheet contact={WITH_EMAIL} />);
    act(() => useUiStore.getState().openContact());

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    expect(await screen.findByText(/Couldn't copy/)).toBeInTheDocument();
  });

  it("closes when the backdrop is clicked", () => {
    render(<ContactSheet />);
    act(() => useUiStore.getState().openContact());

    fireEvent.click(screen.getByRole("dialog"));

    expect(useUiStore.getState().contactOpen).toBe(false);
  });
});
