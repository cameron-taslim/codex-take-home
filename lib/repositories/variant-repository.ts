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

export async function updateVariantCopy(
  db: DbClient,
  input: {
    variantId: string;
    experimentId: string;
    headline: string;
    subheadline: string | null;
    ctaText: string;
    rationale: string;
  },
) {
  return db.experimentVariant.update({
    where: { id: input.variantId },
    data: {
      experimentId: input.experimentId,
      headline: input.headline,
      subheadline: input.subheadline,
      ctaText: input.ctaText,
      bodyCopy: input.rationale,
    },
  });
}
