import { prisma } from "@/lib/prisma";
import type { CodexProvider } from "@/lib/codex/provider";
import { OpenAICodexProvider } from "@/lib/codex/openai-provider";
import {
  createGenerationRun,
  failGenerationRun,
  markGenerationRunRunning,
  completeGenerationRun,
} from "@/lib/repositories/generation-repository";
import { createVariants } from "@/lib/repositories/variant-repository";
import { getExperimentForUser } from "@/lib/repositories/experiment-repository";
import {
  codexGenerationInputSchema,
  codexGenerationResultSchema,
  type CodexGenerationInput,
} from "@/lib/codex/provider";
import type { ExperimentRecord } from "@/lib/domain/types";

function createMockCodexProvider(): CodexProvider {
  return {
    async generateVariants(input: CodexGenerationInput) {
      return codexGenerationResultSchema.parse({
        variants: [
          {
            label: "Variant A",
            headline: `${input.experimentName}: editorial hero`,
            subheadline: `Built for ${input.targetAudience}`,
            bodyCopy: `${input.goal} while keeping the experience ${input.tone.toLowerCase()}.`,
            ctaText: "Shop the edit",
            layoutNotes: `Centered composition for a ${input.pageType.toLowerCase()} experience.`,
            previewConfig: {
              align: "center",
              emphasis: "headline",
              theme: "linen",
            },
          },
          {
            label: "Variant B",
            headline: `${input.experimentName}: conversion-led split`,
            subheadline: input.brandConstraints || undefined,
            bodyCopy: `Highlights the offer for ${input.targetAudience} with concise supporting copy.`,
            ctaText: "Explore collection",
            layoutNotes: "Split layout that keeps the CTA visible beside proof points.",
            previewConfig: {
              align: "split",
              emphasis: "cta",
              theme: "charcoal",
            },
          },
        ],
      });
    },
  };
}

export function buildPromptSnapshot(experiment: ExperimentRecord) {
  return codexGenerationInputSchema.parse({
    experimentName: experiment.name,
    goal: experiment.goal,
    pageType: experiment.pageType,
    targetAudience: experiment.targetAudience,
    tone: experiment.tone,
    brandConstraints: experiment.brandConstraints,
    seedContext: experiment.seedContext,
  });
}

export async function generateExperimentVariants(params: {
  experimentId: string;
  userId: string;
  provider?: CodexProvider;
}) {
  const experiment = await getExperimentForUser(params.experimentId, params.userId);

  if (!experiment) {
    throw new Error("Experiment not found.");
  }

  const promptSnapshot = buildPromptSnapshot(experiment);
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
        result.variants.map((variant, index) => ({
          ...variant,
          position: index,
        })),
      );

      await completeGenerationRun(tx, run.id, experiment.id);
    });

    return {
      runId: run.id,
      variantCount: result.variants.length,
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
  if (process.env.CODEX_PROVIDER_MODE !== "openai") {
    return createMockCodexProvider();
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  return new OpenAICodexProvider(process.env.OPENAI_API_KEY);
}
