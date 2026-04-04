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
      goal: parsed.goal ?? "",
      pageType: parsed.pageType ?? "",
      targetAudience: parsed.targetAudience ?? "",
      tone: parsed.tone ?? "",
      brandConstraints: parsed.brandConstraints ?? "",
      seedContext: parsed.seedContext ?? null,
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
