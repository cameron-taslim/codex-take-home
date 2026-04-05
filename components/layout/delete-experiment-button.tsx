"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteExperimentAction } from "@/app/actions/delete-experiment";

export function DeleteExperimentButton({
  experimentId,
  experimentName,
}: {
  experimentId: string;
  experimentName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(`Delete "${experimentName}"? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteExperimentAction(experimentId);

      if (result.formError) {
        window.alert(result.formError);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      className="shell-delete-button"
      onClick={handleDelete}
      disabled={isPending}
      aria-label={`Delete ${experimentName}`}
      title={`Delete ${experimentName}`}
    >
      {isPending ? "..." : "Delete"}
    </button>
  );
}
