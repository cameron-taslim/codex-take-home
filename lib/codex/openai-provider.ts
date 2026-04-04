import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  type CodexGenerationInput,
  type CodexGenerationResult,
  type CodexProvider,
  codexGenerationResultSchema,
} from "@/lib/codex/provider";

export class OpenAICodexProvider implements CodexProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(apiKey: string, model = process.env.OPENAI_MODEL ?? "gpt-5-codex") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generateVariants(
    input: CodexGenerationInput,
  ): Promise<CodexGenerationResult> {
    const response = await this.client.responses.parse({
      model: this.model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: [
                "Generate 2 to 3 structured eCommerce landing page experiment variants.",
                "Honor the provided audience, tone, and brand constraints.",
                "Do not emit HTML, JSX, code, or arbitrary files.",
                "Return only safe structured content for preview cards.",
              ].join(" "),
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify(input),
            },
          ],
        },
      ],
      text: {
        format: zodTextFormat(codexGenerationResultSchema, "experiment_variants"),
      },
    });

    if (!response.output_parsed) {
      throw new Error("Codex returned an empty structured response.");
    }

    return response.output_parsed;
  }
}
