import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { getServerSession } from "@/lib/auth/session";
import { listExperimentsForUser } from "@/lib/repositories/experiment-repository";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

export async function AppShell({
  title,
  description,
  headerAction,
  activeExperimentId,
  activeSidebarItem = "detail",
  children,
}: {
  title: string;
  description: string;
  headerAction?: React.ReactNode;
  activeExperimentId?: string;
  activeSidebarItem?: "new" | "detail";
  children?: React.ReactNode;
}) {
  const session = await getServerSession();
  const experiments = session?.user?.id ? await listExperimentsForUser(session.user.id) : [];

  return (
    <main className="page-frame">
      <div className="shell-layout">
        <aside className="shell-sidebar">
          <div className="stack shell-sidebar-stack">
            <div className="shell-sidebar-header">
              <div className="stack" style={{ gap: 6 }}>
                <p className="shell-sidebar-label">Experiments</p>
                <p className="shell-sidebar-count">
                  {experiments.length} saved
                </p>
              </div>
              <Link
                href="/experiments/new"
                className="button-base button-primary"
                aria-current={activeSidebarItem === "new" ? "page" : undefined}
                style={{ minHeight: 36, paddingInline: 14 }}
              >
                New
              </Link>
            </div>

            <nav className="shell-experiment-nav" aria-label="Experiments">
              {experiments.length > 0 ? (
                experiments.map((experiment) => (
                  <Link
                    key={experiment.id}
                    href={`/experiments/${experiment.id}`}
                    className="shell-experiment-link"
                    data-active={activeSidebarItem === "detail" && experiment.id === activeExperimentId}
                  >
                    <span className="shell-experiment-name">{experiment.name}</span>
                    <StatusBadge status={experiment.status} />
                  </Link>
                ))
              ) : (
                <p className="shell-empty-copy">
                  No experiments yet. Create one to start the workspace.
                </p>
              )}
            </nav>
          </div>
        </aside>

        <section className="shell-main">
          <div className="cluster shell-topbar" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <span className="shell-user-email">{session?.user?.email}</span>
            <LogoutButton />
          </div>

          <PageHeader title={title} description={description} action={headerAction} />

          {children}
        </section>
      </div>
    </main>
  );
}
