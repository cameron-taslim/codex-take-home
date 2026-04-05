import type { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export async function createGenerationRun(
  db: DbClient,
  input: {
    experimentId: string;
    promptSnapshot: object;
  },
) {
  return db.codexGenerationRun.create({
    data: {
      experimentId: input.experimentId,
      status: "pending",
      promptSnapshot: input.promptSnapshot,
      startedAt: new Date(),
    },
  });
}

export async function markGenerationRunRunning(
  db: DbClient,
  runId: string,
  experimentId: string,
) {
  await db.codexGenerationRun.update({
    where: { id: runId },
    data: {
      status: "running",
    },
  });

  await db.experiment.update({
    where: { id: experimentId },
    data: {
      status: "generating",
      latestGenerationRunId: runId,
    },
  });
}

export async function completeGenerationRun(
  db: DbClient,
  runId: string,
  experimentId: string,
) {
  const completedAt = new Date();

  await db.codexGenerationRun.update({
    where: { id: runId },
    data: {
      status: "succeeded",
      completedAt,
    },
  });

  await db.experiment.update({
    where: { id: experimentId },
    data: {
      status: "generated",
      latestGenerationRunId: runId,
    },
  });
}

export async function failGenerationRun(
  db: DbClient,
  runId: string,
  experimentId: string,
  errorMessage: string,
) {
  const completedAt = new Date();

  await db.codexGenerationRun.update({
    where: { id: runId },
    data: {
      status: "failed",
      completedAt,
      errorMessage,
    },
  });

  await db.experiment.update({
    where: { id: experimentId },
    data: {
      status: "generation_failed",
      latestGenerationRunId: runId,
    },
  });
}

export async function persistGenerationRunResult(
  db: DbClient,
  runId: string,
  resultSnapshot: object,
) {
  await db.codexGenerationRun.update({
    where: { id: runId },
    data: {
      resultSnapshot,
    },
  });
}
