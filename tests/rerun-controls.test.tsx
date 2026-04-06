import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("@/app/experiments/[id]/actions", () => ({
  rerunExperimentAction: vi.fn(),
}));

import { RerunControls } from "@/components/experiment-detail/rerun-controls";

describe("rerun controls", () => {
  it("shows an explicit loading state while AI suggestions are still streaming in", () => {
    render(
      <RerunControls
        experimentId="exp_123"
        suggestions={[]}
        defaultPrompt="Generate three quality-led headlines."
        isLoading
      />,
    );

    expect(screen.getByRole("heading", { name: "AI suggestions" })).toBeInTheDocument();
    expect(
      screen.getByText("Generating AI suggestions from this experiment..."),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate output" })).toBeInTheDocument();
  });
});
