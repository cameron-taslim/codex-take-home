import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getServerSessionMock,
  generateExperimentVariantsMock,
  launchExperimentMock,
  revalidatePathMock,
  mockTransaction,
  updateVariantCopyMock,
} = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  generateExperimentVariantsMock: vi.fn(),
  launchExperimentMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  mockTransaction: vi.fn(async (callback: (tx: { id: string }) => Promise<unknown>) =>
    callback({ id: "tx_123" }),
  ),
  updateVariantCopyMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/auth/session", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: mockTransaction,
  },
}));

vi.mock("@/lib/codex/service", () => ({
  generateExperimentVariants: generateExperimentVariantsMock,
  launchExperiment: launchExperimentMock,
}));

vi.mock("@/lib/repositories/variant-repository", () => ({
  updateVariantCopy: updateVariantCopyMock,
}));

import {
  launchExperimentAction,
  rerunExperimentAction,
  updateVariantCopyAction,
} from "@/app/experiments/[id]/actions";

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

  it("updates saved variant copy inline", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });

    await expect(
      updateVariantCopyAction({
        experimentId: "exp_123",
        variantId: "var_123",
        headline: "Wear what lasts",
        subheadline: "Crafted for the season ahead.",
        ctaText: "Explore now",
        rationale: "Leads with product materiality.",
      }),
    ).resolves.toEqual({ ok: true });

    expect(updateVariantCopyMock).toHaveBeenCalledWith(
      { id: "tx_123" },
      expect.objectContaining({
        experimentId: "exp_123",
        variantId: "var_123",
        ctaText: "Explore now",
      }),
    );
  });

  it("launches the experiment and revalidates views", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });
    launchExperimentMock.mockResolvedValue({});

    await expect(
      launchExperimentAction({
        experimentId: "exp_123",
        launchAt: "2026-04-10T09:00",
        launchMetric: "Increase clickthrough rate",
      }),
    ).resolves.toEqual({ ok: true });

    expect(launchExperimentMock).toHaveBeenCalledWith({
      experimentId: "exp_123",
      userId: "user_1",
      launchAt: "2026-04-10T09:00",
      launchMetric: "Increase clickthrough rate",
    });
  });
});
