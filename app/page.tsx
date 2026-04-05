import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getAuthenticatedHomePath } from "@/lib/navigation";

export default async function HomePage() {
  const session = await getServerSession();

  if (session?.user?.id) {
    redirect(await getAuthenticatedHomePath(session.user.id));
  }

  const primaryHref = "/login";
  const primaryLabel = "Start your first experiment";

  const metrics = [
    { value: "2-3", label: "Structured variants per run" },
    { value: "<2 min", label: "From brief to saved output" },
    { value: "100%", label: "Server-side Codex orchestration" },
  ];

  const workflow = [
    {
      title: "Shape the brief",
      description:
        "Capture goal, page type, audience, tone, and brand constraints in one operator-grade form.",
    },
    {
      title: "Generate on the server",
      description:
        "Codex turns the saved brief into structured landing-page variants without exposing providers in the client.",
    },
    {
      title: "Review saved variants",
      description:
        "Compare headline, body copy, CTA, and layout notes in a durable preview workflow with rerun history.",
    },
  ];

  const surfaces = [
    "Dashboard scanability with visible status signals",
    "Preview-first variant cards for headline and CTA comparison",
    "Append-only generation history for reruns and failures",
  ];

  const navLabel = "Sign in";

  return (
    <main className="landing-page">
      <div className="landing-shell">
        <header className="landing-nav">
          <Link href="/" className="landing-brand">
            <span className="landing-brand-mark" aria-hidden="true" />
            <span>Experiment Lab</span>
          </Link>
          <nav className="landing-nav-links" aria-label="Landing">
            <a href="#workflow">Workflow</a>
            <a href="#preview">Product</a>
            <a href="#cta">Launch</a>
          </nav>
          <div className="landing-nav-actions">
            <Link href={primaryHref} className="landing-nav-link">
              {navLabel}
            </Link>
            <Link href={primaryHref} className="button-base button-primary landing-cta-button">
              {primaryLabel}
            </Link>
          </div>
        </header>

        <section className="landing-hero">
          <div className="landing-hero-copy">
            <p className="landing-badge">AI-powered storefront testing</p>
            <h1 className="landing-title">
              Ship <span>winning</span> hero banners, faster.
            </h1>
            <p className="landing-description">
              Generate eCommerce landing-page variants from a structured brief, persist every run,
              and review the saved output in one focused experiment console.
            </p>
            <div className="landing-actions">
              <Link href={primaryHref} className="button-base button-primary landing-hero-button">
                {primaryLabel}
              </Link>
              <Link href="/login" className="button-base button-secondary landing-hero-button">
                Watch the login flow
              </Link>
            </div>
          </div>

          <div className="landing-metrics" aria-label="Product highlights">
            {metrics.map((metric) => (
              <article key={metric.label} className="landing-metric-card">
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="landing-section">
          <div className="landing-section-heading">
            <p className="eyebrow">Workflow</p>
            <h2>Structured generation for merchandisers and growth teams.</h2>
            <p className="muted">
              The product stays narrow: brief in, Codex generation on the server, saved variants
              out.
            </p>
          </div>
          <div className="landing-workflow-grid">
            {workflow.map((item, index) => (
              <article key={item.title} className="landing-workflow-card">
                <span className="landing-step-index">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="preview" className="landing-preview">
          <div className="landing-preview-copy">
            <p className="eyebrow">Product preview</p>
            <h2>Preview-first surfaces built for experiment review.</h2>
            <p className="muted">
              The UI favors dense panels, crisp status treatment, and saved generation history
              instead of arbitrary page rendering.
            </p>
            <div className="landing-surface-list">
              {surfaces.map((surface) => (
                <div key={surface} className="landing-surface-item">
                  <span className="landing-surface-dot" aria-hidden="true" />
                  <span>{surface}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="landing-preview-frame" aria-hidden="true">
            <div className="landing-preview-sidebar">
              <p>Experiments</p>
              <div className="landing-preview-nav-item is-active">Hero banner, spring capsule</div>
              <div className="landing-preview-nav-item">PDP buy box copy</div>
              <div className="landing-preview-nav-item">Homepage headline</div>
            </div>
            <div className="landing-preview-main">
              <div className="landing-preview-toolbar">
                <h3>Variant review console</h3>
                <span className="status-badge status-generated">
                  <span className="status-dot" />
                  Generated
                </span>
              </div>
              <div className="landing-preview-cards">
                <article className="landing-variant-card">
                  <p className="landing-variant-label">Variant A</p>
                  <div className="landing-variant-surface">
                    <h4>New arrivals are here</h4>
                    <p>Refresh your wardrobe with premium layers and faster decision-ready copy.</p>
                    <span>Shop now</span>
                  </div>
                </article>
                <article className="landing-variant-card">
                  <p className="landing-variant-label">Variant B</p>
                  <div className="landing-variant-surface is-secondary">
                    <h4>Your spring wardrobe is waiting</h4>
                    <p>Lean into benefit-led positioning with a more editorial hero treatment.</p>
                    <span>Explore the edit</span>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section id="cta" className="landing-final-cta">
          <div>
            <p className="eyebrow">Ready to test</p>
            <h2>Move from brief to saved experiment output without leaving the app.</h2>
          </div>
          <div className="landing-actions">
            <Link href={primaryHref} className="button-base button-primary landing-hero-button">
              {primaryLabel}
            </Link>
            <Link href="/login" className="button-base button-secondary landing-hero-button">
              Sign in to Experiment Lab
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
