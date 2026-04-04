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
    <div className="stack" style={{ gap: 12 }}>
      {formError ? <ErrorBanner message={formError} /> : null}
      <Button type="button" onClick={handleRerun} loading={isPending}>
        Regenerate
      </Button>
      <p className="muted" style={{ margin: 0, fontSize: 14 }}>
        Reruns use the saved brief, append a new generation run, and preserve prior
        history.
      </p>
    </div>
  );
}
