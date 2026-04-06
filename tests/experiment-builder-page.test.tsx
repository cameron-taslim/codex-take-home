import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  pushMock,
  refreshMock,
  redirectMock,
  requireUserSessionMock,
  prepareExperimentBriefActionMock,
  generateExperimentActionMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  redirectMock: vi.fn(),
  requireUserSessionMock: vi.fn(),
  prepareExperimentBriefActionMock: vi.fn(),
  generateExperimentActionMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
  redirect: redirectMock,
}));

vi.mock("@/lib/auth/session", () => ({
  requireUserSession: requireUserSessionMock,
  getServerSession: vi.fn().mockResolvedValue({
    user: { id: "user_1", email: "demo@example.com" },
  }),
}));

vi.mock("@/app/experiments/new/actions", () => ({
  prepareExperimentBriefAction: prepareExperimentBriefActionMock,
  generateExperimentAction: generateExperimentActionMock,
}));

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({
    title,
    description,
    customHeader,
    children,
  }: {
    title: string;
    description: string;
    customHeader?: React.ReactNode;
    children?: React.ReactNode;
  }) => (
    <main>
      {customHeader ?? <h1>{title}</h1>}
      {description ? <p>{description}</p> : null}
      {children}
    </main>
  ),
}));

import NewExperimentPage from "@/app/experiments/new/page";

const baseValues = {
  name: "Spring hero banner test",
  componentType: "Hero banner",
  targetAudience: "Returning shoppers",
  brandTone: "Editorial",
  brandConstraints: "Avoid discount framing",
  seedContext: "Feature lightweight outerwear",
  whatToTest: "Generate three headlines that lead with quality.",
};

describe("experiment builder page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    requireUserSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });

    prepareExperimentBriefActionMock.mockResolvedValue({
      values: {
        ...baseValues,
        experimentId: "exp_123",
        approvedBrief: {
          hypothesis: "We believe a quality-led headline will improve clickthrough rate.",
          whatIsChanging: ["headline copy", "CTA label"],
          successMetric: "Increase clickthrough rate",
          audienceSignal: "Returning shoppers",
        },
      },
      experimentId: "exp_123",
      stage: "brief_ready",
    });

    generateExperimentActionMock.mockResolvedValue({
      values: {
        ...baseValues,
        experimentId: "exp_123",
        approvedBrief: {
          hypothesis: "We believe a quality-led headline will improve clickthrough rate.",
          whatIsChanging: ["headline copy", "CTA label"],
          successMetric: "Increase clickthrough rate",
          audienceSignal: "Returning shoppers",
        },
      },
      experimentId: "exp_123",
      redirectTo: "/experiments/exp_123",
      stage: "generated",
    });
  });

  it("redirects unauthenticated users to login", async () => {
    requireUserSessionMock.mockImplementation(async () => {
      redirectMock("/login");
      throw new Error("NEXT_REDIRECT");
    });

    await expect(NewExperimentPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("renders the minimal builder UI", async () => {
    render(await NewExperimentPage());

    expect(
      screen.getByRole("heading", { name: "Create experiment" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Primary goal *")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Extra prompt *")).toBeInTheDocument();
    expect(screen.queryByText("Workflow stages")).not.toBeInTheDocument();
    expect(screen.queryByText("Brief preview")).not.toBeInTheDocument();
    expect(screen.queryByText("Pipeline controls")).not.toBeInTheDocument();
    expect(screen.queryByText("Step 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Step 2")).not.toBeInTheDocument();
    expect(screen.queryByText("Step 3")).not.toBeInTheDocument();
    expect(screen.queryByText("Storefront experiment setup")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate Output" })).toBeInTheDocument();
  });

  it("prepares the brief and routes to detail from a single generate action", async () => {
    render(await NewExperimentPage());

    fireEvent.change(screen.getByLabelText("Experiment name *"), {
      target: { value: "Spring hero banner test" },
    });
    fireEvent.change(screen.getByLabelText("Target audience *"), {
      target: { value: "Returning shoppers" },
    });
    fireEvent.change(screen.getByLabelText("Brand constraints *"), {
      target: { value: "Avoid discount framing" },
    });
    fireEvent.change(screen.getByLabelText("Seed context *"), {
      target: { value: "Feature lightweight outerwear" },
    });
    fireEvent.change(screen.getByLabelText("Extra prompt *"), {
      target: { value: "Generate three headlines that lead with quality." },
    });

    fireEvent.click(screen.getByRole("button", { name: "Generate Output" }));

    await waitFor(() => {
      expect(prepareExperimentBriefActionMock).toHaveBeenCalled();
      expect(generateExperimentActionMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/experiments/exp_123");
      expect(refreshMock).toHaveBeenCalled();
    });
  });
});
