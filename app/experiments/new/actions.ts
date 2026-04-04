"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/session";
import { generateExperimentVariants } from "@/lib/codex/service";
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

function normalizeValues(
  values: ExperimentBuilderValues,
): ExperimentBuilderValues {
  return {
    experimentId: values.experimentId,
    name: values.name.trim(),
    goal: values.goal.trim(),
    pageType: values.pageType.trim(),
    targetAudience: values.targetAudience.trim(),
    tone: values.tone.trim(),
    brandConstraints: values.brandConstraints.trim(),
    seedContext: values.seedContext.trim(),
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
    goal: values.goal,
    pageType: values.pageType,
    targetAudience: values.targetAudience,
    tone: values.tone,
    brandConstraints: values.brandConstraints || undefined,
    seedContext: values.seedContext || undefined,
  });

  if (validation.success) {
    return {};
  }

  const fieldErrors: ExperimentBuilderFieldErrors = {};

  for (const issue of validation.error.issues) {
    const path = issue.path[0];

    if (path === "experimentName") {
      fieldErrors.name = issue.message;
    }

    if (path === "goal") {
      fieldErrors.goal = issue.message;
    }

    if (path === "pageType") {
      fieldErrors.pageType = issue.message;
    }

    if (path === "targetAudience") {
      fieldErrors.targetAudience = issue.message;
    }

    if (path === "tone") {
      fieldErrors.tone = issue.message;
    }
  }

  return fieldErrors;
}

async function persistExperiment(
  values: ExperimentBuilderValues,
  userId: string,
) {
  const experimentInput = {
    name: values.name,
    goal: values.goal,
    pageType: values.pageType,
    targetAudience: values.targetAudience,
    tone: values.tone,
    brandConstraints: values.brandConstraints,
    seedContext: values.seedContext || undefined,
  };

  if (values.experimentId) {
    return updateExperimentBrief(prisma, values.experimentId, userId, {
      ...experimentInput,
      seedContext: values.seedContext || null,
      status: "draft",
    });
  }

  return createDraftExperiment(prisma, {
    userId,
    ...experimentInput,
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

    return buildResult(
      {
        ...normalizedValues,
        experimentId: experiment.id,
      },
      {
        experimentId: experiment.id,
        savedMessage: "Draft saved. Continue editing or generate variants.",
      },
    );
  } catch (error) {
    return buildResult(normalizedValues, {
      formError:
        error instanceof Error
          ? error.message
          : "Draft save failed. Try again.",
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

  try {
    const experiment = await persistExperiment(normalizedValues, userId);
    persistedExperimentId = experiment.id;

    await generateExperimentVariants({
      experimentId: experiment.id,
      userId,
    });

    return buildResult(
      {
        ...normalizedValues,
        experimentId: experiment.id,
      },
      {
        experimentId: experiment.id,
        redirectTo: `/experiments/${experiment.id}`,
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
