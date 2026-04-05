import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({
    title,
    description,
    children,
  }: {
    title: string;
    description: string;
    children?: React.ReactNode;
  }) => (
    <main>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </main>
  ),
}));

import ExperimentNotFound from "@/app/experiments/[id]/not-found";

describe("experiment detail not-found page", () => {
  it("sends the recovery action to the create experiment flow", () => {
    render(<ExperimentNotFound />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Experiment not found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Choose another experiment" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Create Experiment" }),
    ).toHaveAttribute("href", "/experiments/new");
  });
});
