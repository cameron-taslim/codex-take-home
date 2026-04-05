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
        <div className="stack" style={{ gap: 6 }}>
          <p className="builder-section-kicker">Generation workspace</p>
          <h2 className="detail-section-title">AI suggestions</h2>
        </div>

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
              <span className="detail-suggestion-title">{suggestion.title}</span>
              <span className="detail-suggestion-copy">{suggestion.prompt}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="detail-custom-prompt-panel">
        <div className="stack" style={{ gap: 6 }}>
          <p className="builder-section-kicker">Custom prompt</p>
          <p className="muted detail-section-copy">
            Ignore the suggestions and write your own generation guidance instead.
          </p>
        </div>

        <label className="stack form-field">
          <span className="form-label">Next generation guidance</span>
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

        <div className="detail-rerun-note">
          {activeSuggestion ? (
            <p className="muted rerun-note">Selected suggestion: {activeSuggestion}</p>
          ) : (
            <p className="muted rerun-note">
              The saved experiment brief remains the base context for the next run.
            </p>
          )}
        </div>

        <Button type="button" onClick={handleRerun} loading={isPending}>
          Generate output
        </Button>
      </div>
    </section>
  );
}
