import { expect, test } from "@playwright/test";

test("navigates the primary sections and filters the period", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Speedy's Finance" })).toBeVisible();
  await expect(page.getByText("Estimated profit")).toBeVisible();

  await page.getByRole("button", { name: "Open revenue details" }).click();
  await expect(page.getByRole("heading", { name: "What is generating revenue" })).toBeVisible();

  await page.getByLabel("Period").selectOption("month");
  await expect(page.getByText("Period revenue")).toBeVisible();

  for (const [section, heading] of [
    ["Parts Purchases", "Parts purchasing control"],
    ["Vehicle Storage", "Vehicles held in storage"],
    ["Expenses", "Where the money is going"],
    ["Cash Flow", "Cash position and next decision"],
    ["Investments", "Where the business is reinvesting"],
  ] as const) {
    if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("button", { name: section }).click();
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }

  if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("button", { name: "Jobs" }).click();
  await expect(page.getByRole("heading", { name: "Profitability by job" })).toBeVisible();
  await page.getByRole("button", { name: "View details" }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("Job contribution")).toBeVisible();
});

test("mobile navigation does not produce horizontal scrolling", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile viewport check");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("button", { name: "Cash Flow", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Cash position and next decision" })).toBeVisible();
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
});

test("KPIs support keyboard drill-down", async ({ page }) => {
  await page.goto("/");
  const purchasesKpi = page.getByRole("button", { name: "Open parts purchases" });
  await purchasesKpi.focus();
  await expect(purchasesKpi).toBeFocused();
  await purchasesKpi.press("Enter");
  await expect(page.getByRole("heading", { name: "Parts purchasing control" })).toBeVisible();
  await expect(page).toHaveURL(/#purchases$/);
});
