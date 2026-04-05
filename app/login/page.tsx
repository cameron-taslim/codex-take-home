import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getServerSession } from "@/lib/auth/session";
import { getAuthenticatedHomePath } from "@/lib/navigation";
import { Card } from "@/components/ui/card";

export default async function LoginPage() {
  const session = await getServerSession();

  if (session?.user?.id) {
    redirect(await getAuthenticatedHomePath(session.user.id));
  }

  return (
    <main className="auth-frame">
      <div className="login-shell">
        <section className="login-intro">
          <div className="cluster" style={{ justifyContent: "space-between" }}>
            <p className="eyebrow">Experiment Lab</p>
            <Link href="/" className="landing-nav-link">
              Back to landing
            </Link>
          </div>
          <div className="stack" style={{ gap: 12 }}>
            <h1 className="login-title">Sign in to the experiment console.</h1>
            <p className="login-description">
              Access the authenticated workspace to build briefs, trigger Codex generation, and
              review saved landing-page output history.
            </p>
          </div>
          <div className="login-note">
            <span className="login-note-dot" aria-hidden="true" />
            <p>
              Demo auth stays unchanged. This refresh only tightens layout, hierarchy, and visual
              treatment.
            </p>
          </div>
        </section>

        <Card
          style={{
            padding: 32,
            alignSelf: "center",
            background: "linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 28%), var(--bg-panel)",
          }}
        >
          <div className="stack" style={{ gap: 24 }}>
            <div className="stack" style={{ gap: 10 }}>
              <p className="eyebrow">Secure sign in</p>
              <h2 style={{ margin: 0, fontSize: "1.9rem", lineHeight: 1.02 }}>
                Enter your credentials
              </h2>
              <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
                Invalid credentials stay inline, successful sign-in drops you straight into the
                experiment workspace.
              </p>
            </div>
            <LoginForm />
          </div>
        </Card>
      </div>
    </main>
  );
}
