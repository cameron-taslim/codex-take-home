import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  revalidatePathMock,
  getServerSessionMock,
  createDraftExperimentMock,
  updateExperimentBriefMock,
  generateExperimentVariantsMock,
} = vi.hoisted(() => ({
  revalidatePathMock: vi.fn(),
  getServerSessionMock: vi.fn(),
  createDraftExperimentMock: vi.fn(),
  updateExperimentBriefMock: vi.fn(),
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
  generateExperimentVariants: generateExperimentVariantsMock,
}));

import {
  generateExperimentAction,
  saveDraftExperimentAction,
} from "@/app/experiments/new/actions";

const baseValues = {
  name: "Spring hero banner test",
  componentType: "Hero banner",
  targetAudience: "Returning shoppers looking for premium seasonal pieces",
  brandTone: "Editorial",
  brandConstraints: "Avoid discount framing",
  seedContext: "Feature lightweight outerwear",
  whatToTest: "Generate three headlines that lead with quality.",
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
      savedMessage: "Draft saved. Keep refining the brief or generate output when ready.",
      stage: "draft",
    });

    expect(createDraftExperimentMock).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        userId: "user_1",
        pageType: "Hero banner",
        tone: "Editorial",
        whatToTest: "Generate three headlines that lead with quality.",
      }),
    );
  });

  it("rejects incomplete generation requests before invoking Codex", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });

    await expect(
      generateExperimentAction({
        ...baseValues,
        brandConstraints: "",
      }),
    ).resolves.toEqual({
      values: {
        ...baseValues,
        brandConstraints: "",
      },
      fieldErrors: {
        brandConstraints: "Brand constraints are required.",
      },
    });

    expect(generateExperimentVariantsMock).not.toHaveBeenCalled();
  });

  it("generates output directly and redirects to detail", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });
    createDraftExperimentMock.mockResolvedValue({ id: "exp_123" });
    generateExperimentVariantsMock.mockResolvedValue({
      runId: "run_123",
      variantCount: 1,
    });

    await expect(
      generateExperimentAction(baseValues),
    ).resolves.toEqual({
      values: {
        ...baseValues,
        experimentId: "exp_123",
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
