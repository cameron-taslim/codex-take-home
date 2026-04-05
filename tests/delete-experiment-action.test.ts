import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  revalidatePathMock,
  getServerSessionMock,
  deleteExperimentForUserMock,
} = vi.hoisted(() => ({
  revalidatePathMock: vi.fn(),
  getServerSessionMock: vi.fn(),
  deleteExperimentForUserMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/auth/session", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/lib/repositories/experiment-repository", () => ({
  deleteExperimentForUser: deleteExperimentForUserMock,
}));

import { deleteExperimentAction } from "@/app/actions/delete-experiment";

describe("delete experiment action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an auth error when the session is missing", async () => {
    getServerSessionMock.mockResolvedValue(null);

    await expect(deleteExperimentAction("exp_123")).resolves.toEqual({
      formError: "Your session expired. Sign in again to delete this experiment.",
    });
  });

  it("deletes an owned experiment and revalidates shell-backed routes", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });
    deleteExperimentForUserMock.mockResolvedValue({ id: "exp_123" });

    await expect(deleteExperimentAction("exp_123")).resolves.toEqual({ ok: true });

    expect(deleteExperimentForUserMock).toHaveBeenCalledWith("exp_123", "user_1");
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard");
    expect(revalidatePathMock).toHaveBeenCalledWith("/experiments/exp_123");
  });
});
