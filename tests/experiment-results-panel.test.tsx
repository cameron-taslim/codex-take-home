import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExperimentResultsPanel } from "@/components/experiment-detail/results-panel";

describe("experiment results panel", () => {
  it("renders the saved html preview for generated variants", () => {
    render(
      <ExperimentResultsPanel
        experiment={{
          activeSavedRun: {
            variants: [
              {
                id: "variant_html",
                experimentId: "exp_123",
                generationRunId: "run_123",
                label: "Variant A",
                headline: "Wear what lasts",
                subheadline: "Crafted for the season ahead.",
                bodyCopy: "Leads with product materiality.",
                ctaText: "Explore now",
                htmlContent:
                  '<section><h1>Wear what lasts</h1><p>Crafted for the season ahead.</p></section>',
                layoutNotes: "Quality-led direction",
                position: 0,
                createdAt: new Date("2026-04-05T12:00:00.000Z"),
                updatedAt: new Date("2026-04-05T12:00:00.000Z"),
              },
            ],
          },
        }}
      />,
    );

    expect(screen.getByTestId("saved-html-preview")).toContainHTML(
      "<h1>Wear what lasts</h1>",
    );
  });

  it("shows a no-preview message when html is missing", () => {
    render(
      <ExperimentResultsPanel
        experiment={{
          activeSavedRun: {
            variants: [
              {
                id: "variant_legacy",
                experimentId: "exp_123",
                generationRunId: "run_123",
                label: "Variant A",
                headline: "Wear what lasts",
                subheadline: "Crafted for the season ahead.",
                bodyCopy: "Leads with product materiality.",
                ctaText: "Explore now",
                htmlContent: "",
                layoutNotes: "Quality-led direction",
                position: 0,
                createdAt: new Date("2026-04-05T12:00:00.000Z"),
                updatedAt: new Date("2026-04-05T12:00:00.000Z"),
              },
            ],
          },
        }}
      />,
    );

    expect(
      screen.getByText("Saved HTML preview unavailable for this record."),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("saved-html-preview")).not.toBeInTheDocument();
  });
});
