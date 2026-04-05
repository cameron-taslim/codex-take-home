"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rerunExperimentAction } from "@/app/experiments/[id]/actions";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/error-banner";

type Suggestion = {
  title: string;
  prompt: string;
};

export function RerunControls({
  experimentId,
  suggestions,
  defaultPrompt,
}: {
  experimentId: string;
  suggestions: Suggestion[];
  defaultPrompt: string;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string>();
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState(defaultPrompt);
  const [isPending, startTransition] = useTransition();

  function handleRerun() {
    setFormError(undefined);

    startTransition(async () => {
      const promptOverride = customPrompt.trim();
      const result = await rerunExperimentAction(
        experimentId,
        promptOverride.length > 0 ? promptOverride : undefined,
      );

      if (result.formError) {
        setFormError(result.formError);
        return;
      }

      router.refresh();
    });
  }

  return (
    <section className="stack rerun-controls">
      {formError ? <ErrorBanner message={formError} /> : null}

      <div className="detail-suggestion-panel">
        <h2 className="detail-section-title">AI suggestions</h2>

        <div className="stack detail-suggestion-list">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.title}
              type="button"
              className="detail-suggestion-card"
              data-active={customPrompt === suggestion.prompt}
              onClick={() => {
                setActiveSuggestion(suggestion.title);
                setCustomPrompt(suggestion.prompt);
              }}
            >
              <span className="detail-suggestion-copy">{suggestion.prompt}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="detail-custom-prompt-panel">
        <div className="stack" style={{ gap: 6 }}>
          <p className="builder-section-kicker">Custom prompt</p>
        </div>

        <label className="stack form-field">
          <textarea
            className="field-base detail-custom-prompt-input"
            value={customPrompt}
            onChange={(event) => {
              setActiveSuggestion(null);
              setCustomPrompt(event.target.value);
            }}
            placeholder="Describe the next angle to explore for this experiment."
          />
        </label>

        {activeSuggestion ? (
          <p className="muted rerun-note">Selected suggestion: {activeSuggestion}</p>
        ) : null}

        <Button
          type="button"
          onClick={handleRerun}
          loading={isPending}
          style={{ minHeight: 36, paddingInline: 14, fontSize: 12, width: "fit-content" }}
        >
          Generate output
        </Button>
      </div>
    </section>
  );
}
