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
        variant: {
          label: "Quality-led",
          headline: "Wear what lasts",
          subheadline: "Crafted for the season ahead.",
          bodyCopy: "Leads with product materiality.",
          ctaText: "Explore now",
          htmlContent: "<section><h1>Wear what lasts</h1></section>",
          layoutNotes: "Quality-led direction",
        },
      },
    });

    const { OpenAICodexProvider } = await import("@/lib/codex/openai-provider");
    const provider = new OpenAICodexProvider("test-key");

    await provider.generateVariants({
      experimentName: "Spring hero banner test",
      componentType: "Hero banner",
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
          htmlContent: "<section><h1>Wear what lasts</h1></section>",
          layoutNotes: "Quality-led direction",
        },
      },
    });

    const { OpenAICodexProvider } = await import("@/lib/codex/openai-provider");
    const provider = new OpenAICodexProvider("test-key");

    await provider.generateVariants({
      experimentName: "Spring hero banner test",
      componentType: "Hero banner",
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

  it("sends stronger art direction so generated previews do not collapse into white minimal cards", async () => {
    parseMock.mockResolvedValue({
      output_parsed: {
        variant: {
          label: "Quality-led",
          headline: "Wear what lasts",
          subheadline: "Crafted for the season ahead.",
          bodyCopy: "Leads with product materiality.",
          ctaText: "Explore now",
          htmlContent: "<section><h1>Wear what lasts</h1></section>",
          layoutNotes: "Quality-led direction",
        },
      },
    });

    const { OpenAICodexProvider } = await import("@/lib/codex/openai-provider");
    const provider = new OpenAICodexProvider("test-key");

    await provider.generateVariants({
      experimentName: "Spring hero banner test",
      componentType: "Hero banner",
      targetAudience: "Returning shoppers",
      brandTone: "Editorial",
      brandConstraints: "Avoid discount framing",
      seedContext: "Feature lightweight outerwear",
      whatToTest: "Generate three quality-led headlines.",
    });

    const request = parseMock.mock.calls[0]?.[0];
    const systemInstruction = request?.input?.[0]?.content?.[0]?.text;

    expect(systemInstruction).toContain("Be liberal with graphics created in HTML and CSS");
    expect(systemInstruction).toContain("Avoid plain white backgrounds");
    expect(systemInstruction).toContain("bare text-only stacks");
    expect(systemInstruction).toContain("premium eCommerce art direction");
    expect(systemInstruction).toContain("The HTML fragment is customer-facing creative only");
    expect(systemInstruction).toContain("never to the internal experiment team");
    expect(systemInstruction).toContain("Do not render rationale, critique, design review language");
  });

  it("requests five short detail-page suggestions from Codex", async () => {
    parseMock.mockResolvedValue({
      output_parsed: {
        suggestions: [
          { title: "Punchier title", prompt: "Make the title punchier for returning shoppers." },
          { title: "Button position", prompt: "Move the CTA closer to the main message." },
          { title: "Theme color", prompt: "Shift the theme to a warmer color direction." },
          { title: "Section layout", prompt: "Rework the section layout for a clearer scan path." },
          { title: "Humorous tone", prompt: "Make the copy slightly more playful and humorous." },
        ],
      },
    });

    const { OpenAICodexProvider } = await import("@/lib/codex/openai-provider");
    const provider = new OpenAICodexProvider("test-key");

    await provider.generateSuggestions({
      experimentName: "Spring hero banner test",
      componentType: "Hero banner",
      targetAudience: "Returning shoppers",
      brandTone: "Editorial",
      brandConstraints: "Avoid discount framing",
      seedContext: "Feature lightweight outerwear",
      currentTestPrompt: "Generate three quality-led headlines.",
      currentVariant: {
        headline: "Wear what lasts",
        subheadline: "Crafted for the season ahead",
        bodyCopy: "Leads with product materiality.",
        ctaText: "Explore now",
        layoutNotes: "Quality-led direction",
      },
    });

    const request = parseMock.mock.calls[0]?.[0];
    const systemInstruction = request?.input?.[0]?.content?.[0]?.text;

    expect(systemInstruction).toContain("Return exactly five suggestions");
    expect(systemInstruction).toContain("must each target a different type of change");
    expect(systemInstruction).toContain("headline or title");
    expect(systemInstruction).toContain("CTA or button treatment");
    expect(systemInstruction).toContain("layout or section arrangement");
    expect(systemInstruction).toContain("visual theme or color direction");
    expect(systemInstruction).toContain("Do not make more than one suggestion primarily about the headline");
    expect(systemInstruction).toContain("Each title must be short and scannable");
    expect(systemInstruction).toContain("Each prompt must be concise");
    expect(systemInstruction).toContain("no more than 120 characters");
  });
});
