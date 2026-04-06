import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExperimentDetailHeader } from "@/components/experiment-detail/detail-header";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/app/actions/delete-experiment", () => ({
  deleteExperimentAction: vi.fn(),
}));

describe("experiment detail header", () => {
  it("keeps overview content collapsed until expanded from the title box", () => {
    render(
      <ExperimentDetailHeader
        experimentId="exp_123"
        title="Spring hero banner test"
        metadata={<div>Primary brief</div>}
      />,
    );

    expect(screen.getByRole("button", { name: "Expand overview" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByText("Primary brief")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Expand overview" }));

    expect(screen.getByRole("button", { name: "Collapse overview" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByText("Primary brief")).toBeInTheDocument();
  });
});
