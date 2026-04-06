import { z } from "zod";
import {
  experimentInputSchema,
  generatedVariantSchema,
} from "@/lib/validation/experiments";

export const codexGenerationInputSchema = experimentInputSchema;

export const codexGenerationResultSchema = z.object({
  variant: generatedVariantSchema,
});

export type CodexGenerationInput = z.infer<typeof codexGenerationInputSchema>;
export type CodexGenerationResult = z.infer<typeof codexGenerationResultSchema>;

export interface CodexProvider {
  generateVariants(input: CodexGenerationInput): Promise<CodexGenerationResult>;
}
