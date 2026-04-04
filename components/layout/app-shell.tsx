import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { getServerSession } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export async function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <main className="page-frame">
      <div className="stack" style={{ gap: 20 }}>
        <Card style={{ padding: 20 }}>
          <div
            className="cluster"
            style={{ justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <div className="stack" style={{ gap: 6 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--accent-strong)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Experiment Lab
              </p>
              <div className="cluster">
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/experiments/new">New Experiment</Link>
              </div>
            </div>
            <div className="cluster" style={{ justifyContent: "flex-end" }}>
              <span className="muted">{session?.user?.email}</span>
              <LogoutButton />
            </div>
          </div>
        </Card>
        <PageHeader title={title} description={description} />
        {children ? (
          children
        ) : (
          <Card style={{ padding: 28 }}>
            <p className="muted" style={{ margin: 0 }}>
              Shared infrastructure is in place. Page-specific features will
              populate this route in later tasks.
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}
