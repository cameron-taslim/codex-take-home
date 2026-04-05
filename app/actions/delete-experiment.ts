"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth/session";
import { deleteExperimentForUser } from "@/lib/repositories/experiment-repository";

export async function deleteExperimentAction(experimentId: string) {
  const session = await getServerSession();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      formError: "Your session expired. Sign in again to delete this experiment.",
    };
  }

  try {
    await deleteExperimentForUser(experimentId, userId);

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath(`/experiments/${experimentId}`);

    return { ok: true };
  } catch (error) {
    return {
      formError: error instanceof Error ? error.message : "Experiment deletion failed.",
    };
  }
}
