import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  redirectMock,
  notFoundMock,
  requireUserSessionMock,
  getExperimentDetailForUserMock,
} = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  notFoundMock: vi.fn(),
  requireUserSessionMock: vi.fn(),
  getExperimentDetailForUserMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
  notFound: notFoundMock,
}));

vi.mock("@/lib/auth/session", () => ({
  requireUserSession: requireUserSessionMock,
  getServerSession: vi.fn().mockResolvedValue({
    user: { id: "user_1", email: "demo@example.com" },
  }),
}));

vi.mock("@/lib/repositories/experiment-repository", () => ({
  getExperimentDetailForUser: getExperimentDetailForUserMock,
}));

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({
    title,
    description,
    headerAction,
    children,
  }: {
    title: string;
    description: string;
    headerAction?: React.ReactNode;
    children?: React.ReactNode;
  }) => (
    <main>
      <h1>{title}</h1>
      <p>{description}</p>
      {headerAction}
      {children}
    </main>
  ),
}));

vi.mock("@/components/experiment-detail/rerun-controls", () => ({
  RerunControls: () => <button type="button">Regenerate</button>,
}));

import ExperimentDetailPage from "@/app/experiments/[id]/page";

describe("experiment detail page", () => {
  beforeEach(() => {
    redirectMock.mockReset();
    notFoundMock.mockReset();
    requireUserSessionMock.mockReset();
    getExperimentDetailForUserMock.mockReset();

    requireUserSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });
  });

  it("redirects unauthenticated users to login", async () => {
    requireUserSessionMock.mockImplementation(async () => {
      redirectMock("/login");
      throw new Error("NEXT_REDIRECT");
    });

    await expect(
      ExperimentDetailPage({ params: Promise.resolve({ id: "exp_123" }) }),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("renders the latest saved variants and generation history for an owned experiment", async () => {
    getExperimentDetailForUserMock.mockResolvedValue({
      id: "exp_123",
      name: "Holiday hero refresh",
      goal: "Increase clickthrough",
      pageType: "Homepage hero",
      targetAudience: "Gift buyers",
      tone: "Confident",
      brandConstraints: "Avoid discount language",
      seedContext: "Feature premium gifting",
      status: "generation_failed",
      updatedAt: new Date("2026-04-03T17:30:00.000Z"),
      latestGenerationRunId: "run_failed",
      latestGenerationRun: {
        id: "run_failed",
        status: "failed",
        startedAt: new Date("2026-04-03T17:30:00.000Z"),
        completedAt: new Date("2026-04-03T17:32:00.000Z"),
        errorMessage: "provider down",
      },
      latestSavedRun: {
        id: "run_success",
        status: "succeeded",
        startedAt: new Date("2026-04-02T14:00:00.000Z"),
        completedAt: new Date("2026-04-02T14:02:00.000Z"),
        variants: [
          {
            id: "variant_a",
            experimentId: "exp_123",
            generationRunId: "run_success",
            label: "Variant A",
            headline: "Curated gifts for every room",
            subheadline: "Give design-forward essentials",
            bodyCopy: "Launch a premium gifting collection with elevated copy.",
            ctaText: "Shop gifts",
            layoutNotes: "Left aligned hero",
            previewConfig: { align: "left", emphasis: "headline", theme: "linen" },
            position: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
      generationHistory: [
        {
          id: "run_failed",
          status: "failed",
          startedAt: new Date("2026-04-03T17:30:00.000Z"),
          completedAt: new Date("2026-04-03T17:32:00.000Z"),
          errorMessage: "provider down",
          variantCount: 0,
        },
        {
          id: "run_success",
          status: "succeeded",
          startedAt: new Date("2026-04-02T14:00:00.000Z"),
          completedAt: new Date("2026-04-02T14:02:00.000Z"),
          errorMessage: null,
          variantCount: 2,
        },
      ],
    });

    render(await ExperimentDetailPage({ params: Promise.resolve({ id: "exp_123" }) }));

    expect(getExperimentDetailForUserMock).toHaveBeenCalledWith("exp_123", "user_1");
    expect(
      screen.getByRole("heading", { level: 1, name: "Holiday hero refresh" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Latest saved variants")).toBeInTheDocument();
    expect(screen.getByText("Curated gifts for every room")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Latest generation failed: provider down",
    );
    expect(
      screen.getByText(/Showing variants from the most recent successful run/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Generation history")).toBeInTheDocument();
    expect(screen.getByText("Run run_failed")).toBeInTheDocument();
    expect(screen.getByText("Run run_success")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Regenerate" })).toHaveLength(1);
  });

  it("blocks unauthorized or missing experiment access with a safe not-found response", async () => {
    notFoundMock.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
    getExperimentDetailForUserMock.mockResolvedValue(null);

    await expect(
      ExperimentDetailPage({ params: Promise.resolve({ id: "exp_missing" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(getExperimentDetailForUserMock).toHaveBeenCalledWith("exp_missing", "user_1");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("renders a recoverable empty state when no saved variants exist yet", async () => {
    getExperimentDetailForUserMock.mockResolvedValue({
      id: "exp_123",
      name: "Holiday hero refresh",
      goal: "Increase clickthrough",
      pageType: "Homepage hero",
      targetAudience: "Gift buyers",
      tone: "Confident",
      brandConstraints: "",
      seedContext: null,
      status: "generation_failed",
      updatedAt: new Date("2026-04-03T17:30:00.000Z"),
      latestGenerationRunId: "run_failed",
      latestGenerationRun: {
        id: "run_failed",
        status: "failed",
        startedAt: new Date("2026-04-03T17:30:00.000Z"),
        completedAt: new Date("2026-04-03T17:32:00.000Z"),
        errorMessage: "response shape invalid",
      },
      latestSavedRun: null,
      generationHistory: [
        {
          id: "run_failed",
          status: "failed",
          startedAt: new Date("2026-04-03T17:30:00.000Z"),
          completedAt: new Date("2026-04-03T17:32:00.000Z"),
          errorMessage: "response shape invalid",
          variantCount: 0,
        },
      ],
    });

    render(await ExperimentDetailPage({ params: Promise.resolve({ id: "exp_123" }) }));

    expect(
      screen.getByRole("heading", { level: 2, name: "No saved variants yet" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Latest generation failed: response shape invalid",
    );
    expect(screen.getAllByRole("button", { name: "Regenerate" })).toHaveLength(2);
  });
});
