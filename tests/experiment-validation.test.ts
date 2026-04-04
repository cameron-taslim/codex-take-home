import { describe, expect, it } from "vitest";
import { validateGenerationInput } from "@/lib/validation/experiments";

describe("experiment generation validation", () => {
  it("rejects incomplete generation requests", () => {
    const result = validateGenerationInput({
      experimentName: "Spring launch",
      goal: "Increase clickthrough",
      pageType: "",
      targetAudience: "Returning shoppers",
      tone: "Confident",
      brandConstraints: "",
    });

    expect(result.success).toBe(false);
  });
});
