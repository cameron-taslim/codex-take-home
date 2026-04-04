import { z } from "zod";
import { experimentInputSchema, generatedVariantSchema } from "@/lib/validation/experiments";

export const codexGenerationInputSchema = experimentInputSchema;

export const codexGenerationResultSchema = z.object({
  variants: z.array(generatedVariantSchema).min(2).max(3),
});

export type CodexGenerationInput = z.infer<typeof codexGenerationInputSchema>;
export type CodexGenerationResult = z.infer<typeof codexGenerationResultSchema>;

export interface CodexProvider {
  generateVariants(input: CodexGenerationInput): Promise<CodexGenerationResult>;
}
