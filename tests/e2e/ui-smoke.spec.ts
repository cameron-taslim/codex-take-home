import { expect, test } from "@playwright/test";

const demoEmail = process.env.AUTH_DEMO_EMAIL ?? "demo@example.com";
const demoPassword = process.env.AUTH_DEMO_PASSWORD ?? "password123";

test("login route renders scaffold", async ({ page }) => {
  await page.goto("/login");

  await expect(
    page.getByRole("heading", {
      name: "Sign in to the shared workspace scaffold",
    }),
  ).toBeVisible();

  await page.screenshot({
    path: "test-results/login-page.png",
    fullPage: true,
  });
});

test("authenticated scaffold routes render shared shell", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email *").fill(demoEmail);
  await page.getByLabel("Password *").fill(demoPassword);
  await page.getByRole("button", { name: "Sign In" }).click();

  await page.waitForURL("**/dashboard");
  await expect(
    page.getByRole("heading", { name: "Dashboard scaffold" }),
  ).toBeVisible();

  await page.screenshot({
    path: "test-results/dashboard-page.png",
    fullPage: true,
  });

  await page.goto("/experiments/new");
  await expect(
    page.getByRole("heading", { name: "Experiment builder scaffold" }),
  ).toBeVisible();

  await page.screenshot({
    path: "test-results/new-experiment-page.png",
    fullPage: true,
  });

  await page.goto("/experiments/example-id");
  await expect(
    page.getByRole("heading", { name: "Experiment detail scaffold" }),
  ).toBeVisible();

  await page.screenshot({
    path: "test-results/experiment-detail-page.png",
    fullPage: true,
  });
});
