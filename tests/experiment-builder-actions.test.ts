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

describe("experiment builder actions", () => {
  beforeEach(() => {
    revalidatePathMock.mockReset();
    getServerSessionMock.mockReset();
    createDraftExperimentMock.mockReset();
    updateExperimentBriefMock.mockReset();
    generateExperimentVariantsMock.mockReset();
  });

  it("returns an auth error instead of persisting when the session is missing", async () => {
    getServerSessionMock.mockResolvedValue(null);

    await expect(
      saveDraftExperimentAction({
        name: "Holiday hero refresh",
        goal: "",
        pageType: "",
        targetAudience: "",
        tone: "",
        brandConstraints: "",
        seedContext: "",
      }),
    ).resolves.toEqual({
      values: {
        name: "Holiday hero refresh",
        goal: "",
        pageType: "",
        targetAudience: "",
        tone: "",
        brandConstraints: "",
        seedContext: "",
      },
      formError: "Your session expired. Sign in again to save this draft.",
    });

    expect(createDraftExperimentMock).not.toHaveBeenCalled();
    expect(updateExperimentBriefMock).not.toHaveBeenCalled();
  });

  it("creates and returns a persisted draft experiment", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });
    createDraftExperimentMock.mockResolvedValue({
      id: "exp_123",
    });

    await expect(
      saveDraftExperimentAction({
        name: " Holiday hero refresh ",
        goal: "",
        pageType: "",
        targetAudience: "",
        tone: "",
        brandConstraints: "",
        seedContext: " Existing campaign notes ",
      }),
    ).resolves.toEqual({
      values: {
        experimentId: "exp_123",
        name: "Holiday hero refresh",
        goal: "",
        pageType: "",
        targetAudience: "",
        tone: "",
        brandConstraints: "",
        seedContext: "Existing campaign notes",
      },
      experimentId: "exp_123",
      savedMessage: "Draft saved. Continue editing or generate variants.",
    });

    expect(createDraftExperimentMock).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        userId: "user_1",
        name: "Holiday hero refresh",
        seedContext: "Existing campaign notes",
      }),
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard");
    expect(revalidatePathMock).toHaveBeenCalledWith("/experiments/exp_123");
  });

  it("rejects incomplete generation requests before invoking Codex", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });

    await expect(
      generateExperimentAction({
        name: "Holiday hero refresh",
        goal: "",
        pageType: "",
        targetAudience: "",
        tone: "",
        brandConstraints: "",
        seedContext: "",
      }),
    ).resolves.toEqual({
      values: {
        name: "Holiday hero refresh",
        goal: "",
        pageType: "",
        targetAudience: "",
        tone: "",
        brandConstraints: "",
        seedContext: "",
      },
      fieldErrors: {
        goal: "Experiment goal is required.",
        pageType: "Target page type is required.",
        targetAudience: "Target audience is required.",
        tone: "Tone is required.",
      },
    });

    expect(createDraftExperimentMock).not.toHaveBeenCalled();
    expect(generateExperimentVariantsMock).not.toHaveBeenCalled();
  });

  it("persists the brief, triggers generation, and returns the detail redirect", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });
    createDraftExperimentMock.mockResolvedValue({
      id: "exp_123",
    });
    generateExperimentVariantsMock.mockResolvedValue({
      runId: "run_123",
      variantCount: 3,
    });

    await expect(
      generateExperimentAction({
        name: "Holiday hero refresh",
        goal: "Increase clickthrough",
        pageType: "Homepage hero",
        targetAudience: "Gift buyers",
        tone: "Confident",
        brandConstraints: "Avoid discount language",
        seedContext: "",
      }),
    ).resolves.toEqual({
      values: {
        experimentId: "exp_123",
        name: "Holiday hero refresh",
        goal: "Increase clickthrough",
        pageType: "Homepage hero",
        targetAudience: "Gift buyers",
        tone: "Confident",
        brandConstraints: "Avoid discount language",
        seedContext: "",
      },
      experimentId: "exp_123",
      redirectTo: "/experiments/exp_123",
    });

    expect(generateExperimentVariantsMock).toHaveBeenCalledWith({
      experimentId: "exp_123",
      userId: "user_1",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard");
    expect(revalidatePathMock).toHaveBeenCalledWith("/experiments/exp_123");
  });

  it("keeps the form recoverable when generation fails after persistence", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user_1", email: "demo@example.com" },
    });
    createDraftExperimentMock.mockResolvedValue({
      id: "exp_123",
    });
    generateExperimentVariantsMock.mockRejectedValue(new Error("provider down"));

    await expect(
      generateExperimentAction({
        name: "Holiday hero refresh",
        goal: "Increase clickthrough",
        pageType: "Homepage hero",
        targetAudience: "Gift buyers",
        tone: "Confident",
        brandConstraints: "",
        seedContext: "Existing campaign notes",
      }),
    ).resolves.toEqual({
      values: {
        experimentId: "exp_123",
        name: "Holiday hero refresh",
        goal: "Increase clickthrough",
        pageType: "Homepage hero",
        targetAudience: "Gift buyers",
        tone: "Confident",
        brandConstraints: "",
        seedContext: "Existing campaign notes",
      },
      experimentId: "exp_123",
      formError: "provider down",
    });

    expect(generateExperimentVariantsMock).toHaveBeenCalledWith({
      experimentId: "exp_123",
      userId: "user_1",
    });
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
