import { describe, expect, it, vi } from "vitest";
import { generateExperimentSuggestions } from "@/lib/codex/service";

describe("experiment suggestions service", () => {
  it("asks the provider for five concise suggestions using the saved detail context", async () => {
    const generateSuggestions = vi.fn().mockResolvedValue({
      suggestions: [
        { title: "Sharper headline", prompt: "Make the headline sharper for returning shoppers." },
        { title: "CTA shift", prompt: "Use a higher-intent CTA for repeat visitors." },
        { title: "Proof cue", prompt: "Add one proof cue without discount language." },
        { title: "Benefit frame", prompt: "Push a more benefit-led editorial angle." },
        { title: "Fresh concept", prompt: "Try a new concept while keeping brand constraints." },
      ],
    });

    await expect(
      generateExperimentSuggestions({
        experiment: {
          name: "Spring hero banner test",
          pageType: "Hero banner",
          targetAudience: "Returning shoppers",
          tone: "Editorial",
          brandConstraints: "Avoid discount framing",
          seedContext: "Feature lightweight outerwear",
          whatToTest: "Generate three quality-led headlines.",
        },
        latestVariant: {
          headline: "Wear what lasts",
          subheadline: "Crafted for the season ahead",
          bodyCopy: "Leads with product materiality.",
          ctaText: "Explore now",
          layoutNotes: "Quality-led direction",
        },
        provider: {
          generateSuggestions,
        },
      }),
    ).resolves.toHaveLength(5);

    expect(generateSuggestions).toHaveBeenCalledWith({
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
  });

  it("returns five varied default suggestions in test mode", async () => {
    await expect(
      generateExperimentSuggestions({
        experiment: {
          name: "Spring hero banner test",
          pageType: "Hero banner",
          targetAudience: "Returning shoppers",
          tone: "Editorial",
          brandConstraints: "Avoid discount framing",
          seedContext: "Feature lightweight outerwear",
          whatToTest: "Generate three quality-led headlines.",
        },
        latestVariant: {
          headline: "Wear what lasts",
          subheadline: "Crafted for the season ahead",
          bodyCopy: "Leads with product materiality.",
          ctaText: "Explore now",
          layoutNotes: "Quality-led direction",
        },
      }),
    ).resolves.toEqual([
      {
        title: "Punchier title",
        prompt: 'Make "Wear what lasts" punchier for returning shoppers.',
      },
      {
        title: "Button position",
        prompt: 'Move "Explore now" into a more prominent position near the main message.',
      },
      {
        title: "Theme color",
        prompt: "Shift the theme to a new color direction that still fits the brand constraints.",
      },
      {
        title: "Section layout",
        prompt: "Rework the supporting section layout to create a clearer scan path.",
      },
      {
        title: "Humorous tone",
        prompt: "Keep the editorial tone, but add a slightly more playful or humorous voice.",
      },
    ]);
  });
});
