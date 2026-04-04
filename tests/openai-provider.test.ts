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
    parseMock.mockReset();
    openAIConstructorMock.mockReset();
    zodTextFormatMock.mockClear();
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
      output_parsed: { variants: [] },
    });

    const { OpenAICodexProvider } = await import("@/lib/codex/openai-provider");
    const provider = new OpenAICodexProvider("test-key");

    await provider.generateVariants({
      experimentName: "Holiday push",
      goal: "Improve conversions",
      pageType: "Landing page",
      targetAudience: "Gift buyers",
      tone: "Energetic",
      brandConstraints: "No discount language",
      seedContext: "Hero campaign",
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
      output_parsed: { variants: [] },
    });

    const { OpenAICodexProvider } = await import("@/lib/codex/openai-provider");
    const provider = new OpenAICodexProvider("test-key");

    await provider.generateVariants({
      experimentName: "Holiday push",
      goal: "Improve conversions",
      pageType: "Landing page",
      targetAudience: "Gift buyers",
      tone: "Energetic",
      brandConstraints: "No discount language",
      seedContext: "Hero campaign",
    });

    expect(parseMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "codex-custom",
      }),
    );
  });
});
