export type UserRecord = {
  id: string;
  email: string;
  displayName?: string | null;
  passwordHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ExperimentRecord = {
  id: string;
  userId: string;
  name: string;
  pageType: string;
  targetAudience: string;
  tone: string;
  brandConstraints: string;
  seedContext: string | null;
  whatToTest: string;
  status: string;
  latestGenerationRunId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  latestSavedRun?: GenerationRunRecord | null;
};

export type GenerationRunRecord = {
  id: string;
  experimentId: string;
  status: string;
  promptSnapshot: unknown;
  startedAt: Date;
  completedAt: Date | null;
  errorMessage: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type VariantRecord = {
  id: string;
  generationRunId: string;
  experimentId: string;
  label: string;
  headline: string;
  subheadline: string | null;
  bodyCopy: string;
  ctaText: string;
  htmlContent: string;
  layoutNotes: string;
  previewConfig: unknown;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};
