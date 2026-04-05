import { z } from "zod";

const requiredText = (message: string) => z.string().trim().min(1, message);

export const trafficSplitSchema = z.enum(["50/50", "70/30", "80/20"]);
export const componentTypeSchema = z.enum([
  "Hero banner",
  "Landing page",
  "Product detail page (PDP) buy box",
  "Navigation CTA",
  "Category page header",
]);
export const primaryGoalSchema = z.enum([
  "Increase clickthrough rate",
  "Increase add-to-cart rate",
  "Increase revenue per visitor",
  "Reduce bounce rate",
]);
export const brandToneSchema = z.enum([
  "Editorial",
  "Urgent",
  "Playful",
  "Minimalist",
  "Confident",
  "Warm",
]);
export const lockedElementSchema = z.enum([
  "Lock hero image",
  "Lock logo",
  "Lock legal copy",
  "Lock price display",
]);

export const previewConfigSchema = z.object({
  layout: z.enum(["spotlight", "split", "stacked"]).default("spotlight"),
  emphasis: z.enum(["headline", "cta", "proof"]).default("headline"),
  theme: z.enum(["atelier-spring", "midnight-ledger"]).default("atelier-spring"),
  assetSetKey: z.string().min(1),
  lockedElements: z.array(lockedElementSchema).default([]),
});

export const generatedVariantSchema = z.object({
  label: z.string().min(1).max(40),
  headline: z.string().trim().min(1).max(80),
  subheadline: z.string().optional(),
  bodyCopy: z.string().min(1),
  ctaText: z.string().trim().min(1).max(20),
  layoutNotes: z.string().min(1),
  previewConfig: previewConfigSchema,
});

export const briefSynthesisSchema = z.object({
  hypothesis: requiredText("Hypothesis is required."),
  whatIsChanging: z.array(requiredText("Change summary is required.")).min(1).max(4),
  whatIsLocked: z.array(requiredText("Locked element summary is required.")).min(1).max(4),
  successMetric: requiredText("Success metric is required."),
  audienceSignal: requiredText("Audience signal is required."),
});

export const experimentLaunchConfigSchema = z.object({
  variantIds: z.array(z.string().min(1)).length(1),
  trafficSplit: trafficSplitSchema,
  primaryMetric: primaryGoalSchema,
  featureFlagKey: z.string().min(1),
  rolloutNotes: z.string().min(1),
});

export const experimentDraftSchema = z.object({
  userId: z.string().min(1),
  name: requiredText("Experiment name is required."),
  goal: z.string().optional(),
  pageType: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z.string().optional(),
  brandConstraints: z.string().optional(),
  seedContext: z.string().optional(),
  whatToTest: z.string().optional(),
  trafficSplit: trafficSplitSchema.optional(),
  lockedElements: z.array(lockedElementSchema).optional(),
  approvedBrief: briefSynthesisSchema.optional(),
  launchMetric: primaryGoalSchema.optional(),
  launchConfig: experimentLaunchConfigSchema.optional(),
  brandAssetSetKey: z.string().optional(),
});

export const experimentInputSchema = z.object({
  experimentName: requiredText("Experiment name is required."),
  componentType: componentTypeSchema,
  primaryGoal: primaryGoalSchema,
  trafficSplit: trafficSplitSchema,
  targetAudience: requiredText("Target audience is required."),
  brandTone: brandToneSchema.or(requiredText("Brand tone is required.")),
  brandConstraints: z.string().trim().min(1, "Brand constraints are required."),
  lockedElements: z.array(lockedElementSchema).min(1, "Choose at least one locked element."),
  seedContext: requiredText("Seed context is required."),
  whatToTest: requiredText("What to test is required."),
});

export function validateGenerationInput(input: unknown) {
  return experimentInputSchema.safeParse(input);
}
