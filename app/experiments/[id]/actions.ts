"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth/session";
import { generateExperimentVariants } from "@/lib/codex/service";

export async function rerunExperimentAction(experimentId: string) {
  const session = await getServerSession();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      formError: "Your session expired. Sign in again to regenerate variants.",
    };
  }

  try {
    await generateExperimentVariants({
      experimentId,
      userId,
    });

    revalidatePath(`/experiments/${experimentId}`);
    revalidatePath("/dashboard");

    return {
      ok: true,
    };
  } catch (error) {
    return {
      formError:
        error instanceof Error ? error.message : "Variant generation failed. Try again.",
    };
  }
}
