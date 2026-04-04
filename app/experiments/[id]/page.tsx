import { AppShell } from "@/components/layout/app-shell";

export default async function ExperimentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell
      title="Experiment detail scaffold"
      description={`Protected detail route for experiment ${id}. Shared repositories and generation history contracts are ready for page implementation.`}
    />
  );
}
