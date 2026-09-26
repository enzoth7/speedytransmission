import { expect, test } from "@playwright/test";

test("recorre las secciones principales y filtra el período", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "El negocio, en números" })).toBeVisible();
  await expect(page.getByText("Utilidad neta")).toBeVisible();

  if (isMobile) await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.getByRole("button", { name: "Ingresos" }).click();
  await expect(page.getByRole("heading", { name: "Qué está generando dinero" })).toBeVisible();

  await page.getByLabel("Período").selectOption("month");
  await expect(page.getByText("Ingresos del período")).toBeVisible();

  for (const [section, heading] of [
    ["Compras", "Control de compras y repuestos"],
    ["Autos en depósito", "Autos inmovilizados en el depósito"],
    ["Gastos", "Dónde se está yendo la plata"],
    ["Flujo de caja", "Caja real y próxima decisión"],
    ["Inversiones", "En qué se está reinvirtiendo"],
  ] as const) {
    if (isMobile) await page.getByRole("button", { name: "Abrir menú" }).click();
    await page.getByRole("button", { name: section }).click();
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }

  if (isMobile) await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.getByRole("button", { name: "Trabajos" }).click();
  await expect(page.getByRole("heading", { name: "Rentabilidad trabajo por trabajo" })).toBeVisible();
  await page.getByRole("button", { name: "Ver detalle" }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("Contribución del trabajo")).toBeVisible();
});

test("la navegación móvil no produce scroll horizontal", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Chequeo específico para viewport móvil");
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.getByRole("button", { name: "Flujo de caja" }).click();
  await expect(page.getByRole("heading", { name: "Caja real y próxima decisión" })).toBeVisible();
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
});
