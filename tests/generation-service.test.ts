import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
      generateVariants: vi.fn(),
    };
  }),
}));

const experiment = {
  id: "exp_123",
  userId: "user_123",
  name: "Spring hero banner test",
  pageType: "Hero banner",
  targetAudience: "Returning shoppers",
  tone: "Editorial",
  brandConstraints: "Avoid discount framing",
  seedContext: "Feature lightweight outerwear",
  whatToTest: "Generate three quality-led headlines.",
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

describe("generation service", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalApiKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    transactionContexts.length = 0;
    getExperimentForUser.mockResolvedValue(experiment);
    createGenerationRun.mockResolvedValue({ id: "run_123" });
    process.env.NODE_ENV = "test";
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    if (originalApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalApiKey;
    }
  });

  it("normalizes the saved experiment brief into the new Codex input contract", () => {
    expect(buildPromptSnapshot(experiment as never)).toEqual({
      experimentName: "Spring hero banner test",
      componentType: "Hero banner",
      targetAudience: "Returning shoppers",
      brandTone: "Editorial",
      brandConstraints: "Avoid discount framing",
      seedContext: "Feature lightweight outerwear",
      whatToTest: "Generate three quality-led headlines.",
    });
  });

  it("persists one saved output for a successful generation", async () => {
    const provider = {
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
    };

    await generateExperimentVariants({
      experimentId: "exp_123",
      userId: "user_123",
      provider,
    });

    expect(provider.generateVariants).toHaveBeenCalled();
    expect(createVariants).toHaveBeenCalled();
    expect(completeGenerationRun).toHaveBeenCalled();
  });

  it("records a failed run without persisting malformed partial output", async () => {
    const provider = {
      generateVariants: vi.fn().mockRejectedValue(new Error("invalid structured response")),
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

  it("uses mocked generation by default in unit tests", async () => {
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

  it("uses the OpenAI provider when not running unit tests and an API key exists", async () => {
    process.env.NODE_ENV = "development";
    process.env.OPENAI_API_KEY = "test-key";

    const generateVariantsMock = vi.fn().mockResolvedValue({
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
    });

    const { OpenAICodexProvider } = await import("@/lib/codex/openai-provider");
    vi.mocked(OpenAICodexProvider).mockImplementationOnce((apiKey: string) => {
      openAIProviderConstructorMock(apiKey);
      return {
        generateVariants: generateVariantsMock,
      } as never;
    });

    await generateExperimentVariants({
      experimentId: "exp_123",
      userId: "user_123",
    });

    expect(openAIProviderConstructorMock).toHaveBeenCalledWith("test-key");
    expect(generateVariantsMock).toHaveBeenCalled();
  });
});
