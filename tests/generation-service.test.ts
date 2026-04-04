import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildPromptSnapshot, generateExperimentVariants } from "@/lib/codex/service";

const {
  mockTransaction,
  transactionContexts,
  getExperimentForUser,
  createGenerationRun,
  markGenerationRunRunning,
  createVariants,
  completeGenerationRun,
  failGenerationRun,
} = vi.hoisted(() => ({
  transactionContexts: [] as Array<{ id: string }>,
  mockTransaction: vi.fn(async (callback: (tx: { id: string }) => Promise<unknown>) => {
    const tx = { id: `tx_${Math.random().toString(36).slice(2, 8)}` };
    transactionContexts.push(tx);
    return callback(tx);
  }),
  getExperimentForUser: vi.fn(),
  createGenerationRun: vi.fn(),
  markGenerationRunRunning: vi.fn(),
  createVariants: vi.fn(),
  completeGenerationRun: vi.fn(),
  failGenerationRun: vi.fn(),
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
  const expectedPromptSnapshot = {
    experimentName: "Holiday push",
    goal: "Improve conversions",
    pageType: "Landing page",
    targetAudience: "Gift buyers",
    tone: "Energetic",
    brandConstraints: "No discount language",
    seedContext: "Hero campaign",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    transactionContexts.length = 0;
    getExperimentForUser.mockResolvedValue(experiment);
    createGenerationRun.mockResolvedValue({ id: "run_123" });
  });

  it("normalizes the saved experiment brief into the Codex input contract", () => {
    expect(buildPromptSnapshot(experiment)).toEqual(expectedPromptSnapshot);
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

    expect(createGenerationRun).toHaveBeenCalledWith(transactionContexts[0], {
      experimentId: "exp_123",
      promptSnapshot: expectedPromptSnapshot,
    });
    expect(provider.generateVariants).toHaveBeenCalledWith(expectedPromptSnapshot);
    expect(provider.generateVariants.mock.calls[0]?.[0]).toBe(
      createGenerationRun.mock.calls[0]?.[1]?.promptSnapshot,
    );
    expect(mockTransaction).toHaveBeenCalledTimes(2);
    expect(markGenerationRunRunning).toHaveBeenCalledWith(
      transactionContexts[0],
      "run_123",
      "exp_123",
    );
    expect(createVariants).toHaveBeenCalled();
    expect(completeGenerationRun).toHaveBeenCalledWith(
      transactionContexts[1],
      "run_123",
      "exp_123",
    );
    expect(failGenerationRun).not.toHaveBeenCalled();
  });

  it("records a failed run without persisting malformed partial variants", async () => {
    const provider = {
      generateVariants: vi
        .fn()
        .mockRejectedValue(new Error("Codex returned an invalid structured response.")),
    };

    await expect(
      generateExperimentVariants({
        experimentId: "exp_123",
        userId: "user_123",
        provider,
      }),
    ).rejects.toThrow("Codex returned an invalid structured response.");

    expect(mockTransaction).toHaveBeenCalledTimes(2);
    expect(createGenerationRun).toHaveBeenCalledWith(transactionContexts[0], {
      experimentId: "exp_123",
      promptSnapshot: expectedPromptSnapshot,
    });
    expect(provider.generateVariants).toHaveBeenCalledWith(expectedPromptSnapshot);
    expect(failGenerationRun).toHaveBeenCalledWith(
      transactionContexts[1],
      "run_123",
      "exp_123",
      "Codex returned an invalid structured response.",
    );
    expect(createVariants).not.toHaveBeenCalled();
    expect(completeGenerationRun).not.toHaveBeenCalled();
    expect(markGenerationRunRunning).toHaveBeenCalledWith(
      transactionContexts[0],
      "run_123",
      "exp_123",
    );
  });
});
