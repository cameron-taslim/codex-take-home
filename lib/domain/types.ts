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
  goal: string;
  pageType: string;
  targetAudience: string;
  tone: string;
  brandConstraints: string;
  seedContext: string | null;
  whatToTest: string;
  trafficSplit: string;
  lockedElements: unknown;
  approvedBrief: unknown;
  launchMetric?: string | null;
  launchAt?: Date | null;
  launchConfig?: unknown;
  brandAssetSetKey?: string;
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
  resultSnapshot?: unknown;
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
  layoutNotes: string;
  previewConfig: unknown;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};
