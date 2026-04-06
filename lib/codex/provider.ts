import { z } from "zod";
import {
  briefSynthesisSchema,
  experimentInputSchema,
  generatedVariantSchema,
} from "@/lib/validation/experiments";

export const codexGenerationInputSchema = experimentInputSchema;
export const codexBriefSynthesisSchema = briefSynthesisSchema;

export const codexGenerationResultSchema = z.object({
  variant: generatedVariantSchema,
});

export type CodexGenerationInput = z.infer<typeof codexGenerationInputSchema>;
export type CodexBriefSynthesis = z.infer<typeof codexBriefSynthesisSchema>;
export type CodexGenerationResult = z.infer<typeof codexGenerationResultSchema>;

export interface CodexProvider {
  synthesizeBrief(input: CodexGenerationInput): Promise<CodexBriefSynthesis>;
  generateVariants(input: CodexGenerationInput): Promise<CodexGenerationResult>;
}
