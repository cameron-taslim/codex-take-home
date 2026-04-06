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
          "The output must include a creative angle label, headline, optional subheadline, CTA, rationale, preview metadata, and one self-contained HTML fragment preview.",
          "Use the test directive and business inputs directly; do not require an intermediate approval artifact.",
          "Return fragment-only HTML, not a full document.",
          "Only use allowed semantic and layout tags with inline CSS and no script, iframe, form submission, remote stylesheets, external fonts, or external images.",
          "Do not use event handlers, viewport-sized elements, absolute or fixed positioning, or layout rules that can overflow a bounded container.",
          "Keep the fragment self-contained, fluid, wrapped, and constrained to max-width: 100% within a fixed preview frame.",
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
