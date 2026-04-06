import { expect, test, type Page } from "@playwright/test";

const demoEmail = process.env.AUTH_DEMO_EMAIL ?? "demo@example.com";
const demoPassword = process.env.AUTH_DEMO_PASSWORD ?? "password123";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email *").fill(demoEmail);
  await page.getByLabel("Password *").fill(demoPassword);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/experiments\/(new|[^/]+)$/);
}

test("login route renders scaffold", async ({ page }) => {
  await page.goto("/login");

  await expect(
    page.getByRole("heading", {
      name: "Sign in to the experiment console.",
    }),
  ).toBeVisible();

  await page.screenshot({
    path: "test-results/login-page.png",
    fullPage: true,
  });
});

test("seeded login can create an experiment and review the saved output", async ({
  page,
}) => {
  const experimentName = `Playwright demo ${Date.now()}`;

  await login(page);
  await page.goto("/experiments/new");

  await expect(page.getByRole("heading", { name: "Create experiment" })).toBeVisible();
  await page.getByLabel("Experiment name *").fill(experimentName);
  await page.getByLabel("Component type *").selectOption("Hero banner");
  await page
    .getByLabel("Target audience *")
    .fill("Returning shoppers looking for premium seasonal pieces");
  await page.getByLabel("Brand tone *").selectOption("Editorial");
  await page
    .getByLabel("Brand constraints *")
    .fill("Avoid discount framing and keep the copy product-led.");
  await page
    .getByLabel("Seed context *")
    .fill("Feature lightweight outerwear and transitional layering.");
  await page
    .getByLabel("Extra prompt *")
    .fill("Generate one premium, product-led headline direction with concise CTA copy.");

  await expect(page.getByText("Brief preview")).toHaveCount(0);
  await expect(page.getByText("Pipeline controls")).toHaveCount(0);
  await page.getByRole("button", { name: "Generate Output" }).click();

  await page.waitForURL((url) => {
    return /^\/experiments\/[^/]+$/.test(url.pathname) && url.pathname !== "/experiments/new";
  });
  await expect(page.getByRole("heading", { name: experimentName })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI suggestions" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Generate output" })).toBeVisible();
  await expect(page.getByTestId("saved-html-preview-frame")).toBeVisible();

  const previewMetrics = await page.getByTestId("saved-html-preview-frame").evaluate(
    (element) => {
      const container = element as HTMLElement;
      const inner = container.querySelector("[data-testid='saved-html-preview']") as HTMLElement | null;
      const rect = container.getBoundingClientRect();

      return {
        width: rect.width,
        height: rect.height,
        scrollWidth: container.scrollWidth,
        scrollHeight: container.scrollHeight,
        innerScrollWidth: inner?.scrollWidth ?? 0,
        innerScrollHeight: inner?.scrollHeight ?? 0,
        clientWidth: container.clientWidth,
        clientHeight: container.clientHeight,
      };
    },
  );

  expect(previewMetrics.width).toBeGreaterThan(0);
  expect(previewMetrics.height).toBeGreaterThan(0);
  expect(previewMetrics.scrollWidth).toBeLessThanOrEqual(previewMetrics.clientWidth);
  expect(previewMetrics.scrollHeight).toBeLessThanOrEqual(previewMetrics.clientHeight + 1);
  expect(previewMetrics.innerScrollWidth).toBeLessThanOrEqual(previewMetrics.clientWidth + 1);
  expect(previewMetrics.innerScrollHeight).toBeLessThanOrEqual(previewMetrics.clientHeight + 1);

  await page.screenshot({
    path: "test-results/experiment-happy-path.png",
    fullPage: true,
  });
});
