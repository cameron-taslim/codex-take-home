import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  codexBriefSynthesisSchema,
  codexGenerationResultSchema,
  codexLaunchConfigSchema,
  type CodexBriefSynthesis,
  type CodexGenerationInput,
  type CodexGenerationResult,
  type CodexLaunchConfig,
  type CodexProvider,
} from "@/lib/codex/provider";

export class OpenAICodexProvider implements CodexProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(apiKey: string, model = process.env.OPENAI_MODEL ?? "gpt-5-codex") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async synthesizeBrief(input: CodexGenerationInput): Promise<CodexBriefSynthesis> {
    const response = await this.client.responses.parse({
      model: this.model,
      input: buildMessages(
        "Create a structured storefront experiment brief from the merchandiser inputs. Keep it readable, product-safe, and non-technical.",
        input,
      ),
      text: {
        format: zodTextFormat(codexBriefSynthesisSchema, "storefront_brief"),
      },
    });

    if (!response.output_parsed) {
      throw new Error("Codex returned an empty structured brief.");
    }

    return response.output_parsed;
  }

  async generateVariants(
    input: CodexGenerationInput,
  ): Promise<CodexGenerationResult> {
    const response = await this.client.responses.parse({
      model: this.model,
      input: buildMessages(
        [
          "Generate one storefront experiment output from the approved merchandiser brief.",
          "The output must include a creative angle label, headline, optional subheadline, CTA, rationale, and preview metadata.",
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

  async generateLaunchConfig(input: {
    input: CodexGenerationInput;
    approvedBrief: CodexBriefSynthesis;
    variant: CodexGenerationResult["variant"];
  }): Promise<CodexLaunchConfig> {
    const response = await this.client.responses.parse({
      model: this.model,
      input: buildMessages(
        "Generate hidden experiment launch wiring for the engineering layer. Return only structured config fields.",
        input,
      ),
      text: {
        format: zodTextFormat(codexLaunchConfigSchema, "experiment_launch_config"),
      },
    });

    if (!response.output_parsed) {
      throw new Error("Codex returned an empty launch config.");
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
