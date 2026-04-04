import { expect, test } from "@playwright/test";

const demoEmail = process.env.AUTH_DEMO_EMAIL ?? "demo@example.com";
const demoPassword = process.env.AUTH_DEMO_PASSWORD ?? "password123";

test("login route renders scaffold", async ({ page }) => {
  await page.goto("/login");

  await expect(
    page.getByRole("heading", {
      name: "Sign in to launch and review experiment variants",
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
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Create New Experiment" }).first(),
  ).toHaveAttribute("href", "/experiments/new");

  await page.screenshot({
    path: "test-results/dashboard-page.png",
    fullPage: true,
  });

  await page.goto("/experiments/new");
  await expect(page.getByRole("heading", { name: "Experiment Builder" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save Draft" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Generate Variants" }),
  ).toBeVisible();
  await expect(page.getByText("Generation guide")).toBeVisible();

  await page.screenshot({
    path: "test-results/new-experiment-page.png",
    fullPage: true,
  });

  await page.goto("/experiments/example-id");
  await expect(
    page.getByRole("heading", { name: "Experiment not found" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Choose another experiment" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Return to Dashboard" }),
  ).toHaveAttribute("href", "/dashboard");

  await page.screenshot({
    path: "test-results/experiment-detail-page.png",
    fullPage: true,
  });
});
