import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useUiStore } from "@/store/ui";
import { ContactButton } from "./ContactButton";
import { ContactSheet } from "./ContactSheet";

const WITH_CV = {
  github: "https://github.com/Perez25882",
  emails: ["hello@example.com"],
  linkedin: "https://www.linkedin.com/in/example",
  phone: null,
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

  it("offers both email addresses, WhatsApp, a call and LinkedIn", () => {
    render(<ContactSheet />);
    act(() => useUiStore.getState().openContact());

    expect(screen.getByRole("link", { name: "perez25882@gmail.com" })).toHaveAttribute("href", expect.stringMatching(/^mailto:perez25882@gmail\.com/));
    expect(screen.getByRole("link", { name: "pereztegbey66@gmail.com" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("href", "https://wa.me/233558425882");
    expect(screen.getByRole("link", { name: /Call/ })).toHaveAttribute("href", "tel:+233558425882");
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", "https://www.linkedin.com/in/perez-tegbey-55a74928b");
    expect(screen.queryByRole("link", { name: "Download CV" })).not.toBeInTheDocument();
  });

  it("builds the email subject from the chosen intent", () => {
    render(<ContactSheet contact={WITH_CV} />);
    act(() => useUiStore.getState().openContact());

    fireEvent.click(screen.getByRole("button", { name: "Freelance" }));

    expect(screen.getByRole("button", { name: "Freelance" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: "hello@example.com" })).toHaveAttribute(
      "href",
      "mailto:hello@example.com?subject=Freelance%20enquiry",
    );
    expect(screen.getByRole("link", { name: "Download CV" })).toHaveAttribute("href", "/cv.pdf");
  });

  it("confirms when the email address is copied", async () => {
    setClipboard(() => Promise.resolve());
    render(<ContactSheet contact={WITH_CV} />);
    act(() => useUiStore.getState().openContact());

    fireEvent.click(screen.getByRole("button", { name: "Copy hello@example.com" }));

    expect(await screen.findByText("hello@example.com copied.")).toBeInTheDocument();
  });

  it("says so when copying fails", async () => {
    setClipboard(() => Promise.reject(new Error("denied")));
    render(<ContactSheet contact={WITH_CV} />);
    act(() => useUiStore.getState().openContact());

    fireEvent.click(screen.getByRole("button", { name: "Copy hello@example.com" }));

    expect(await screen.findByText(/Couldn't copy/)).toBeInTheDocument();
  });

  it("closes when the backdrop is clicked", () => {
    render(<ContactSheet />);
    act(() => useUiStore.getState().openContact());

    fireEvent.click(screen.getByRole("dialog"));

    expect(useUiStore.getState().contactOpen).toBe(false);
  });
});
