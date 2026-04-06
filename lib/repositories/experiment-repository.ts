import type { Prisma, PrismaClient } from "@prisma/client";
import {
  briefSynthesisSchema,
  experimentDraftSchema,
  experimentInputSchema,
  experimentLaunchConfigSchema,
} from "@/lib/validation/experiments";
import { prisma } from "@/lib/prisma";

type DbClient = PrismaClient | Prisma.TransactionClient;

export async function createDraftExperiment(
  db: DbClient,
  input: {
    userId: string;
    name: string;
  } & Partial<Prisma.ExperimentCreateInput>,
) {
  const parsed = experimentDraftSchema.parse(input);

  return db.experiment.create({
    data: {
      userId: parsed.userId,
      name: parsed.name,
      goal: parsed.goal ?? "",
      pageType: parsed.pageType ?? "",
      targetAudience: parsed.targetAudience ?? "",
      tone: parsed.tone ?? "",
      brandConstraints: parsed.brandConstraints ?? "",
      seedContext: parsed.seedContext ?? null,
      whatToTest: parsed.whatToTest ?? "",
      trafficSplit: parsed.trafficSplit ?? "50/50",
      variantCount: 1,
      brandAssetSetKey: parsed.brandAssetSetKey ?? "atelier-spring",
      status: "draft",
    },
  });
}

export async function updateExperimentBrief(
  db: DbClient,
  experimentId: string,
  userId: string,
  input: Prisma.ExperimentUpdateInput,
) {
  const result = await db.experiment.updateMany({
    where: { id: experimentId, userId },
    data: input,
  });

  if (result.count === 0) {
    throw new Error("Experiment not found.");
  }

  return db.experiment.findFirstOrThrow({
    where: { id: experimentId, userId },
  });
}

export async function getExperimentForUser(experimentId: string, userId: string) {
  return prisma.experiment.findFirst({
    where: {
      id: experimentId,
      userId,
    },
  });
}

export async function listExperimentsForUser(userId: string) {
  return prisma.experiment.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      pageType: true,
      trafficSplit: true,
      updatedAt: true,
      latestGenerationRun: {
        select: {
          status: true,
        },
      },
    },
  });
}

export async function deleteExperimentForUser(experimentId: string, userId: string) {
  const result = await prisma.experiment.deleteMany({
    where: {
      id: experimentId,
      userId,
    },
  });

  if (result.count === 0) {
    throw new Error("Experiment not found.");
  }

  return { id: experimentId };
}

export async function getExperimentDetailForUser(
  experimentId: string,
  userId: string,
  selectedRunId?: string,
) {
  const experiment = await prisma.experiment.findFirst({
    where: {
      id: experimentId,
      userId,
    },
    select: {
      id: true,
      name: true,
      goal: true,
      pageType: true,
      targetAudience: true,
      tone: true,
      brandConstraints: true,
      seedContext: true,
      whatToTest: true,
      trafficSplit: true,
      approvedBrief: true,
      launchMetric: true,
      launchAt: true,
      launchConfig: true,
      brandAssetSetKey: true,
      status: true,
      updatedAt: true,
      latestGenerationRunId: true,
      latestGenerationRun: {
        select: {
          id: true,
          status: true,
          startedAt: true,
          completedAt: true,
          errorMessage: true,
          resultSnapshot: true,
        },
      },
    },
  });

  if (!experiment) {
    return null;
  }

  const normalizedSelectedRunId = selectedRunId?.trim();

  const [latestSavedRun, selectedSavedRun, generationHistory] = await Promise.all([
    prisma.codexGenerationRun.findFirst({
      where: {
        experimentId,
        status: "succeeded",
        experiment: {
          userId,
        },
      },
      orderBy: [{ completedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        status: true,
        startedAt: true,
        completedAt: true,
        resultSnapshot: true,
        variants: {
          orderBy: {
            position: "asc",
          },
        },
      },
    }),
    normalizedSelectedRunId
      ? prisma.codexGenerationRun.findFirst({
          where: {
            id: normalizedSelectedRunId,
            experimentId,
            status: "succeeded",
            experiment: {
              userId,
            },
          },
          select: {
            id: true,
            status: true,
            startedAt: true,
            completedAt: true,
            resultSnapshot: true,
            variants: {
              orderBy: {
                position: "asc",
              },
            },
          },
        })
      : Promise.resolve(null),
    prisma.codexGenerationRun.findMany({
      where: {
        experimentId,
        experiment: {
          userId,
        },
      },
      orderBy: [{ startedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        status: true,
        startedAt: true,
        completedAt: true,
        errorMessage: true,
        _count: {
          select: {
            variants: true,
          },
        },
      },
    }),
  ]);

  return {
    ...experiment,
    latestSavedRun,
    selectedSavedRun,
    generationHistory: generationHistory.map((run) => ({
      id: run.id,
      status: run.status,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      errorMessage: run.errorMessage,
      variantCount: run._count.variants,
    })),
  };
}

export async function validateExperimentForGeneration(input: unknown) {
  return experimentInputSchema.safeParse(input);
}

export async function updateExperimentGenerationState(
  db: DbClient,
  experimentId: string,
  input: {
    status: "generating" | "generated" | "generation_failed" | "live";
    latestGenerationRunId: string;
  },
) {
  return db.experiment.update({
    where: { id: experimentId },
    data: input,
  });
}

export async function storeApprovedBrief(
  db: DbClient,
  experimentId: string,
  userId: string,
  approvedBrief: unknown,
) {
  const parsed = briefSynthesisSchema.parse(approvedBrief);

  return updateExperimentBrief(db, experimentId, userId, {
    approvedBrief: parsed,
  });
}

export async function updateVariantEditingState(
  db: DbClient,
  experimentId: string,
  userId: string,
) {
  const result = await db.experiment.findFirst({
    where: { id: experimentId, userId },
    select: { id: true },
  });

  if (!result) {
    throw new Error("Experiment not found.");
  }

  return result;
}

export async function markExperimentLive(
  db: DbClient,
  experimentId: string,
  userId: string,
  input: {
    launchAt: Date;
    launchMetric: string;
    launchConfig: unknown;
  },
) {
  const parsedConfig = experimentLaunchConfigSchema.parse(input.launchConfig);
  const result = await db.experiment.updateMany({
    where: { id: experimentId, userId },
    data: {
      status: "live",
      launchAt: input.launchAt,
      launchMetric: input.launchMetric,
      launchConfig: parsedConfig,
    },
  });

  if (result.count === 0) {
    throw new Error("Experiment not found.");
  }
}
