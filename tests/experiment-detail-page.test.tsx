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

vi.mock("@/components/experiment-detail/results-panel", () => ({
  ExperimentResultsPanel: ({ experiment }: { experiment: { latestSavedRun: { variants: Array<{ headline: string }> } } }) => (
    <section>
      <h2>Live creative directions</h2>
      {experiment.latestSavedRun.variants.map((variant) => (
        <p key={variant.headline}>{variant.headline}</p>
      ))}
      <button type="button">Launch Experiment</button>
    </section>
  ),
}));

import ExperimentDetailPage from "@/app/experiments/[id]/page";

describe("experiment detail page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });

  it("renders the approved brief, live previews, and generation history", async () => {
    getExperimentDetailForUserMock.mockResolvedValue({
      id: "exp_123",
      name: "Spring hero banner test",
      goal: "Increase clickthrough rate",
      pageType: "Hero banner",
      trafficSplit: "50/50",
      targetAudience: "Returning shoppers",
      tone: "Editorial",
      brandConstraints: "Avoid discount framing",
      seedContext: "Feature lightweight outerwear",
      whatToTest: "Generate three quality-led headlines.",
      variantCount: 3,
      lockedElements: ["Lock hero image", "Lock logo"],
      approvedBrief: {
        hypothesis: "We believe stronger quality-led copy will improve clickthrough rate.",
        whatIsChanging: ["headline copy", "CTA label"],
        whatIsLocked: ["hero image", "logo"],
        successMetric: "Increase clickthrough rate",
        audienceSignal: "Returning shoppers",
      },
      launchMetric: null,
      launchAt: null,
      launchConfig: null,
      brandAssetSetKey: "atelier-spring",
      status: "generated",
      latestGenerationRunId: "run_success",
      latestGenerationRun: {
        id: "run_success",
        status: "succeeded",
        startedAt: new Date("2026-04-03T17:30:00.000Z"),
        completedAt: new Date("2026-04-03T17:32:00.000Z"),
        errorMessage: null,
        resultSnapshot: null,
      },
      latestSavedRun: {
        id: "run_success",
        status: "succeeded",
        startedAt: new Date("2026-04-03T17:30:00.000Z"),
        completedAt: new Date("2026-04-03T17:32:00.000Z"),
        resultSnapshot: null,
        variants: [
          {
            id: "variant_a",
            experimentId: "exp_123",
            generationRunId: "run_success",
            label: "Quality-led",
            headline: "Wear what lasts",
            subheadline: "Crafted for the season ahead",
            bodyCopy: "Leads with product materiality.",
            ctaText: "Explore now",
            layoutNotes: "Quality-led direction",
            previewConfig: {
              layout: "spotlight",
              emphasis: "headline",
              theme: "atelier-spring",
              assetSetKey: "atelier-spring",
              lockedElements: ["Lock hero image", "Lock logo"],
            },
            position: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
      generationHistory: [
        {
          id: "run_success",
          status: "succeeded",
          startedAt: new Date("2026-04-03T17:30:00.000Z"),
          completedAt: new Date("2026-04-03T17:32:00.000Z"),
          errorMessage: null,
          variantCount: 3,
        },
      ],
    });

    render(await ExperimentDetailPage({ params: Promise.resolve({ id: "exp_123" }) }));

    expect(screen.getByText("Approved brief")).toBeInTheDocument();
    expect(
      screen.getByText("We believe stronger quality-led copy will improve clickthrough rate."),
    ).toBeInTheDocument();
    expect(screen.getByText("Live creative directions")).toBeInTheDocument();
    expect(screen.getByText("Wear what lasts")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Launch Experiment" })).toBeInTheDocument();
    expect(screen.getByText("Generation history")).toBeInTheDocument();
  });

  it("blocks unauthorized or missing experiment access with a safe not-found response", async () => {
    notFoundMock.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
    getExperimentDetailForUserMock.mockResolvedValue(null);

    await expect(
      ExperimentDetailPage({ params: Promise.resolve({ id: "exp_missing" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders an empty state when no variants exist yet", async () => {
    getExperimentDetailForUserMock.mockResolvedValue({
      id: "exp_123",
      name: "Spring hero banner test",
      goal: "Increase clickthrough rate",
      pageType: "Hero banner",
      trafficSplit: "50/50",
      targetAudience: "Returning shoppers",
      tone: "Editorial",
      brandConstraints: "Avoid discount framing",
      seedContext: "Feature lightweight outerwear",
      whatToTest: "Generate three quality-led headlines.",
      variantCount: 3,
      lockedElements: ["Lock hero image", "Lock logo"],
      approvedBrief: null,
      launchMetric: null,
      launchAt: null,
      launchConfig: null,
      brandAssetSetKey: "atelier-spring",
      status: "draft",
      latestGenerationRunId: null,
      latestGenerationRun: null,
      latestSavedRun: null,
      generationHistory: [],
    });

    render(await ExperimentDetailPage({ params: Promise.resolve({ id: "exp_123" }) }));

    expect(
      screen.getByRole("heading", { level: 2, name: "No saved variants yet" }),
    ).toBeInTheDocument();
  });
});
