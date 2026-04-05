import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { getServerSession } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export async function AppShell({
  title,
  description,
  headerAction,
  children,
}: {
  title: string;
  description: string;
  headerAction?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const session = await getServerSession();
  const activeSection =
    title === "Dashboard"
      ? "dashboard"
      : title === "Experiment Builder"
        ? "builder"
        : "experiments";

  return (
    <main className="page-frame">
      <div className="shell-layout">
        <aside className="shell-sidebar">
          <div className="stack" style={{ gap: 24 }}>
            <div className="shell-brand stack" style={{ gap: 10 }}>
              <p className="eyebrow">Experiment Lab</p>
              <div className="stack" style={{ gap: 6 }}>
                <h2 style={{ margin: 0, fontSize: "1.5rem", lineHeight: 1.02 }}>
                  Growth console
                </h2>
                <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
                  Structured experiment briefs, generation runs, and saved variant review in one workspace.
                </p>
              </div>
            </div>

            <nav className="shell-nav" aria-label="Primary">
              <Link
                href="/dashboard"
                className="shell-nav-link"
                data-active={activeSection === "dashboard"}
              >
                <span className="stack" style={{ gap: 2 }}>
                  <span className="shell-nav-label">Dashboard</span>
                  <span className="shell-nav-kicker">Recent experiments</span>
                </span>
                <span className="shell-badge">Hub</span>
              </Link>
              <Link
                href="/experiments/new"
                className="shell-nav-link"
                data-active={activeSection === "builder"}
              >
                <span className="stack" style={{ gap: 2 }}>
                  <span className="shell-nav-label">New Experiment</span>
                  <span className="shell-nav-kicker">Launch workflow</span>
                </span>
                <span className="shell-badge">New</span>
              </Link>
              <div className="shell-nav-link" data-active={activeSection === "experiments"}>
                <span className="stack" style={{ gap: 2 }}>
                  <span className="shell-nav-label">Experiment Detail</span>
                  <span className="shell-nav-kicker">Review output</span>
                </span>
                <span className="shell-badge">Run</span>
              </div>
            </nav>

            <Card style={{ padding: 16, background: "var(--bg-panel-strong)" }}>
              <div className="stack" style={{ gap: 10 }}>
                <p className="subtle" style={{ margin: 0, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Workspace mode
                </p>
                <p style={{ margin: 0, fontWeight: 600 }}>Dark-first redesign system</p>
                <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                  Shared tokens, shell structure, and dense UI primitives for the experiment workflow.
                </p>
              </div>
            </Card>
          </div>
        </aside>

        <section className="shell-main">
          <div
            className="cluster shell-topbar"
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <div className="cluster" style={{ gap: 10 }}>
              <span className="shell-badge">Authenticated</span>
              <span className="shell-user-email">{session?.user?.email}</span>
            </div>
            <LogoutButton />
          </div>

          <PageHeader title={title} description={description} action={headerAction} />

          {children ? (
            children
          ) : (
            <Card style={{ padding: 28 }}>
              <p className="muted" style={{ margin: 0 }}>
                Shared infrastructure is in place. Page-specific features will populate this route in later tasks.
              </p>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}
