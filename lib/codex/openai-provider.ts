import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  codexGenerationResultSchema,
  codexSuggestionResultSchema,
  type CodexGenerationInput,
  type CodexGenerationResult,
  type CodexProvider,
  type CodexSuggestionInput,
  type CodexSuggestionProvider,
  type CodexSuggestionResult,
} from "@/lib/codex/provider";

export class OpenAICodexProvider implements CodexProvider, CodexSuggestionProvider {
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
          "The HTML fragment is customer-facing creative only.",
          "Any text shown in the HTML should read like storefront marketing copy spoken to a shopper, never to the internal experiment team.",
          "Do not render rationale, critique, design review language, strategist notes, or labels such as why this works, testing focus, stylist perspective, or layout notes inside the HTML.",
          "Keep rationale and layout notes concise and useful, but reserve them for the structured fields outside the HTML fragment.",
          "The HTML fragment should be customer-facing, visually resolved, and fully designed with inline CSS on the returned elements.",
          "The model owns the design completely through composition, hierarchy, spacing, background treatment, accent usage, and inline styling inside the fragment.",
          "Choose one coherent aesthetic and execute it consistently with a strong visual point of view, not a wireframe or placeholder treatment.",
          "Be liberal with graphics created in HTML and CSS: use layered gradients, tinted panels, glow, soft shadows, badges, dividers, statistic chips, callout blocks, and decorative shapes when they support the concept.",
          "Always introduce a deliberate color story with visible contrast. Avoid plain white backgrounds, default black text on white cards, or nearly colorless compositions unless the user explicitly asks for a stark monochrome treatment.",
          "Give the fragment a designed backdrop and designed inner surfaces so it feels finished even without any app chrome around it.",
          "Use a richer visual hierarchy: headline scale contrast, supporting copy blocks, a high-emphasis CTA, and at least one secondary visual treatment such as an eyebrow, feature row, proof card, or highlight panel.",
          "Favor premium eCommerce art direction over minimal SaaS UI. The result should feel merchandised, styled, and presentation-ready inside a bounded preview card.",
          "Aim for balanced negative space, readable contrast, generous spacing, rounded surfaces, and a clear focal CTA.",
          "Use the test directive and business inputs directly; do not require an intermediate approval artifact.",
          "Return fragment-only HTML, not a full document.",
          "Only use allowed semantic and layout tags with inline CSS and no script, iframe, form submission, remote stylesheets, external fonts, or external images.",
          "Do not use event handlers, viewport-sized elements, absolute or fixed positioning, or layout rules that can overflow a bounded container.",
          "Keep the fragment self-contained, fluid, wrapped, and constrained to max-width: 100% within a fixed preview frame.",
          "Do not rely on any app-side theming, template wrappers, or fallback design metadata.",
          "Avoid flat generic white cards, bare text-only stacks, multiple competing accent colors, coupon-like promo styling unless explicitly requested, cramped layouts, or placeholder-looking blocks.",
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

  async generateSuggestions(
    input: CodexSuggestionInput,
  ): Promise<CodexSuggestionResult> {
    const response = await this.client.responses.parse({
      model: this.model,
      input: buildMessages(
        [
          "Generate five rerun prompt suggestions for an eCommerce experiment detail page.",
          "Base each suggestion on the saved experiment brief and current saved output when present.",
          "Return exactly five suggestions.",
          "The five suggestions must each target a different type of change.",
          "Cover these categories across the set: headline or title, tone or voice, CTA or button treatment, layout or section arrangement, and visual theme or color direction.",
          "Do not make more than one suggestion primarily about the headline.",
          "Each title must be short and scannable.",
          "Each prompt must be concise, specific, and ready to use as the next rerun instruction.",
          "Keep every prompt to one sentence and no more than 120 characters.",
          "Do not repeat the same angle across suggestions.",
          "Do not add commentary, numbering, or explanation outside the structured response.",
        ].join(" "),
        input,
      ),
      text: {
        format: zodTextFormat(codexSuggestionResultSchema, "experiment_suggestions"),
      },
    });

    if (!response.output_parsed) {
      throw new Error("Codex returned empty prompt suggestions.");
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
