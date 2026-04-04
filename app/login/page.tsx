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
    <main className="page-frame">
      <Card
        style={{
          maxWidth: 460,
          margin: "8vh auto 0",
          padding: 32,
        }}
      >
        <div className="stack" style={{ gap: 24 }}>
          <div className="stack" style={{ gap: 8 }}>
            <p
              style={{
                margin: 0,
                color: "var(--accent-strong)",
                fontSize: 13,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Experiment Lab
            </p>
            <h1 style={{ margin: 0, fontSize: "2rem", lineHeight: 1.1 }}>
              Sign in to the shared workspace scaffold
            </h1>
            <p className="muted" style={{ margin: 0 }}>
              This foundation ships the auth contract and route protections so page
              work can layer on top without changing the session model.
            </p>
          </div>
          <LoginForm />
        </div>
      </Card>
    </main>
  );
}
