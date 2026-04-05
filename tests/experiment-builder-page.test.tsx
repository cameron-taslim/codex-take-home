import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  pushMock,
  refreshMock,
  redirectMock,
  requireUserSessionMock,
  saveDraftExperimentActionMock,
  prepareExperimentBriefActionMock,
  generateExperimentActionMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  redirectMock: vi.fn(),
  requireUserSessionMock: vi.fn(),
  saveDraftExperimentActionMock: vi.fn(),
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
  saveDraftExperimentAction: saveDraftExperimentActionMock,
  prepareExperimentBriefAction: prepareExperimentBriefActionMock,
  generateExperimentAction: generateExperimentActionMock,
}));

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

import NewExperimentPage from "@/app/experiments/new/page";

const baseValues = {
  name: "Spring hero banner test",
  componentType: "Hero banner",
  primaryGoal: "Increase clickthrough rate",
  trafficSplit: "50/50" as const,
  targetAudience: "Returning shoppers",
  brandTone: "Editorial",
  brandConstraints: "Avoid discount framing",
  lockedElements: ["Lock hero image", "Lock logo"],
  seedContext: "Feature lightweight outerwear",
  whatToTest: "Generate three headlines that lead with quality.",
};

describe("experiment builder page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    requireUserSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });

    saveDraftExperimentActionMock.mockResolvedValue({
      values: { ...baseValues, experimentId: "exp_123" },
      experimentId: "exp_123",
      savedMessage: "Draft saved. Keep refining the brief or analyze it when ready.",
      stage: "draft",
    });

    prepareExperimentBriefActionMock.mockResolvedValue({
      values: {
        ...baseValues,
        experimentId: "exp_123",
        approvedBrief: {
          hypothesis: "We believe a quality-led headline will improve clickthrough rate.",
          whatIsChanging: ["headline copy", "CTA label"],
          whatIsLocked: ["hero image", "logo"],
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
          whatIsLocked: ["hero image", "logo"],
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

  it("renders the staged merchandiser workflow", async () => {
    render(await NewExperimentPage());

    expect(
      screen.getByRole("heading", { name: "Create experiment" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Draft" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Analyze Inputs" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Approve Brief & Generate Output" }),
    ).toBeDisabled();
  });

  it("saves a draft with merchandiser inputs", async () => {
    render(await NewExperimentPage());

    fireEvent.change(screen.getByLabelText("Experiment name *"), {
      target: { value: "Spring hero banner test" },
    });
    fireEvent.change(screen.getByLabelText("Brand constraints *"), {
      target: { value: "Avoid discount framing" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Draft" }));

    await waitFor(() => {
      expect(saveDraftExperimentActionMock).toHaveBeenCalled();
    });

    expect(
      await screen.findByText("Draft saved. Keep refining the brief or analyze it when ready."),
    ).toBeInTheDocument();
  });

  it("shows the synthesized brief after analysis", async () => {
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
    fireEvent.change(screen.getByLabelText("What to test *"), {
      target: { value: "Generate three headlines that lead with quality." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Analyze Inputs" }));

    await waitFor(() => {
      expect(prepareExperimentBriefActionMock).toHaveBeenCalled();
    });

    expect(await screen.findByText("Brief confirmation")).toBeInTheDocument();
    expect(
      screen.getByText("We believe a quality-led headline will improve clickthrough rate."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Approve Brief & Generate Output" }),
    ).toBeEnabled();
  });

  it("routes to detail after approved generation", async () => {
    render(await NewExperimentPage());

    fireEvent.click(screen.getByRole("button", { name: "Analyze Inputs" }));

    await screen.findByText("Brief confirmation");

    fireEvent.click(
      screen.getByRole("button", { name: "Approve Brief & Generate Output" }),
    );

    await waitFor(() => {
      expect(generateExperimentActionMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/experiments/exp_123");
      expect(refreshMock).toHaveBeenCalled();
    });
  });
});
