import { describe, expect, it } from "vitest";
import {
  generatedVariantSchema,
  validateGenerationInput,
} from "@/lib/validation/experiments";

describe("experiment generation validation", () => {
  it("rejects incomplete generation requests", () => {
    const result = validateGenerationInput({
      experimentName: "Spring launch",
      componentType: "Hero banner",
      targetAudience: "Returning shoppers",
      brandTone: "Confident",
      brandConstraints: "",
      seedContext: "",
      whatToTest: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts generated variants with html content", () => {
    const result = generatedVariantSchema.safeParse({
      label: "Quality-led",
      headline: "Wear what lasts",
      subheadline: "Crafted for the season ahead.",
      bodyCopy: "Leads with product materiality.",
      ctaText: "Explore now",
      htmlContent: "<section><h1>Wear what lasts</h1></section>",
      layoutNotes: "Quality-led direction",
    });

    expect(result.success).toBe(true);
  });

  it("rejects generated variants with missing html content", () => {
    const result = generatedVariantSchema.safeParse({
      label: "Quality-led",
      headline: "Wear what lasts",
      subheadline: "Crafted for the season ahead.",
      bodyCopy: "Leads with product materiality.",
      ctaText: "Explore now",
      htmlContent: "   ",
      layoutNotes: "Quality-led direction",
    });

    expect(result.success).toBe(false);
  });
});
