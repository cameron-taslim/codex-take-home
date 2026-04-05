import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  revalidatePathMock,
  getServerSessionMock,
  createDraftExperimentMock,
  updateExperimentBriefMock,
  synthesizeExperimentBriefMock,
  generateExperimentVariantsMock,
} = vi.hoisted(() => ({
  revalidatePathMock: vi.fn(),
  getServerSessionMock: vi.fn(),
  createDraftExperimentMock: vi.fn(),
  updateExperimentBriefMock: vi.fn(),
  synthesizeExperimentBriefMock: vi.fn(),
  generateExperimentVariantsMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/auth/session", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

vi.mock("@/lib/repositories/experiment-repository", () => ({
  createDraftExperiment: createDraftExperimentMock,
  updateExperimentBrief: updateExperimentBriefMock,
}));

vi.mock("@/lib/codex/service", () => ({
  synthesizeExperimentBrief: synthesizeExperimentBriefMock,
  generateExperimentVariants: generateExperimentVariantsMock,
}));

import {
  generateExperimentAction,
  prepareExperimentBriefAction,
  saveDraftExperimentAction,
} from "@/app/experiments/new/actions";

const baseValues = {
  name: "Spring hero banner test",
  componentType: "Hero banner",
  primaryGoal: "Increase clickthrough rate",
  trafficSplit: "50/50" as const,
  targetAudience: "Returning shoppers looking for premium seasonal pieces",
  brandTone: "Editorial",
  brandConstraints: "Avoid discount framing",
  lockedElements: ["Lock hero image", "Lock logo"] as const,
  seedContext: "Feature lightweight outerwear",
  whatToTest: "Generate three headlines that lead with quality.",
  variantCount: 3 as const,
};

describe("experiment builder actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an auth error instead of persisting when the session is missing", async () => {
    getServerSessionMock.mockResolvedValue(null);

    await expect(saveDraftExperimentAction(baseValues)).resolves.toEqual({
      values: baseValues,
      formError: "Your session expired. Sign in again to save this draft.",
    });
  });

  it("creates and returns a persisted draft experiment", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });
    createDraftExperimentMock.mockResolvedValue({ id: "exp_123" });

    await expect(saveDraftExperimentAction(baseValues)).resolves.toEqual({
      values: {
        ...baseValues,
        experimentId: "exp_123",
      },
      experimentId: "exp_123",
      savedMessage: "Draft saved. Keep refining the brief or analyze it when ready.",
      stage: "draft",
    });

    expect(createDraftExperimentMock).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        userId: "user_1",
        goal: "Increase clickthrough rate",
        pageType: "Hero banner",
        tone: "Editorial",
        whatToTest: "Generate three headlines that lead with quality.",
      }),
    );
  });

  it("rejects incomplete analysis requests before invoking synthesis", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });

    await expect(
      prepareExperimentBriefAction({
        ...baseValues,
        brandConstraints: "",
        lockedElements: [],
      }),
    ).resolves.toEqual({
      values: {
        ...baseValues,
        brandConstraints: "",
        lockedElements: [],
      },
      fieldErrors: {
        brandConstraints: "Brand constraints are required.",
        lockedElements: "Choose at least one locked element.",
      },
    });

    expect(synthesizeExperimentBriefMock).not.toHaveBeenCalled();
  });

  it("persists the brief and returns the synthesized confirmation stage", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });
    createDraftExperimentMock.mockResolvedValue({ id: "exp_123" });
    synthesizeExperimentBriefMock.mockResolvedValue({
      hypothesis: "We believe a quality-led headline will improve clickthrough rate.",
      whatIsChanging: ["headline copy", "CTA label"],
      whatIsLocked: ["hero image", "logo"],
      successMetric: "Increase clickthrough rate",
      audienceSignal: "Returning shoppers",
    });

    const result = await prepareExperimentBriefAction(baseValues);

    expect(result.experimentId).toBe("exp_123");
    expect(result.stage).toBe("brief_ready");
    expect(result.values.approvedBrief?.whatIsLocked).toEqual(["hero image", "logo"]);
    expect(synthesizeExperimentBriefMock).toHaveBeenCalledWith({
      experimentId: "exp_123",
      userId: "user_1",
    });
  });

  it("requires the approved brief before generation", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });

    await expect(generateExperimentAction(baseValues)).resolves.toEqual({
      values: baseValues,
      formError: "Approve the synthesized brief before generating variants.",
    });

    expect(generateExperimentVariantsMock).not.toHaveBeenCalled();
  });

  it("generates variants after brief approval and redirects to detail", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });
    createDraftExperimentMock.mockResolvedValue({ id: "exp_123" });
    generateExperimentVariantsMock.mockResolvedValue({
      runId: "run_123",
      variantCount: 3,
    });

    await expect(
      generateExperimentAction({
        ...baseValues,
        approvedBrief: {
          hypothesis: "We believe a quality-led headline will improve clickthrough rate.",
          whatIsChanging: ["headline copy", "CTA label"],
          whatIsLocked: ["hero image", "logo"],
          successMetric: "Increase clickthrough rate",
          audienceSignal: "Returning shoppers",
        },
      }),
    ).resolves.toEqual({
      values: {
        ...baseValues,
        experimentId: "exp_123",
        approvedBrief: {
          hypothesis: "We believe a quality-led headline will improve clickthrough rate.",
          whatIsChanging: ["headline copy", "CTA label"],
          whatIsLocked: ["hero image", "logo"],
          successMetric: "Increase clickthrough rate",
          audienceSignal: "Returning shoppers",
        },
      },
      experimentId: "exp_123",
      redirectTo: "/experiments/exp_123",
      stage: "generated",
    });

    expect(generateExperimentVariantsMock).toHaveBeenCalledWith({
      experimentId: "exp_123",
      userId: "user_1",
    });
  });
});
