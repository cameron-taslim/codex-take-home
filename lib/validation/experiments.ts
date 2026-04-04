import { z } from "zod";

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
  name: z.string().min(1),
  goal: z.string().optional(),
  pageType: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z.string().optional(),
  brandConstraints: z.string().optional(),
  seedContext: z.string().optional(),
});

export const experimentInputSchema = z.object({
  experimentName: z.string().min(1),
  goal: z.string().min(1),
  pageType: z.string().min(1),
  targetAudience: z.string().min(1),
  tone: z.string().min(1),
  brandConstraints: z.string().min(1),
  seedContext: z.string().optional(),
});

export function validateGenerationInput(input: unknown) {
  return experimentInputSchema.safeParse(input);
}
