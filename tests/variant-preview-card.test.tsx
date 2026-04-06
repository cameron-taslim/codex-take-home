import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VariantPreviewCard } from "@/components/ui/variant-preview-card";

describe("variant preview card", () => {
  it("renders long generated copy in the preview", () => {
    render(
      <VariantPreviewCard
        variant={{
          id: "variant_long",
          experimentId: "exp_123",
          generationRunId: "run_123",
          label: "Variant B",
          headline: "Playwright demand 17753505001 conversion-led split for premium returning shoppers",
          subheadline: "A deliberately long supporting line that still needs to remain readable inside the preview.",
          bodyCopy:
            "Avoid discount framing and keep the direction product-led while preserving premium cues across the offer.",
          ctaText: "Explore Collection",
          htmlContent: "",
          layoutNotes: "Highlights the offer for returning shoppers with concise supporting copy.",
          previewConfig: {
            layout: "spotlight",
            emphasis: "headline",
            theme: "atelier-spring",
            assetSetKey: "atelier-spring",
          },
          position: 0,
          createdAt: new Date("2026-04-05T12:00:00.000Z"),
          updatedAt: new Date("2026-04-05T12:00:00.000Z"),
        }}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Playwright demand 17753505001 conversion-led split for premium returning shoppers",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Explore Collection")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Avoid discount framing and keep the direction product-led while preserving premium cues across the offer.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Variant B")).not.toBeInTheDocument();
    expect(screen.queryByText("headline emphasis")).not.toBeInTheDocument();
    expect(screen.queryByText("hero image")).not.toBeInTheDocument();
    expect(screen.queryByText("spotlight")).not.toBeInTheDocument();
    expect(screen.queryByText("Layout note")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Highlights the offer for returning shoppers with concise supporting copy."),
    ).not.toBeInTheDocument();
  });
});
