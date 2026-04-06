import { prisma } from "@/lib/prisma";
import type { CodexProvider } from "@/lib/codex/provider";
import { OpenAICodexProvider } from "@/lib/codex/openai-provider";
import {
  codexGenerationInputSchema,
  codexGenerationResultSchema,
  type CodexGenerationInput,
} from "@/lib/codex/provider";
import {
  completeGenerationRun,
  createGenerationRun,
  failGenerationRun,
  markGenerationRunRunning,
} from "@/lib/repositories/generation-repository";
import {
  getExperimentForUser,
} from "@/lib/repositories/experiment-repository";
import { createVariants } from "@/lib/repositories/variant-repository";
import { sanitizeGeneratedHtml } from "@/lib/sanitization/generated-html";
import type { ExperimentRecord } from "@/lib/domain/types";

function createMockCodexProvider(): CodexProvider {
  return {
    async generateVariants(input: CodexGenerationInput) {
      const angles = [
        {
          label: "Quality-led",
          headline: "Wear what lasts",
          subheadline: "Crafted for the season ahead with product-first confidence.",
          ctaText: "Explore now",
          rationale:
            "Leads with material quality to persuade returning premium-intent shoppers.",
        },
        {
          label: "Scarcity + personal",
          headline: "Your next favorite is here",
          subheadline: "Curated drops built for repeat shoppers with a sharp point of view.",
          ctaText: "Claim yours",
          rationale:
            "Adds urgency and personal curation without drifting into discount language.",
        },
        {
          label: "Editorial ease",
          headline: "A lighter way to layer",
          subheadline: "Style the collection around effortless transitions and polished versatility.",
          ctaText: "See the edit",
          rationale:
            "Uses editorial framing to support a warmer, more considered browse journey.",
        },
        {
          label: "Confident utility",
          headline: "Built for every return visit",
          subheadline: "Keeps the message functional and conversion-minded with crisp proof cues.",
          ctaText: "Shop smart",
          rationale:
            "Pushes a practical angle for shoppers already close to action.",
        },
      ];

      const variant = angles[0];

      return codexGenerationResultSchema.parse({
        variant: {
          label: variant.label,
          headline: variant.headline,
          subheadline: variant.subheadline,
          bodyCopy: variant.rationale,
          ctaText: variant.ctaText,
          htmlContent: [
            '<section style="display: flex; flex-direction: column; gap: 18px; padding: 28px; max-width: 100%; border-radius: 28px; background: linear-gradient(135deg, #f4e4d4 0%, #f7efe8 48%, #ead2b8 100%); color: #1f2230; box-shadow: 0 18px 40px rgba(73, 44, 23, 0.18);">',
            '<div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">',
            '<span style="display: inline-block; width: fit-content; padding: 6px 10px; border-radius: 999px; background: rgba(31, 34, 48, 0.92); color: #fff8f1; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Featured drop</span>',
            '<span style="display: inline-block; width: fit-content; padding: 6px 10px; border-radius: 999px; background: rgba(255, 255, 255, 0.62); color: #7a4e2a; font-size: 12px; font-weight: 700;">New palette</span>',
            "</div>",
            `<h1 style="margin: 0; font-size: 46px; line-height: 0.95; letter-spacing: -0.05em; max-width: 100%; color: #1d2333;">${variant.headline}</h1>`,
            variant.subheadline
              ? `<p style="margin: 0; font-size: 18px; line-height: 1.55; max-width: 32ch; color: rgba(29, 35, 51, 0.82);">${variant.subheadline}</p>`
              : "",
            '<div style="display: flex; flex-wrap: wrap; gap: 14px; align-items: center;">',
            `<a href="#" style="display: inline-flex; align-items: center; justify-content: center; min-width: 0; padding: 14px 18px; border-radius: 14px; background: linear-gradient(180deg, #2f3446, #171b28); color: #fffaf2; text-decoration: none; font-weight: 700; box-shadow: 0 10px 24px rgba(23, 27, 40, 0.22);">${variant.ctaText}</a>`,
            `<p style="margin: 0; max-width: 34ch; font-size: 15px; line-height: 1.65; color: rgba(29, 35, 51, 0.78);">${variant.rationale}</p>`,
            "</div>",
            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">',
            '<div style="padding: 14px 16px; border-radius: 18px; background: rgba(255, 255, 255, 0.58); border: 1px solid rgba(31, 34, 48, 0.08);"><p style="margin: 0 0 6px; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(31, 34, 48, 0.55);">Why it works</p><p style="margin: 0; font-size: 14px; line-height: 1.55; color: rgba(29, 35, 51, 0.82);">Warm editorial tones make the promo feel premium without becoming loud.</p></div>',
            `<div style="padding: 14px 16px; border-radius: 18px; background: rgba(126, 78, 32, 0.08); border: 1px solid rgba(126, 78, 32, 0.12);"><p style="margin: 0 0 6px; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(122, 78, 42, 0.72);">Testing focus</p><p style="margin: 0; font-size: 14px; line-height: 1.55; color: rgba(29, 35, 51, 0.82);">${input.whatToTest}</p></div>`,
            "</div>",
            "</section>",
          ].join(""),
          layoutNotes: `${variant.label} direction for ${input.componentType.toLowerCase()} previews.`,
        },
      });
    },
  };
}

export function buildPromptSnapshot(
  experiment: ExperimentRecord,
  overrides?: { whatToTest?: string },
) {
  const whatToTest = overrides?.whatToTest?.trim() || experiment.whatToTest;

  return codexGenerationInputSchema.parse({
    experimentName: experiment.name,
    componentType: experiment.pageType,
    targetAudience: experiment.targetAudience,
    brandTone: experiment.tone,
    brandConstraints: experiment.brandConstraints,
    seedContext: experiment.seedContext ?? "",
    whatToTest,
  });
}

export async function generateExperimentVariants(params: {
  experimentId: string;
  userId: string;
  promptOverride?: string;
  provider?: CodexProvider;
}) {
  const experiment = await getExperimentForUser(params.experimentId, params.userId);

  if (!experiment) {
    throw new Error("Experiment not found.");
  }
  const promptSnapshot = buildPromptSnapshot(experiment, {
    whatToTest: params.promptOverride,
  });
  const provider = params.provider ?? createDefaultCodexProvider();

  const run = await prisma.$transaction(async (tx) => {
    const createdRun = await createGenerationRun(tx, {
      experimentId: experiment.id,
      promptSnapshot,
    });

    await markGenerationRunRunning(tx, createdRun.id, experiment.id);

    return createdRun;
  });

  try {
    const result = await provider.generateVariants(promptSnapshot);
    const sanitizedVariant = {
      ...result.variant,
      htmlContent: sanitizeGeneratedHtml(result.variant.htmlContent),
    };

    await prisma.$transaction(async (tx) => {
      await createVariants(
        tx,
        experiment.id,
        run.id,
        [
          {
            ...sanitizedVariant,
            position: 0,
          },
        ],
      );

      await completeGenerationRun(tx, run.id, experiment.id);
    });

    return {
      runId: run.id,
      variantCount: 1,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Codex generation failed.";

    await prisma.$transaction(async (tx) => {
      await failGenerationRun(tx, run.id, experiment.id, message);
    });
    throw error;
  }
}

function createDefaultCodexProvider(): CodexProvider {
  if (process.env.NODE_ENV === "test") {
    return createMockCodexProvider();
  }

  if (process.env.OPENAI_API_KEY) {
    return new OpenAICodexProvider(process.env.OPENAI_API_KEY);
  }

  return createMockCodexProvider();
}
