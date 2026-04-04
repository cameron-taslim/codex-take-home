import { describe, expect, it, vi } from "vitest";
import { createDraftExperiment } from "@/lib/repositories/experiment-repository";

describe("experiment repository contracts", () => {
  it("creates a persisted draft experiment with default status", async () => {
    const create = vi.fn().mockResolvedValue({
      id: "exp_1",
      status: "draft",
      name: "Spring promotion",
    });

    const db = {
      experiment: {
        create,
      },
    };

    const result = await createDraftExperiment(db as never, {
      userId: "user_1",
      name: "Spring promotion",
    });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user_1",
        name: "Spring promotion",
        status: "draft",
      }),
    });
    expect(result.status).toBe("draft");
  });
});
