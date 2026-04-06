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
          "The output must include a creative angle label, headline, optional subheadline, CTA, rationale, layout notes, and one self-contained HTML fragment preview.",
          "The HTML fragment should be customer-facing, visually resolved, and fully designed with inline CSS on the returned elements.",
          "The model owns the design completely through composition, hierarchy, spacing, background treatment, accent usage, and inline styling inside the fragment.",
          "Choose one coherent aesthetic and execute it consistently.",
          "Use a soft layered background or gradient, one restrained accent color, tasteful badge or banner treatment, generous spacing, rounded surfaces, and a clear focal CTA.",
          "Aim for balanced negative space, readable contrast, and a premium eCommerce feel inside a bounded preview card.",
          "Use the test directive and business inputs directly; do not require an intermediate approval artifact.",
          "Return fragment-only HTML, not a full document.",
          "Only use allowed semantic and layout tags with inline CSS and no script, iframe, form submission, remote stylesheets, external fonts, or external images.",
          "Do not use event handlers, viewport-sized elements, absolute or fixed positioning, or layout rules that can overflow a bounded container.",
          "Keep the fragment self-contained, fluid, wrapped, and constrained to max-width: 100% within a fixed preview frame.",
          "Do not rely on any app-side theming, template wrappers, or fallback design metadata.",
          "Avoid flat generic white cards, multiple competing accent colors, coupon-like promo styling unless explicitly requested, cramped layouts, or placeholder-looking blocks.",
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
