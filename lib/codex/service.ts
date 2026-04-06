import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import type { CodexProvider } from "@/lib/codex/provider";
import { OpenAICodexProvider } from "@/lib/codex/openai-provider";
import {
  codexBriefSynthesisSchema,
  codexGenerationInputSchema,
  codexGenerationResultSchema,
  codexLaunchConfigSchema,
  type CodexBriefSynthesis,
  type CodexGenerationInput,
} from "@/lib/codex/provider";
import {
  completeGenerationRun,
  createGenerationRun,
  failGenerationRun,
  markGenerationRunRunning,
  persistGenerationRunResult,
} from "@/lib/repositories/generation-repository";
import {
  getExperimentForUser,
  getExperimentDetailForUser,
  markExperimentLive,
  storeApprovedBrief,
} from "@/lib/repositories/experiment-repository";
import { createVariants } from "@/lib/repositories/variant-repository";
import type { ExperimentRecord } from "@/lib/domain/types";

function createMockCodexProvider(): CodexProvider {
  return {
    async synthesizeBrief(input: CodexGenerationInput) {
      const componentCopy =
        input.componentType === "Hero banner"
          ? ["headline copy", "subheadline", "CTA label"]
          : input.componentType === "Navigation CTA"
            ? ["CTA label", "supporting helper text"]
            : ["headline copy", "CTA label", "supporting merchandising copy"];

      return codexBriefSynthesisSchema.parse({
        hypothesis: `We believe that changing ${componentCopy.join(", ")} will increase ${input.primaryGoal.toLowerCase()} because ${input.targetAudience.toLowerCase()} respond to ${input.brandTone.toLowerCase()} product storytelling.`,
        whatIsChanging: componentCopy,
        successMetric: input.primaryGoal,
        audienceSignal: input.targetAudience,
      });
    },
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
    async generateLaunchConfig({ input, variant }) {
      return codexLaunchConfigSchema.parse({
        variantIds: [slugify(`${variant.label}-1`)],
        trafficSplit: input.trafficSplit,
        primaryMetric: input.primaryGoal,
        featureFlagKey: `storefront-exp-${slugify(input.experimentName)}`,
        rolloutNotes: `Mocked config for ${input.componentType.toLowerCase()} experiment with one saved output.`,
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
    primaryGoal: experiment.goal,
    trafficSplit: experiment.trafficSplit,
    targetAudience: experiment.targetAudience,
    brandTone: experiment.tone,
    brandConstraints: experiment.brandConstraints,
    seedContext: experiment.seedContext ?? "",
    whatToTest,
  });
}

export async function synthesizeExperimentBrief(params: {
  experimentId: string;
  userId: string;
  provider?: CodexProvider;
}) {
  const experiment = await getExperimentForUser(params.experimentId, params.userId);

  if (!experiment) {
    throw new Error("Experiment not found.");
  }

  const provider = params.provider ?? createDefaultCodexProvider();
  const promptSnapshot = buildPromptSnapshot(experiment);
  const approvedBrief = await provider.synthesizeBrief(promptSnapshot);

  await storeApprovedBrief(prisma, experiment.id, params.userId, approvedBrief);

  return approvedBrief;
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

  const approvedBrief = codexBriefSynthesisSchema.parse(experiment.approvedBrief);
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
    const launchConfig = await provider.generateLaunchConfig({
      input: promptSnapshot,
      approvedBrief,
      variant: result.variant,
    });

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

      await persistGenerationRunResult(tx, run.id, {
        approvedBrief,
        variant: result.variant,
        launchConfig,
      });

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

export async function launchExperiment(params: {
  experimentId: string;
  userId: string;
  launchAt: string;
  launchMetric: CodexGenerationInput["primaryGoal"];
}) {
  const experiment = await getExperimentDetailForUser(params.experimentId, params.userId);

  if (!experiment) {
    throw new Error("Experiment not found.");
  }

  const latestRunConfig = codexLaunchConfigSchema.parse(
    experiment.latestSavedRun?.resultSnapshot &&
      typeof experiment.latestSavedRun.resultSnapshot === "object"
      ? (experiment.latestSavedRun.resultSnapshot as { launchConfig?: unknown }).launchConfig
      : null,
  );

  const config = {
    ...latestRunConfig,
    primaryMetric: params.launchMetric,
    launchAt: params.launchAt,
    experimentId: experiment.id,
    experimentName: experiment.name,
  };

  const outputPath = path.join(
    process.cwd(),
    "generated-config",
    `${experiment.id}.json`,
  );

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(config, null, 2));

  await markExperimentLive(prisma, experiment.id, params.userId, {
    launchAt: new Date(params.launchAt),
    launchMetric: params.launchMetric,
    launchConfig: config,
  });

  return config;
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
