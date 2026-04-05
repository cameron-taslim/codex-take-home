import type { CodexBriefSynthesis } from "@/lib/codex/provider";

export type LockedElement =
  | "Lock hero image"
  | "Lock logo"
  | "Lock legal copy"
  | "Lock price display";

export type ExperimentBuilderValues = {
  experimentId?: string;
  name: string;
  componentType: string;
  primaryGoal: string;
  trafficSplit: "50/50" | "70/30" | "80/20";
  targetAudience: string;
  brandTone: string;
  brandConstraints: string;
  lockedElements: LockedElement[];
  seedContext: string;
  whatToTest: string;
  approvedBrief?: CodexBriefSynthesis;
};

export type ExperimentBuilderField =
  | "name"
  | "componentType"
  | "primaryGoal"
  | "trafficSplit"
  | "targetAudience"
  | "brandTone"
  | "brandConstraints"
  | "lockedElements"
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
  primaryGoal: "Increase clickthrough rate",
  trafficSplit: "50/50",
  targetAudience: "",
  brandTone: "Editorial",
  brandConstraints: "",
  lockedElements: ["Lock hero image", "Lock logo"],
  seedContext: "",
  whatToTest: "",
};
