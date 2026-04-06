import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { parseMock, openAIConstructorMock, zodTextFormatMock } = vi.hoisted(() => ({
  parseMock: vi.fn(),
  openAIConstructorMock: vi.fn(),
  zodTextFormatMock: vi.fn(() => ({ type: "json_schema" })),
}));

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation((config: { apiKey: string }) => {
    openAIConstructorMock(config);
    return {
      responses: {
        parse: parseMock,
      },
    };
  }),
}));

vi.mock("openai/helpers/zod", () => ({
  zodTextFormat: zodTextFormatMock,
}));

describe("OpenAICodexProvider", () => {
  const originalOpenAIModel = process.env.OPENAI_MODEL;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.OPENAI_MODEL;
  });

  afterEach(() => {
    if (originalOpenAIModel === undefined) {
      delete process.env.OPENAI_MODEL;
      return;
    }

    process.env.OPENAI_MODEL = originalOpenAIModel;
  });

  it("uses the Codex model by default when no environment override is present", async () => {
    parseMock.mockResolvedValue({
      output_parsed: {
        hypothesis: "We believe a quality-led headline will improve clickthrough rate.",
        whatIsChanging: ["headline copy"],
        successMetric: "Increase clickthrough rate",
        audienceSignal: "Returning shoppers",
      },
    });

    const { OpenAICodexProvider } = await import("@/lib/codex/openai-provider");
    const provider = new OpenAICodexProvider("test-key");

    await provider.synthesizeBrief({
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

    expect(openAIConstructorMock).toHaveBeenCalledWith({ apiKey: "test-key" });
    expect(parseMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-5-codex",
      }),
    );
  });

  it("prefers the OPENAI_MODEL override when it is configured", async () => {
    process.env.OPENAI_MODEL = "codex-custom";
    parseMock.mockResolvedValue({
      output_parsed: {
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
      },
    });

    const { OpenAICodexProvider } = await import("@/lib/codex/openai-provider");
    const provider = new OpenAICodexProvider("test-key");

    await provider.generateVariants({
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

    expect(parseMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "codex-custom",
      }),
    );
  });
});
