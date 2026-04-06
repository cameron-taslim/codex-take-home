import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildPromptSnapshot, generateExperimentVariants, synthesizeExperimentBrief } from "@/lib/codex/service";

const {
  mockTransaction,
  transactionContexts,
  getExperimentForUser,
  storeApprovedBrief,
  createGenerationRun,
  markGenerationRunRunning,
  createVariants,
  persistGenerationRunResult,
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
  storeApprovedBrief: vi.fn(),
  createGenerationRun: vi.fn(),
  markGenerationRunRunning: vi.fn(),
  createVariants: vi.fn(),
  persistGenerationRunResult: vi.fn(),
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
      synthesizeBrief: vi.fn(),
      generateVariants: vi.fn(),
      generateLaunchConfig: vi.fn(),
    };
  }),
}));

const experiment = {
  id: "exp_123",
  userId: "user_123",
  name: "Spring hero banner test",
  goal: "Increase clickthrough rate",
  pageType: "Hero banner",
  trafficSplit: "50/50",
  targetAudience: "Returning shoppers",
  tone: "Editorial",
  brandConstraints: "Avoid discount framing",
  seedContext: "Feature lightweight outerwear",
  whatToTest: "Generate three quality-led headlines.",
  approvedBrief: {
    hypothesis: "We believe quality-led copy improves clickthrough rate.",
    whatIsChanging: ["headline copy", "CTA label"],
    successMetric: "Increase clickthrough rate",
    audienceSignal: "Returning shoppers",
  },
};

vi.mock("@/lib/repositories/experiment-repository", () => ({
  getExperimentForUser,
  storeApprovedBrief,
  markExperimentLive: vi.fn(),
}));

vi.mock("@/lib/repositories/generation-repository", () => ({
  createGenerationRun,
  markGenerationRunRunning,
  persistGenerationRunResult,
  completeGenerationRun,
  failGenerationRun,
}));

vi.mock("@/lib/repositories/variant-repository", () => ({
  createVariants,
}));

describe("generation service", () => {
  const originalCodexProviderMode = process.env.CODEX_PROVIDER_MODE;

  beforeEach(() => {
    vi.clearAllMocks();
    transactionContexts.length = 0;
    getExperimentForUser.mockResolvedValue(experiment);
    createGenerationRun.mockResolvedValue({ id: "run_123" });
    delete process.env.CODEX_PROVIDER_MODE;
  });

  afterEach(() => {
    if (originalCodexProviderMode === undefined) {
      delete process.env.CODEX_PROVIDER_MODE;
    } else {
      process.env.CODEX_PROVIDER_MODE = originalCodexProviderMode;
    }
  });

  it("normalizes the saved experiment brief into the new Codex input contract", () => {
    expect(buildPromptSnapshot(experiment as never)).toEqual({
      experimentName: "Spring hero banner test",
      componentType: "Hero banner",
      primaryGoal: "Increase clickthrough rate",
      trafficSplit: "50/50",
      targetAudience: "Returning shoppers",
      brandTone: "Editorial",
      brandConstraints: "Avoid discount framing",
      seedContext: "Feature lightweight outerwear",
      whatToTest: "Generate three quality-led headlines.",
    });
  });

  it("stores the synthesized brief before generation", async () => {
    const provider = {
      synthesizeBrief: vi.fn().mockResolvedValue({
        hypothesis: "We believe quality-led copy improves clickthrough rate.",
        whatIsChanging: ["headline copy", "CTA label"],
        successMetric: "Increase clickthrough rate",
        audienceSignal: "Returning shoppers",
      }),
      generateVariants: vi.fn(),
      generateLaunchConfig: vi.fn(),
    };

    const result = await synthesizeExperimentBrief({
      experimentId: "exp_123",
      userId: "user_123",
      provider,
    });

    expect(provider.synthesizeBrief).toHaveBeenCalled();
    expect(storeApprovedBrief).toHaveBeenCalledWith(
      { $transaction: mockTransaction },
      "exp_123",
      "user_123",
      result,
    );
  });

  it("persists one saved output and hidden config for a successful generation", async () => {
    const provider = {
      synthesizeBrief: vi.fn(),
      generateVariants: vi.fn().mockResolvedValue({
        variant: {
          label: "Quality-led",
          headline: "Wear what lasts",
          subheadline: "Crafted for the season ahead.",
          bodyCopy: "Leads with product materiality.",
          ctaText: "Explore now",
          layoutNotes: "Quality-led direction",
          previewConfig: {
            layout: "spotlight",
            emphasis: "headline",
            theme: "atelier-spring",
            assetSetKey: "atelier-spring",
          },
        },
      }),
      generateLaunchConfig: vi.fn().mockResolvedValue({
        variantIds: ["quality-led-1"],
        trafficSplit: "50/50",
        primaryMetric: "Increase clickthrough rate",
        featureFlagKey: "storefront-exp-spring-hero-banner-test",
        rolloutNotes: "Mocked config",
      }),
    };

    await generateExperimentVariants({
      experimentId: "exp_123",
      userId: "user_123",
      provider,
    });

    expect(provider.generateVariants).toHaveBeenCalled();
    expect(provider.generateLaunchConfig).toHaveBeenCalled();
    expect(createVariants).toHaveBeenCalled();
    expect(persistGenerationRunResult).toHaveBeenCalledWith(
      transactionContexts[1],
      "run_123",
      expect.objectContaining({
        approvedBrief: experiment.approvedBrief,
      }),
    );
    expect(completeGenerationRun).toHaveBeenCalled();
  });

  it("records a failed run without persisting malformed partial output", async () => {
    const provider = {
      synthesizeBrief: vi.fn(),
      generateVariants: vi.fn().mockRejectedValue(new Error("invalid structured response")),
      generateLaunchConfig: vi.fn(),
    };

    await expect(
      generateExperimentVariants({
        experimentId: "exp_123",
        userId: "user_123",
        provider,
      }),
    ).rejects.toThrow("invalid structured response");

    expect(failGenerationRun).toHaveBeenCalled();
    expect(createVariants).not.toHaveBeenCalled();
  });

  it("uses mocked generation by default when no provider mode is configured", async () => {
    const result = await generateExperimentVariants({
      experimentId: "exp_123",
      userId: "user_123",
    });

    expect(result).toEqual({
      runId: "run_123",
      variantCount: 1,
    });
    expect(openAIProviderConstructorMock).not.toHaveBeenCalled();
  });
});
