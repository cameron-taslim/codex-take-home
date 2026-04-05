import { z } from "zod";
import {
  briefSynthesisSchema,
  experimentInputSchema,
  experimentLaunchConfigSchema,
  generatedVariantSchema,
} from "@/lib/validation/experiments";

export const codexGenerationInputSchema = experimentInputSchema;
export const codexBriefSynthesisSchema = briefSynthesisSchema;

export const codexGenerationResultSchema = z.object({
  variant: generatedVariantSchema,
});
export const codexLaunchConfigSchema = experimentLaunchConfigSchema;

export type CodexGenerationInput = z.infer<typeof codexGenerationInputSchema>;
export type CodexBriefSynthesis = z.infer<typeof codexBriefSynthesisSchema>;
export type CodexGenerationResult = z.infer<typeof codexGenerationResultSchema>;
export type CodexLaunchConfig = z.infer<typeof codexLaunchConfigSchema>;

export interface CodexProvider {
  synthesizeBrief(input: CodexGenerationInput): Promise<CodexBriefSynthesis>;
  generateVariants(input: CodexGenerationInput): Promise<CodexGenerationResult>;
  generateLaunchConfig(input: {
    input: CodexGenerationInput;
    approvedBrief: CodexBriefSynthesis;
    variant: CodexGenerationResult["variant"];
  }): Promise<CodexLaunchConfig>;
}
