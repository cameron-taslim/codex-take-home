import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  redirectMock,
  requireUserSessionMock,
  listExperimentsForUserMock,
} = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  requireUserSessionMock: vi.fn(),
  listExperimentsForUserMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/auth/session", () => ({
  requireUserSession: requireUserSessionMock,
  getServerSession: vi.fn().mockResolvedValue({
    user: { id: "user_1", email: "demo@example.com" },
  }),
}));

vi.mock("@/lib/repositories/experiment-repository", () => ({
  listExperimentsForUser: listExperimentsForUserMock,
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

import DashboardPage from "@/app/dashboard/page";

describe("dashboard page", () => {
  beforeEach(() => {
    redirectMock.mockReset();
    requireUserSessionMock.mockReset();
    listExperimentsForUserMock.mockReset();
  });

  it("redirects unauthenticated access to login", async () => {
    requireUserSessionMock.mockImplementation(async () => {
      redirectMock("/login");
      throw new Error("NEXT_REDIRECT");
    });

    await expect(DashboardPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("renders persisted experiments in descending updated order", async () => {
    requireUserSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });
    listExperimentsForUserMock.mockResolvedValue([
      {
        id: "exp_newer",
        name: "Holiday hero refresh",
        status: "live",
        pageType: "Homepage hero",
        trafficSplit: "70/30",
        updatedAt: new Date("2026-04-02T15:00:00.000Z"),
        latestGenerationRun: { status: "succeeded" },
      },
      {
        id: "exp_older",
        name: "PDP urgency experiment",
        status: "draft",
        pageType: "Product detail page",
        trafficSplit: "50/50",
        updatedAt: new Date("2026-03-30T10:00:00.000Z"),
        latestGenerationRun: null,
      },
    ]);

    render(await DashboardPage());

    expect(listExperimentsForUserMock).toHaveBeenCalledWith("user_1");
    const experimentRows = screen.getAllByRole("listitem");
    const newerExperimentLink = experimentRows[0];
    const olderExperimentLink = experimentRows[1];

    expect(newerExperimentLink).toHaveAttribute("href", "/experiments/exp_newer");
    expect(olderExperimentLink).toHaveAttribute("href", "/experiments/exp_older");
    expect(newerExperimentLink).toHaveTextContent("Holiday hero refresh");
    expect(newerExperimentLink).toHaveTextContent("Live");
    expect(newerExperimentLink).toHaveTextContent("70/30 traffic split");
    expect(olderExperimentLink).toHaveTextContent("PDP urgency experiment");
    expect(olderExperimentLink).toHaveTextContent("Draft");
  });

  it("renders the empty state when no experiments exist", async () => {
    requireUserSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });
    listExperimentsForUserMock.mockResolvedValue([]);

    render(await DashboardPage());

    expect(
      screen.getByRole("heading", { level: 2, name: "Create your first experiment" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Create New Experiment" })[0],
    ).toHaveAttribute("href", "/experiments/new");
  });

  it("shows a recoverable page-level error when data loading fails", async () => {
    requireUserSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });
    listExperimentsForUserMock.mockRejectedValue(new Error("database unavailable"));

    render(await DashboardPage());

    expect(screen.getByRole("alert")).toHaveTextContent(
      "We couldn't load your experiments right now. Reload the page to try again.",
    );
  });

  it("points the create action to the builder route", async () => {
    requireUserSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });
    listExperimentsForUserMock.mockResolvedValue([]);

    render(await DashboardPage());

    for (const link of screen.getAllByRole("link", {
      name: "Create New Experiment",
    })) {
      expect(link).toHaveAttribute("href", "/experiments/new");
    }
  });
});
