import { expect, test, type Page } from "@playwright/test";

const demoEmail = process.env.AUTH_DEMO_EMAIL ?? "demo@example.com";
const demoPassword = process.env.AUTH_DEMO_PASSWORD ?? "password123";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email *").fill(demoEmail);
  await page.getByLabel("Password *").fill(demoPassword);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/(experiments\/new|experiments\/[^/]+)$/);
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
  await expect(page.getByRole("link", { name: "New" })).toBeVisible();
  await page.getByRole("link", { name: "New" }).click();

  await expect(page.getByRole("heading", { name: "Create experiment" })).toBeVisible();
  await page.getByLabel("Experiment name *").fill(experimentName);
  await page.getByLabel("Primary goal *").selectOption("Increase clickthrough rate");
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
    .getByLabel("What to test *")
    .fill("Generate one premium, product-led headline direction with concise CTA copy.");

  await expect(page.getByText("Brief preview")).toHaveCount(0);
  await expect(page.getByText("Pipeline controls")).toHaveCount(0);
  await page.getByRole("button", { name: "Generate Output" }).click();

  await page.waitForURL(/\/experiments\/[^/]+$/);
  await expect(page.getByRole("heading", { name: experimentName })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Wear what lasts" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI suggestions" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Generate output" })).toBeVisible();

  await page.screenshot({
    path: "test-results/experiment-happy-path.png",
    fullPage: true,
  });
});
