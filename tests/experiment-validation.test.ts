import { describe, expect, it } from "vitest";
import { validateGenerationInput } from "@/lib/validation/experiments";

describe("experiment generation validation", () => {
  it("rejects incomplete generation requests", () => {
    const result = validateGenerationInput({
      experimentName: "Spring launch",
      componentType: "Hero banner",
      primaryGoal: "Increase clickthrough rate",
      trafficSplit: "50/50",
      targetAudience: "Returning shoppers",
      brandTone: "Confident",
      brandConstraints: "",
      seedContext: "",
      whatToTest: "",
    });

    expect(result.success).toBe(false);
  });
});
