import { z } from "zod";
import {
  experimentInputSchema,
  generatedVariantSchema,
} from "@/lib/validation/experiments";

export const codexGenerationInputSchema = experimentInputSchema;

export const codexGenerationResultSchema = z.object({
  variant: generatedVariantSchema,
});

export const codexSuggestionInputSchema = z.object({
  experimentName: z.string().trim().min(1),
  componentType: z.string().trim().min(1),
  targetAudience: z.string().trim().min(1),
  brandTone: z.string().trim().min(1),
  brandConstraints: z.string().trim().min(1),
  seedContext: z.string().trim().default(""),
  currentTestPrompt: z.string().trim().default(""),
  currentVariant: z
    .object({
      headline: z.string().trim().min(1),
      subheadline: z.string().trim().default(""),
      bodyCopy: z.string().trim().default(""),
      ctaText: z.string().trim().default(""),
      layoutNotes: z.string().trim().default(""),
    })
    .nullable(),
});

export const codexPromptSuggestionSchema = z.object({
  title: z.string().trim().min(1).max(32),
  prompt: z.string().trim().min(1).max(120),
});

export const codexSuggestionResultSchema = z.object({
  suggestions: z.array(codexPromptSuggestionSchema).length(5),
});

export type CodexGenerationInput = z.infer<typeof codexGenerationInputSchema>;
export type CodexGenerationResult = z.infer<typeof codexGenerationResultSchema>;
export type CodexPromptSuggestion = z.infer<typeof codexPromptSuggestionSchema>;
export type CodexSuggestionInput = z.infer<typeof codexSuggestionInputSchema>;
export type CodexSuggestionResult = z.infer<typeof codexSuggestionResultSchema>;

export interface CodexProvider {
  generateVariants(input: CodexGenerationInput): Promise<CodexGenerationResult>;
}

export interface CodexSuggestionProvider {
  generateSuggestions(input: CodexSuggestionInput): Promise<CodexSuggestionResult>;
}
