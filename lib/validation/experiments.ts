import { z } from "zod";

const requiredText = (message: string) => z.string().trim().min(1, message);

export const previewConfigSchema = z.object({
  align: z.enum(["left", "center", "split"]).default("left"),
  emphasis: z.enum(["headline", "cta", "body"]).default("headline"),
  theme: z.string().min(1).max(40),
});

export const generatedVariantSchema = z.object({
  label: z.string().min(1),
  headline: z.string().min(1),
  subheadline: z.string().optional(),
  bodyCopy: z.string().min(1),
  ctaText: z.string().min(1),
  layoutNotes: z.string().min(1),
  previewConfig: previewConfigSchema,
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
});

export const experimentInputSchema = z.object({
  experimentName: requiredText("Experiment name is required."),
  goal: requiredText("Experiment goal is required."),
  pageType: requiredText("Target page type is required."),
  targetAudience: requiredText("Target audience is required."),
  tone: requiredText("Tone is required."),
  brandConstraints: z.string().trim().optional(),
  seedContext: z.string().optional(),
});

export function validateGenerationInput(input: unknown) {
  return experimentInputSchema.safeParse(input);
}
