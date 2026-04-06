import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getServerSessionMock,
  generateExperimentVariantsMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  generateExperimentVariantsMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/auth/session", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/lib/codex/service", () => ({
  generateExperimentVariants: generateExperimentVariantsMock,
}));

import { rerunExperimentAction } from "@/app/experiments/[id]/actions";

describe("experiment detail actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a recoverable auth error when the session is missing", async () => {
    getServerSessionMock.mockResolvedValue(null);

    await expect(rerunExperimentAction("exp_123")).resolves.toEqual({
      formError: "Your session expired. Sign in again to regenerate output.",
    });
  });

  it("reruns generation from the saved experiment brief and revalidates detail data", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });
    generateExperimentVariantsMock.mockResolvedValue({
      runId: "run_456",
      variantCount: 1,
    });

    await expect(rerunExperimentAction("exp_123")).resolves.toEqual({ ok: true });

    expect(generateExperimentVariantsMock).toHaveBeenCalledWith({
      experimentId: "exp_123",
      userId: "user_1",
    });
  });

  it("passes custom rerun guidance when provided", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });
    generateExperimentVariantsMock.mockResolvedValue({
      runId: "run_789",
      variantCount: 1,
    });

    await expect(
      rerunExperimentAction(
        "exp_123",
        "Push a more urgency-led CTA while keeping the editorial tone.",
      ),
    ).resolves.toEqual({ ok: true });

    expect(generateExperimentVariantsMock).toHaveBeenCalledWith({
      experimentId: "exp_123",
      userId: "user_1",
      promptOverride: "Push a more urgency-led CTA while keeping the editorial tone.",
    });
  });
});
