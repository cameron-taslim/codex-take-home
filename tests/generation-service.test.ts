import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateExperimentVariants } from "@/lib/codex/service";

const {
  mockTransaction,
  getExperimentForUser,
  createGenerationRun,
  markGenerationRunRunning,
  createVariants,
  completeGenerationRun,
  failGenerationRun,
  updateExperimentGenerationState,
} = vi.hoisted(() => ({
  mockTransaction: vi.fn(async (callback: (tx: object) => Promise<unknown>) =>
    callback({}),
  ),
  getExperimentForUser: vi.fn(),
  createGenerationRun: vi.fn(),
  markGenerationRunRunning: vi.fn(),
  createVariants: vi.fn(),
  completeGenerationRun: vi.fn(),
  failGenerationRun: vi.fn(),
  updateExperimentGenerationState: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: mockTransaction,
  },
}));

const experiment = {
  id: "exp_123",
  userId: "user_123",
  name: "Holiday push",
  goal: "Improve conversions",
  pageType: "Landing page",
  targetAudience: "Gift buyers",
  tone: "Energetic",
  brandConstraints: "No discount language",
  seedContext: "Hero campaign",
  status: "draft",
  latestGenerationRunId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock("@/lib/repositories/experiment-repository", () => ({
  getExperimentForUser,
  updateExperimentGenerationState,
}));

vi.mock("@/lib/repositories/generation-repository", () => ({
  createGenerationRun,
  markGenerationRunRunning,
  completeGenerationRun,
  failGenerationRun,
}));

vi.mock("@/lib/repositories/variant-repository", () => ({
  createVariants,
}));

describe("generateExperimentVariants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getExperimentForUser.mockResolvedValue(experiment);
    createGenerationRun.mockResolvedValue({ id: "run_123" });
  });

  it("persists variants and updates statuses for a successful generation", async () => {
    const provider = {
      generateVariants: vi.fn().mockResolvedValue({
        variants: [
          {
            label: "A",
            headline: "Headline A",
            subheadline: "Subheadline A",
            bodyCopy: "Body A",
            ctaText: "Shop now",
            layoutNotes: "Left aligned",
            previewConfig: { align: "left", emphasis: "headline", theme: "linen" },
          },
          {
            label: "B",
            headline: "Headline B",
            subheadline: "Subheadline B",
            bodyCopy: "Body B",
            ctaText: "Explore",
            layoutNotes: "Split layout",
            previewConfig: { align: "split", emphasis: "cta", theme: "charcoal" },
          },
        ],
      }),
    };

    await generateExperimentVariants({
      experimentId: "exp_123",
      userId: "user_123",
      provider,
    });

    expect(createGenerationRun).toHaveBeenCalled();
    expect(markGenerationRunRunning).toHaveBeenCalledWith({}, "run_123", "exp_123");
    expect(createVariants).toHaveBeenCalled();
    expect(completeGenerationRun).toHaveBeenCalledWith({}, "run_123", "exp_123");
    expect(failGenerationRun).not.toHaveBeenCalled();
  });

  it("records a failed run without persisting partial variants", async () => {
    const provider = {
      generateVariants: vi.fn().mockRejectedValue(new Error("provider down")),
    };

    await expect(
      generateExperimentVariants({
        experimentId: "exp_123",
        userId: "user_123",
        provider,
      }),
    ).rejects.toThrow("provider down");

    expect(failGenerationRun).toHaveBeenCalledWith(
      {},
      "run_123",
      "exp_123",
      "provider down",
    );
    expect(createVariants).not.toHaveBeenCalled();
    expect(updateExperimentGenerationState).toHaveBeenCalledWith({}, "exp_123", {
      status: "generation_failed",
      latestGenerationRunId: "run_123",
    });
  });
});
