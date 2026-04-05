import React from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getServerSession } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";

export default async function LoginPage() {
  const session = await getServerSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="auth-frame">
      <div className="auth-shell">
        <section className="auth-aside">
          <div className="stack" style={{ gap: 24, position: "relative", zIndex: 1 }}>
            <div className="cluster" style={{ justifyContent: "space-between" }}>
              <p className="eyebrow">Experiment Lab</p>
              <span className="shell-badge">Codex workflow</span>
            </div>
            <div className="stack" style={{ gap: 14 }}>
              <h1 style={{ margin: 0, fontSize: "clamp(2.4rem, 5vw, 4.25rem)", lineHeight: 0.94 }}>
                Launch, save, and review landing-page experiments from one console.
              </h1>
              <p className="muted" style={{ margin: 0, maxWidth: 520, fontSize: 16, lineHeight: 1.7 }}>
                Structured briefs go in. Server-side Codex generations, saved variants, and rerun history come back out in a durable review flow.
              </p>
            </div>
            <div
              className="panel"
              style={{
                padding: 18,
                background:
                  "linear-gradient(180deg, rgba(124, 140, 255, 0.14), transparent 80%), var(--bg-panel-strong)",
              }}
            >
              <div className="stack" style={{ gap: 10 }}>
                <div className="cluster" style={{ justifyContent: "space-between" }}>
                  <strong>Workflow proof points</strong>
                  <span className="shell-badge">MVP</span>
                </div>
                <p className="muted" style={{ margin: 0 }}>
                  Protected dashboard, structured generation, persisted history, and preview-first review surfaces.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Card
          style={{
            padding: 32,
            alignSelf: "center",
            background: "var(--bg-panel)",
          }}
        >
          <div className="stack" style={{ gap: 24 }}>
            <div className="stack" style={{ gap: 10 }}>
              <p className="eyebrow">Secure sign in</p>
              <h2 style={{ margin: 0, fontSize: "2rem", lineHeight: 1.05 }}>
                Sign in to launch and review experiment variants
              </h2>
              <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
                Access the authenticated workspace to create experiment briefs, generate landing-page variants, and review saved outputs.
              </p>
            </div>
            <LoginForm />
          </div>
        </Card>
      </div>
    </main>
  );
}
