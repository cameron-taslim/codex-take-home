import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  redirectMock,
  requireUserSessionMock,
  getAuthenticatedHomePathMock,
} = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  requireUserSessionMock: vi.fn(),
  getAuthenticatedHomePathMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/auth/session", () => ({
  requireUserSession: requireUserSessionMock,
}));

vi.mock("@/lib/navigation", () => ({
  getAuthenticatedHomePath: getAuthenticatedHomePathMock,
}));

import DashboardPage from "@/app/dashboard/page";

describe("dashboard page", () => {
  beforeEach(() => {
    redirectMock.mockReset();
    requireUserSessionMock.mockReset();
    getAuthenticatedHomePathMock.mockReset();
  });

  it("redirects unauthenticated access to login", async () => {
    requireUserSessionMock.mockImplementation(async () => {
      redirectMock("/login");
      throw new Error("NEXT_REDIRECT");
    });

    await expect(DashboardPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("redirects authenticated users to their experiment workspace", async () => {
    requireUserSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });
    getAuthenticatedHomePathMock.mockResolvedValue("/experiments/exp_newer");

    await DashboardPage();

    expect(getAuthenticatedHomePathMock).toHaveBeenCalledWith("user_1");
    expect(redirectMock).toHaveBeenCalledWith("/experiments/exp_newer");
  });
});
