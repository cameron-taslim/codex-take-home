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

test("seeded login can create an experiment, generate variants, and review saved output", async ({
  page,
}) => {
  const experimentName = `Playwright demo ${Date.now()}`;

  await login(page);
  await expect(page.getByRole("link", { name: "New" })).toBeVisible();
  await page.getByRole("link", { name: "New" }).click();

  await expect(page.getByRole("heading", { name: "Create experiment" })).toBeVisible();
  await page.getByLabel("Name *").fill(experimentName);
  await page
    .getByLabel("Goal *")
    .fill("Increase clickthrough into the spring capsule collection.");
  await page.getByLabel("Target page type *").fill("Homepage hero");
  await page
    .getByLabel("Target audience *")
    .fill("Returning shoppers looking for premium seasonal pieces");
  await page.getByLabel("Tone *").fill("Confident and editorial");
  await page
    .getByLabel("Brand constraints")
    .fill("Avoid discount framing and keep the copy product-led.");
  await page
    .getByLabel("Seed context")
    .fill("Feature lightweight outerwear and transitional layering.");
  await page.getByRole("button", { name: "Generate Variants" }).click();

  await page.waitForURL(/\/experiments\/[^/]+$/);
  await expect(page.getByRole("heading", { name: experimentName })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Latest saved variants" })).toBeVisible();
  await expect(page.getByText(`${experimentName}: editorial hero`)).toBeVisible();
  await expect(page.getByText(`${experimentName}: conversion-led split`)).toBeVisible();
  await expect(page.getByText("Variant A")).toBeVisible();
  await expect(page.getByText("Variant B")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Generation history" })).toBeVisible();
  await expect(page.getByText("2 saved variants", { exact: true })).toBeVisible();

  await page.screenshot({
    path: "test-results/experiment-happy-path.png",
    fullPage: true,
  });
});
