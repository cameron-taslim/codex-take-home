import type { Prisma, PrismaClient } from "@prisma/client";
import {
  experimentDraftSchema,
  experimentInputSchema,
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
      pageType: parsed.pageType ?? "",
      targetAudience: parsed.targetAudience ?? "",
      tone: parsed.tone ?? "",
      brandConstraints: parsed.brandConstraints ?? "",
      seedContext: parsed.seedContext ?? null,
      whatToTest: parsed.whatToTest ?? "",
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
) {
  const experiment = await prisma.experiment.findFirst({
    where: {
      id: experimentId,
      userId,
    },
    select: {
      id: true,
      name: true,
      pageType: true,
      targetAudience: true,
      tone: true,
      brandConstraints: true,
      seedContext: true,
      whatToTest: true,
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
        },
      },
    },
  });

  if (!experiment) {
    return null;
  }

  const latestSavedRun = await prisma.codexGenerationRun.findFirst({
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
      variants: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  return {
    ...experiment,
    latestSavedRun,
  };
}

export async function validateExperimentForGeneration(input: unknown) {
  return experimentInputSchema.safeParse(input);
}

export async function updateExperimentGenerationState(
  db: DbClient,
  experimentId: string,
  input: {
    status: "generating" | "generated" | "generation_failed";
    latestGenerationRunId: string;
  },
) {
  return db.experiment.update({
    where: { id: experimentId },
    data: input,
  });
}
