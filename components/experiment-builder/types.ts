export type ExperimentBuilderValues = {
  experimentId?: string;
  name: string;
  goal: string;
  pageType: string;
  targetAudience: string;
  tone: string;
  brandConstraints: string;
  seedContext: string;
};

export type ExperimentBuilderField =
  | "name"
  | "goal"
  | "pageType"
  | "targetAudience"
  | "tone"
  | "brandConstraints"
  | "seedContext";

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
};

export const emptyExperimentBuilderValues: ExperimentBuilderValues = {
  name: "",
  goal: "",
  pageType: "",
  targetAudience: "",
  tone: "",
  brandConstraints: "",
  seedContext: "",
};
