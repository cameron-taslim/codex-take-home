"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth/session";
import { generateExperimentVariants } from "@/lib/codex/service";

async function getUserId() {
  const session = await getServerSession();

  return session?.user?.id;
}

export async function rerunExperimentAction(
  experimentId: string,
  promptOverride?: string,
) {
  const userId = await getUserId();

  if (!userId) {
    return {
      formError: "Your session expired. Sign in again to regenerate output.",
    };
  }

  try {
    await generateExperimentVariants({
      experimentId,
      userId,
      promptOverride,
    });

    revalidatePath("/");
    revalidatePath(`/experiments/${experimentId}`);
    revalidatePath("/dashboard");

    return { ok: true };
  } catch (error) {
    return {
      formError: error instanceof Error ? error.message : "Output generation failed.",
    };
  }
}
