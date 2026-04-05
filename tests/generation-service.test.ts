import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ExperimentStatus } from "@prisma/client";
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

const openAIProviderConstructorMock = vi.fn();

vi.mock("@/lib/codex/openai-provider", () => ({
  OpenAICodexProvider: vi.fn().mockImplementation((apiKey: string) => {
    openAIProviderConstructorMock(apiKey);

    return {
      generateVariants: vi.fn().mockResolvedValue({
        variants: [
          {
            label: "Provider A",
            headline: "Provider headline",
            subheadline: "Provider subheadline",
            bodyCopy: "Provider body",
            ctaText: "Provider CTA",
            layoutNotes: "Provider layout",
            previewConfig: { align: "center", emphasis: "headline", theme: "linen" },
          },
          {
            label: "Provider B",
            headline: "Provider headline B",
            subheadline: "Provider subheadline B",
            bodyCopy: "Provider body B",
            ctaText: "Provider CTA B",
            layoutNotes: "Provider layout B",
            previewConfig: { align: "split", emphasis: "cta", theme: "charcoal" },
          },
        ],
      }),
    };
  }),
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
  status: "draft" as ExperimentStatus,
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
  const originalCodexProviderMode = process.env.CODEX_PROVIDER_MODE;
  const originalOpenAIApiKey = process.env.OPENAI_API_KEY;
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
    delete process.env.CODEX_PROVIDER_MODE;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    if (originalCodexProviderMode === undefined) {
      delete process.env.CODEX_PROVIDER_MODE;
    } else {
      process.env.CODEX_PROVIDER_MODE = originalCodexProviderMode;
    }

    if (originalOpenAIApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalOpenAIApiKey;
    }
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

  it("uses mock variants by default when no provider mode is configured", async () => {
    const result = await generateExperimentVariants({
      experimentId: "exp_123",
      userId: "user_123",
    });

    expect(result).toEqual({
      runId: "run_123",
      variantCount: 2,
    });
    expect(createVariants).toHaveBeenCalledWith(
      transactionContexts[1],
      "exp_123",
      "run_123",
      expect.arrayContaining([
        expect.objectContaining({
          label: "Variant A",
          headline: "Holiday push: editorial hero",
          position: 0,
        }),
        expect.objectContaining({
          label: "Variant B",
          headline: "Holiday push: conversion-led split",
          position: 1,
        }),
      ]),
    );
    expect(openAIProviderConstructorMock).not.toHaveBeenCalled();
  });

  it("uses the OpenAI provider only when CODEX_PROVIDER_MODE is openai", async () => {
    process.env.CODEX_PROVIDER_MODE = "openai";
    process.env.OPENAI_API_KEY = "test-key";

    const result = await generateExperimentVariants({
      experimentId: "exp_123",
      userId: "user_123",
    });

    expect(result).toEqual({
      runId: "run_123",
      variantCount: 2,
    });
    expect(openAIProviderConstructorMock).toHaveBeenCalledWith("test-key");
    expect(createVariants).toHaveBeenCalledWith(
      transactionContexts[1],
      "exp_123",
      "run_123",
      expect.arrayContaining([
        expect.objectContaining({
          label: "Provider A",
          headline: "Provider headline",
          position: 0,
        }),
        expect.objectContaining({
          label: "Provider B",
          headline: "Provider headline B",
          position: 1,
        }),
      ]),
    );
  });
});
