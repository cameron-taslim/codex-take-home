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
import type { ExperimentRecord } from "@/lib/domain/types";

function createMockCodexProvider(): CodexProvider {
  return {
    async generateVariants(input: CodexGenerationInput) {
      const themes = ["atelier-spring", "midnight-ledger"] as const;
      const layouts = ["spotlight", "split", "stacked"] as const;
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
          layoutNotes: `${variant.label} direction for ${input.componentType.toLowerCase()} previews.`,
          previewConfig: {
            layout: layouts[0],
            emphasis: "headline",
            theme: themes[0],
            assetSetKey: "atelier-spring",
          },
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

    await prisma.$transaction(async (tx) => {
      await createVariants(
        tx,
        experiment.id,
        run.id,
        [
          {
            ...result.variant,
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
