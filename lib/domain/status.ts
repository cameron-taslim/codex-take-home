const experimentStatusLabels: Record<string, string> = {
  draft: "Draft",
  generating: "Generating",
  generated: "Generated",
  generation_failed: "Failed",
};

export function formatExperimentStatus(status: string) {
  return experimentStatusLabels[status] ?? status;
}
