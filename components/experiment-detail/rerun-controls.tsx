"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rerunExperimentAction } from "@/app/experiments/[id]/actions";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/error-banner";

export function RerunControls({ experimentId }: { experimentId: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function handleRerun() {
    setFormError(undefined);

    startTransition(async () => {
      const result = await rerunExperimentAction(experimentId);

      if (result.formError) {
        setFormError(result.formError);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="stack rerun-controls">
      {formError ? <ErrorBanner message={formError} /> : null}
      <div className="rerun-action-rail">
        <div className="stack rerun-copy">
          <p className="builder-section-kicker">Generation run</p>
          <p className="muted rerun-note">
            Reruns use the saved brief, append a new generation run, and preserve
            prior history.
          </p>
        </div>
        <Button type="button" onClick={handleRerun} loading={isPending}>
          Regenerate
        </Button>
      </div>
    </div>
  );
}
