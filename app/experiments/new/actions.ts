"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/session";
import {
  generateExperimentVariants,
  synthesizeExperimentBrief,
} from "@/lib/codex/service";
import {
  createDraftExperiment,
  updateExperimentBrief,
} from "@/lib/repositories/experiment-repository";
import { validateGenerationInput } from "@/lib/validation/experiments";
import type {
  ExperimentBuilderActionResult,
  ExperimentBuilderFieldErrors,
  ExperimentBuilderValues,
} from "@/components/experiment-builder/types";

function normalizeValues(values: ExperimentBuilderValues): ExperimentBuilderValues {
  return {
    experimentId: values.experimentId,
    name: values.name.trim(),
    componentType: values.componentType.trim(),
    primaryGoal: values.primaryGoal.trim(),
    trafficSplit: values.trafficSplit,
    targetAudience: values.targetAudience.trim(),
    brandTone: values.brandTone.trim(),
    brandConstraints: values.brandConstraints.trim(),
    lockedElements: values.lockedElements,
    seedContext: values.seedContext.trim(),
    whatToTest: values.whatToTest.trim(),
    variantCount: values.variantCount,
    approvedBrief: values.approvedBrief,
  };
}

function buildResult(
  values: ExperimentBuilderValues,
  overrides: Omit<ExperimentBuilderActionResult, "values"> = {},
): ExperimentBuilderActionResult {
  return {
    values,
    ...overrides,
  };
}

function validateDraft(values: ExperimentBuilderValues) {
  const fieldErrors: ExperimentBuilderFieldErrors = {};

  if (!values.name) {
    fieldErrors.name = "Experiment name is required to save a draft.";
  }

  return fieldErrors;
}

function mapGenerationErrors(values: ExperimentBuilderValues) {
  const validation = validateGenerationInput({
    experimentName: values.name,
    componentType: values.componentType,
    primaryGoal: values.primaryGoal,
    trafficSplit: values.trafficSplit,
    targetAudience: values.targetAudience,
    brandTone: values.brandTone,
    brandConstraints: values.brandConstraints,
    lockedElements: values.lockedElements,
    seedContext: values.seedContext,
    whatToTest: values.whatToTest,
    variantCount: values.variantCount,
  });

  if (validation.success) {
    return {};
  }

  const fieldErrors: ExperimentBuilderFieldErrors = {};

  for (const issue of validation.error.issues) {
    const path = issue.path[0];

    if (path === "experimentName") fieldErrors.name = issue.message;
    if (path === "componentType") fieldErrors.componentType = issue.message;
    if (path === "primaryGoal") fieldErrors.primaryGoal = issue.message;
    if (path === "targetAudience") fieldErrors.targetAudience = issue.message;
    if (path === "brandTone") fieldErrors.brandTone = issue.message;
    if (path === "brandConstraints") fieldErrors.brandConstraints = issue.message;
    if (path === "lockedElements") fieldErrors.lockedElements = issue.message;
    if (path === "seedContext") fieldErrors.seedContext = issue.message;
    if (path === "whatToTest") fieldErrors.whatToTest = issue.message;
    if (path === "variantCount") fieldErrors.variantCount = issue.message;
  }

  return fieldErrors;
}

async function persistExperiment(values: ExperimentBuilderValues, userId: string) {
  const experimentInput = {
    name: values.name,
    goal: values.primaryGoal,
    pageType: values.componentType,
    targetAudience: values.targetAudience,
    tone: values.brandTone,
    brandConstraints: values.brandConstraints,
    seedContext: values.seedContext || undefined,
    whatToTest: values.whatToTest,
    trafficSplit: values.trafficSplit,
    variantCount: values.variantCount,
    lockedElements: values.lockedElements,
  };

  if (values.experimentId) {
    return updateExperimentBrief(prisma, values.experimentId, userId, {
      ...experimentInput,
      seedContext: values.seedContext || null,
      status: "draft",
      approvedBrief: values.approvedBrief,
    });
  }

  return createDraftExperiment(prisma, {
    userId,
    ...experimentInput,
    approvedBrief: values.approvedBrief,
  });
}

async function getUserId() {
  const session = await getServerSession();

  return session?.user?.id;
}

export async function saveDraftExperimentAction(
  values: ExperimentBuilderValues,
): Promise<ExperimentBuilderActionResult> {
  const normalizedValues = normalizeValues(values);
  const userId = await getUserId();

  if (!userId) {
    return buildResult(normalizedValues, {
      formError: "Your session expired. Sign in again to save this draft.",
    });
  }

  const fieldErrors = validateDraft(normalizedValues);

  if (Object.keys(fieldErrors).length > 0) {
    return buildResult(normalizedValues, { fieldErrors });
  }

  try {
    const experiment = await persistExperiment(normalizedValues, userId);

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath(`/experiments/${experiment.id}`);

    return buildResult(
      {
        ...normalizedValues,
        experimentId: experiment.id,
      },
      {
        experimentId: experiment.id,
        savedMessage: "Draft saved. Keep refining the brief or analyze it when ready.",
        stage: "draft",
      },
    );
  } catch (error) {
    return buildResult(normalizedValues, {
      formError:
        error instanceof Error ? error.message : "Draft save failed. Try again.",
    });
  }
}

export async function prepareExperimentBriefAction(
  values: ExperimentBuilderValues,
): Promise<ExperimentBuilderActionResult> {
  const normalizedValues = normalizeValues(values);
  const userId = await getUserId();

  if (!userId) {
    return buildResult(normalizedValues, {
      formError: "Your session expired. Sign in again to analyze this brief.",
    });
  }

  const fieldErrors = mapGenerationErrors(normalizedValues);

  if (Object.keys(fieldErrors).length > 0) {
    return buildResult(normalizedValues, { fieldErrors });
  }

  try {
    const experiment = await persistExperiment(normalizedValues, userId);
    const approvedBrief = await synthesizeExperimentBrief({
      experimentId: experiment.id,
      userId,
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath(`/experiments/${experiment.id}`);

    return buildResult(
      {
        ...normalizedValues,
        experimentId: experiment.id,
        approvedBrief,
      },
      {
        experimentId: experiment.id,
        stage: "brief_ready",
      },
    );
  } catch (error) {
    return buildResult(normalizedValues, {
      formError:
        error instanceof Error ? error.message : "Brief analysis failed. Try again.",
    });
  }
}

export async function generateExperimentAction(
  values: ExperimentBuilderValues,
): Promise<ExperimentBuilderActionResult> {
  const normalizedValues = normalizeValues(values);
  const userId = await getUserId();
  let persistedExperimentId = normalizedValues.experimentId;

  if (!userId) {
    return buildResult(normalizedValues, {
      formError: "Your session expired. Sign in again to generate variants.",
    });
  }

  const fieldErrors = mapGenerationErrors(normalizedValues);

  if (Object.keys(fieldErrors).length > 0) {
    return buildResult(normalizedValues, { fieldErrors });
  }

  if (!normalizedValues.approvedBrief) {
    return buildResult(normalizedValues, {
      formError: "Approve the synthesized brief before generating variants.",
    });
  }

  try {
    const experiment = await persistExperiment(normalizedValues, userId);
    persistedExperimentId = experiment.id;

    await generateExperimentVariants({
      experimentId: experiment.id,
      userId,
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath(`/experiments/${experiment.id}`);

    return buildResult(
      {
        ...normalizedValues,
        experimentId: experiment.id,
      },
      {
        experimentId: experiment.id,
        redirectTo: `/experiments/${experiment.id}`,
        stage: "generated",
      },
    );
  } catch (error) {
    return buildResult(
      {
        ...normalizedValues,
        experimentId: persistedExperimentId,
      },
      {
        experimentId: persistedExperimentId,
        formError:
          error instanceof Error
            ? error.message
            : "Variant generation failed. Try again.",
      },
    );
  }
}
