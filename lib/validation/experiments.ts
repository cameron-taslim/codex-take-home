import { z } from "zod";

const requiredText = (message: string) => z.string().trim().min(1, message);

export const componentTypeSchema = z.enum([
  "Hero banner",
  "Landing page",
  "Product detail page (PDP) buy box",
  "Navigation CTA",
  "Category page header",
]);
export const brandToneSchema = z.enum([
  "Editorial",
  "Urgent",
  "Playful",
  "Minimalist",
  "Confident",
  "Warm",
]);

export const previewConfigSchema = z.object({
  layout: z.enum(["spotlight", "split", "stacked"]).default("spotlight"),
  emphasis: z.enum(["headline", "cta", "proof"]).default("headline"),
  theme: z.enum(["atelier-spring", "midnight-ledger"]).default("atelier-spring"),
  assetSetKey: z.string().min(1),
});

export const generatedVariantSchema = z.object({
  label: z.string().min(1).max(40),
  headline: z.string().trim().min(1).max(80),
  subheadline: z.string().optional(),
  bodyCopy: z.string().min(1),
  ctaText: z.string().trim().min(1).max(20),
  htmlContent: z.string().trim().min(1),
  layoutNotes: z.string().min(1),
  previewConfig: previewConfigSchema,
});

export const experimentDraftSchema = z.object({
  userId: z.string().min(1),
  name: requiredText("Experiment name is required."),
  pageType: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z.string().optional(),
  brandConstraints: z.string().optional(),
  seedContext: z.string().optional(),
  whatToTest: z.string().optional(),
});

export const experimentInputSchema = z.object({
  experimentName: requiredText("Experiment name is required."),
  componentType: componentTypeSchema,
  targetAudience: requiredText("Target audience is required."),
  brandTone: brandToneSchema.or(requiredText("Brand tone is required.")),
  brandConstraints: requiredText("Brand constraints are required."),
  seedContext: requiredText("Seed context is required."),
  whatToTest: requiredText("What to test is required."),
});

export function validateGenerationInput(input: unknown) {
  return experimentInputSchema.safeParse(input);
}
