import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { flowdeskCaseStudy } from "@/content/flowdesk";
import { CaptionToggle } from "./CaptionToggle";
import { StrataList } from "./StrataList";

const [firstStratum] = flowdeskCaseStudy.strata;

describe("Look beneath captions", () => {
  it("shows plain captions by default", () => {
    render(
      <>
        <CaptionToggle />
        <StrataList strata={flowdeskCaseStudy.strata} />
      </>,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(7);
    expect(screen.getByText(firstStratum.plain)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Plain" })).toHaveAttribute("aria-pressed", "true");
  });

  it("switches every stratum to technical captions", () => {
    render(
      <>
        <CaptionToggle />
        <StrataList strata={flowdeskCaseStudy.strata} />
      </>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Technical" }));

    expect(screen.getByText(firstStratum.technical)).toBeInTheDocument();
    expect(screen.queryByText(firstStratum.plain)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Technical" })).toHaveAttribute("aria-pressed", "true");
  });
});
