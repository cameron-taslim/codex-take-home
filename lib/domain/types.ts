import type {
  CodexGenerationRun,
  Experiment,
  ExperimentVariant,
  User,
} from "@prisma/client";

export type UserRecord = User;
export type ExperimentRecord = Experiment;
export type GenerationRunRecord = CodexGenerationRun;
export type VariantRecord = ExperimentVariant;
