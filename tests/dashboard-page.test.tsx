import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireUserSessionMock,
  listExperimentsForUserMock,
} = vi.hoisted(() => ({
  requireUserSessionMock: vi.fn(),
  listExperimentsForUserMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  requireUserSession: requireUserSessionMock,
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
    requireUserSessionMock.mockReset();
    listExperimentsForUserMock.mockReset();
  });

  it("redirects unauthenticated access to login", async () => {
    requireUserSessionMock.mockImplementation(async () => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(DashboardPage()).rejects.toThrow("NEXT_REDIRECT");
  });

  it("renders saved experiments in descending updated order with a create action", async () => {
    requireUserSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });
    listExperimentsForUserMock.mockResolvedValue([
      {
        id: "exp_newer",
        name: "Newest experiment",
        status: "generated",
        pageType: "Hero banner",
        updatedAt: new Date("2026-04-05T10:00:00.000Z"),
        latestGenerationRun: { status: "succeeded" },
      },
      {
        id: "exp_older",
        name: "Older experiment",
        status: "draft",
        pageType: "Landing page",
        updatedAt: new Date("2026-04-04T10:00:00.000Z"),
        latestGenerationRun: null,
      },
    ]);

    render(await DashboardPage());

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create New Experiment" })).toHaveAttribute(
      "href",
      "/experiments/new",
    );
    const experimentRows = screen.getAllByRole("listitem");
    expect(experimentRows[0]).toHaveAttribute("href", "/experiments/exp_newer");
    expect(experimentRows[1]).toHaveAttribute("href", "/experiments/exp_older");
    expect(experimentRows[0]).toHaveTextContent("Newest experiment");
    expect(experimentRows[1]).toHaveTextContent("Older experiment");
  });

  it("renders the empty state when no experiments exist", async () => {
    requireUserSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });
    listExperimentsForUserMock.mockResolvedValue([]);

    render(await DashboardPage());

    expect(screen.getByText("Create your first experiment")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Create New Experiment" })).toHaveLength(2);
  });
});
