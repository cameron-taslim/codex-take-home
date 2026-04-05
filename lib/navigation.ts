import { listExperimentsForUser } from "@/lib/repositories/experiment-repository";

export async function getAuthenticatedHomePath(userId: string) {
  const experiments = await listExperimentsForUser(userId);
  const latestExperiment = experiments[0];

  if (!latestExperiment) {
    return "/experiments/new";
  }

  return `/experiments/${latestExperiment.id}`;
}
