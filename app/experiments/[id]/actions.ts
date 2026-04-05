"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/session";
import { generateExperimentVariants, launchExperiment } from "@/lib/codex/service";
import { updateVariantCopy } from "@/lib/repositories/variant-repository";

async function getUserId() {
  const session = await getServerSession();

  return session?.user?.id;
}

export async function rerunExperimentAction(experimentId: string) {
  const userId = await getUserId();

  if (!userId) {
    return {
      formError: "Your session expired. Sign in again to regenerate variants.",
    };
  }

  try {
    await generateExperimentVariants({
      experimentId,
      userId,
    });

    revalidatePath(`/experiments/${experimentId}`);
    revalidatePath("/dashboard");

    return { ok: true };
  } catch (error) {
    return {
      formError: error instanceof Error ? error.message : "Variant generation failed.",
    };
  }
}

export async function updateVariantCopyAction(input: {
  experimentId: string;
  variantId: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  rationale: string;
}) {
  const userId = await getUserId();

  if (!userId) {
    return {
      formError: "Your session expired. Sign in again to edit this copy.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await updateVariantCopy(tx, {
        experimentId: input.experimentId,
        variantId: input.variantId,
        headline: input.headline.trim(),
        subheadline: input.subheadline.trim() || null,
        ctaText: input.ctaText.trim(),
        rationale: input.rationale.trim(),
      });
    });

    revalidatePath(`/experiments/${input.experimentId}`);
    return { ok: true };
  } catch (error) {
    return {
      formError: error instanceof Error ? error.message : "Copy update failed.",
    };
  }
}

export async function launchExperimentAction(input: {
  experimentId: string;
  launchAt: string;
  launchMetric: string;
}) {
  const userId = await getUserId();

  if (!userId) {
    return {
      formError: "Your session expired. Sign in again to launch this experiment.",
    };
  }

  try {
    await launchExperiment({
      experimentId: input.experimentId,
      userId,
      launchAt: input.launchAt,
      launchMetric: input.launchMetric as
        | "Increase clickthrough rate"
        | "Increase add-to-cart rate"
        | "Increase revenue per visitor"
        | "Reduce bounce rate",
    });

    revalidatePath(`/experiments/${input.experimentId}`);
    revalidatePath("/dashboard");

    return { ok: true };
  } catch (error) {
    return {
      formError: error instanceof Error ? error.message : "Launch failed.",
    };
  }
}
