import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  codexGenerationResultSchema,
  type CodexGenerationInput,
  type CodexGenerationResult,
  type CodexProvider,
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
      input: buildMessages(
        [
          "Generate one storefront experiment output from the merchandiser inputs.",
          "The output must include a creative angle label, headline, optional subheadline, CTA, rationale, and preview metadata.",
          "Use the test directive and business inputs directly; do not require an intermediate approval artifact.",
          "Do not emit HTML, JSX, arbitrary code, file paths, or technical identifiers.",
        ].join(" "),
        input,
      ),
      text: {
        format: zodTextFormat(codexGenerationResultSchema, "experiment_output"),
      },
    });

    if (!response.output_parsed) {
      throw new Error("Codex returned an empty structured response.");
    }

    return response.output_parsed;
  }
}

function buildMessages(instruction: string, payload: unknown) {
  return [
    {
      role: "system" as const,
      content: [
        {
          type: "input_text" as const,
          text: instruction,
        },
      ],
    },
    {
      role: "user" as const,
      content: [
        {
          type: "input_text" as const,
          text: JSON.stringify(payload),
        },
      ],
    },
  ];
}
