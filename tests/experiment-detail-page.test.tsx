import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  redirectMock,
  notFoundMock,
  requireUserSessionMock,
  getExperimentDetailForUserMock,
  generateExperimentSuggestionsMock,
} = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  notFoundMock: vi.fn(),
  requireUserSessionMock: vi.fn(),
  getExperimentDetailForUserMock: vi.fn(),
  generateExperimentSuggestionsMock: vi.fn(),
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

vi.mock("@/lib/codex/service", () => ({
  generateExperimentSuggestions: generateExperimentSuggestionsMock,
}));

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({
    title,
    description,
    headerAction,
    customHeader,
    children,
  }: {
    title: string;
    description: string;
    headerAction?: React.ReactNode;
    customHeader?: React.ReactNode;
    children?: React.ReactNode;
  }) => (
    <main>
      <h1>{title}</h1>
      <p>{description}</p>
      {headerAction}
      {customHeader}
      {children}
    </main>
  ),
}));

vi.mock("@/components/experiment-detail/rerun-controls", () => ({
  RerunControls: ({
    suggestions,
  }: {
    suggestions: Array<{ title: string }>;
  }) => (
    <section>
      <h2>AI suggestions</h2>
      {suggestions.map((suggestion) => (
        <p key={suggestion.title}>{suggestion.title}</p>
      ))}
      <h3>Custom prompt</h3>
      <button type="button">Generate output</button>
    </section>
  ),
}));

vi.mock("@/components/experiment-detail/detail-header", () => ({
  ExperimentDetailHeader: ({
    title,
  }: {
    title: string;
  }) => (
    <section>
      <h2>{title}</h2>
      <button type="button" aria-expanded={false}>
        Expand overview
      </button>
    </section>
  ),
}));

vi.mock("@/components/experiment-detail/results-panel", () => ({
  ExperimentResultsPanel: ({ experiment }: { experiment: { activeSavedRun: { variants: Array<{ headline: string }> } } }) => (
    <section>
      {experiment.activeSavedRun.variants.map((variant) => (
        <p key={variant.headline}>{variant.headline}</p>
      ))}
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
    generateExperimentSuggestionsMock.mockResolvedValue([
      { title: "Sharper headline", prompt: "Make the headline sharper for returning shoppers." },
      { title: "CTA shift", prompt: "Use a higher-intent CTA for repeat visitors." },
      { title: "Proof cue", prompt: "Add one proof cue without discount language." },
      { title: "Benefit frame", prompt: "Push a more benefit-led editorial angle." },
      { title: "Fresh concept", prompt: "Try a new concept while keeping brand constraints." },
    ]);
  });

  it("redirects unauthenticated users to login", async () => {
    requireUserSessionMock.mockImplementation(async () => {
      redirectMock("/login");
      throw new Error("NEXT_REDIRECT");
    });

    await expect(
      ExperimentDetailPage({
        params: Promise.resolve({ id: "exp_123" }),
      }),
    ).rejects.toThrow("NEXT_REDIRECT");
  });

  it("renders the collapsed overview control, saved preview, and rerun controls", async () => {
    getExperimentDetailForUserMock.mockResolvedValue({
      id: "exp_123",
      name: "Spring hero banner test",
      pageType: "Hero banner",
      targetAudience: "Returning shoppers",
      tone: "Editorial",
      brandConstraints: "Avoid discount framing",
      seedContext: "Feature lightweight outerwear",
      whatToTest: "Generate three quality-led headlines.",
      status: "generated",
      latestGenerationRunId: "run_success",
      latestGenerationRun: {
        id: "run_success",
        status: "succeeded",
        startedAt: new Date("2026-04-03T17:30:00.000Z"),
        completedAt: new Date("2026-04-03T17:32:00.000Z"),
        errorMessage: null,
      },
      latestSavedRun: {
        id: "run_success",
        status: "succeeded",
        startedAt: new Date("2026-04-03T17:30:00.000Z"),
        completedAt: new Date("2026-04-03T17:32:00.000Z"),
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
            htmlContent: "<section><h1>Wear what lasts</h1></section>",
            layoutNotes: "Quality-led direction",
            position: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
    });

    render(
      await ExperimentDetailPage({
        params: Promise.resolve({ id: "exp_123" }),
      }),
    );

    expect(screen.getByRole("button", { name: "Expand overview" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByText("Wear what lasts")).toBeInTheDocument();
    expect(screen.getByText("AI suggestions")).toBeInTheDocument();
    expect(screen.getByText("Custom prompt")).toBeInTheDocument();
  });

  it("blocks unauthorized or missing experiment access with a safe not-found response", async () => {
    notFoundMock.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
    getExperimentDetailForUserMock.mockResolvedValue(null);

    await expect(
      ExperimentDetailPage({
        params: Promise.resolve({ id: "exp_missing" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders an empty state when no output exists yet", async () => {
    getExperimentDetailForUserMock.mockResolvedValue({
      id: "exp_123",
      name: "Spring hero banner test",
      pageType: "Hero banner",
      targetAudience: "Returning shoppers",
      tone: "Editorial",
      brandConstraints: "Avoid discount framing",
      seedContext: "Feature lightweight outerwear",
      whatToTest: "Generate three quality-led headlines.",
      status: "draft",
      latestGenerationRunId: null,
      latestGenerationRun: null,
      latestSavedRun: null,
    });

    render(
      await ExperimentDetailPage({
        params: Promise.resolve({ id: "exp_123" }),
      }),
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "No saved output yet" }),
    ).toBeInTheDocument();
  });
});
