import type { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export async function createVariants(
  db: DbClient,
  experimentId: string,
  generationRunId: string,
  variants: Array<{
    label: string;
    headline: string;
    subheadline?: string | null;
    bodyCopy: string;
    ctaText: string;
    htmlContent: string;
    layoutNotes: string;
    previewConfig: object;
    position: number;
  }>,
) {
  await db.experimentVariant.createMany({
    data: variants.map((variant) => ({
      experimentId,
      generationRunId,
      ...variant,
    })),
  });
}
