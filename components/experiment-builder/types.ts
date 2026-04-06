import type { CodexBriefSynthesis } from "@/lib/codex/provider";

export type ExperimentBuilderValues = {
  experimentId?: string;
  name: string;
  componentType: string;
  targetAudience: string;
  brandTone: string;
  brandConstraints: string;
  seedContext: string;
  whatToTest: string;
  approvedBrief?: CodexBriefSynthesis;
};

export type ExperimentBuilderField =
  | "name"
  | "componentType"
  | "targetAudience"
  | "brandTone"
  | "brandConstraints"
  | "seedContext"
  | "whatToTest";

export type ExperimentBuilderFieldErrors = Partial<
  Record<ExperimentBuilderField, string>
>;

export type ExperimentBuilderActionResult = {
  values: ExperimentBuilderValues;
  fieldErrors?: ExperimentBuilderFieldErrors;
  formError?: string;
  experimentId?: string;
  savedMessage?: string;
  redirectTo?: string;
  stage?: "draft" | "brief_ready" | "generated";
};

export const emptyExperimentBuilderValues: ExperimentBuilderValues = {
  name: "",
  componentType: "Hero banner",
  targetAudience: "",
  brandTone: "Editorial",
  brandConstraints: "",
  seedContext: "",
  whatToTest: "",
};
