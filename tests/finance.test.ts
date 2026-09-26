import { describe, expect, it } from "vitest";
import { getPeriod, getPreviousPeriod } from "@/lib/date";
import { calculateSummary, netCash, operatingValues, partsControlSummary, storageSummary } from "@/lib/finance";
import { createMockDataset } from "@/lib/mock-data";
import { MockFinancialDataProvider } from "@/lib/provider";

describe("modelo financiero", () => {
  it("genera 18 meses determinísticos y órdenes coherentes", () => {
    const first = createMockDataset();
    const second = createMockDataset();
    expect(first.datasetStart).toBe("2025-04-01");
    expect(first.datasetEnd).toBe("2026-09-26");
    expect(first.repairOrders.length).toBeGreaterThan(600);
    expect(first.repairOrders).toEqual(second.repairOrders);
    expect(first.transactions).toEqual(second.transactions);
    expect(first.partsPurchases).toEqual(second.partsPurchases);
    expect(first.storageVehicles).toEqual(second.storageVehicles);
  });

  it("reconcilia cada compra de repuestos con su orden y vehículo", async () => {
    const provider = new MockFinancialDataProvider();
    const snapshot = await provider.getSnapshot(getPeriod("ytd"));
    const purchaseTotal = partsControlSummary(snapshot).total;
    const orderPartsTotal = snapshot.repairOrders.reduce((total, order) => total + order.partsCost, 0);
    expect(purchaseTotal).toBe(orderPartsTotal);
    expect(snapshot.partsPurchases.every((purchase) => snapshot.repairOrders.some((order) => order.id === purchase.repairOrderId && order.vehicle === purchase.vehicle))).toBe(true);
  });

  it("valúa los autos inmovilizados en el depósito", async () => {
    const provider = new MockFinancialDataProvider();
    const dataset = await provider.getDataset();
    const snapshot = await provider.getSnapshot(getPeriod("ytd"));
    const summary = storageSummary(snapshot);
    expect(summary.vehicles).toBe(snapshot.storageVehicles.length);
    expect(summary.amountDue).toBe(summary.repairAmount + summary.storageFees);
    expect(summary.criticalVehicles).toBeGreaterThan(0);
    expect(summary.estimatedSaleValue).toBeGreaterThan(0);
    expect(snapshot.storageVehicles.every((vehicle) => dataset.repairOrders.some((order) => order.id === vehicle.repairOrderId && order.status === "pending"))).toBe(true);
  });

  it("reconcilia resultado operativo", async () => {
    const provider = new MockFinancialDataProvider();
    const period = getPeriod("ytd");
    const snapshot = await provider.getSnapshot(period);
    const values = operatingValues(snapshot);
    expect(values.netProfit).toBe(values.revenue - values.directCosts - values.operatingExpenses);
    expect(values.operatingOutflow).toBe(values.directCosts + values.operatingExpenses);
  });

  it("reconcilia saldo de caja con todos los movimientos", () => {
    const dataset = createMockDataset();
    const expected = dataset.openingCash + dataset.transactions.reduce(
      (total, transaction) => total + (transaction.type === "income" ? transaction.amount : -transaction.amount),
      0,
    );
    expect(netCash(dataset)).toBe(expected);
  });

  it("compara contra un período anterior de igual duración", async () => {
    const provider = new MockFinancialDataProvider();
    const currentPeriod = getPeriod("quarter");
    const previousPeriod = getPreviousPeriod(currentPeriod);
    const [current, previous] = await Promise.all([
      provider.getSnapshot(currentPeriod),
      provider.getSnapshot(previousPeriod),
    ]);
    const summary = calculateSummary(current, previous);
    expect(summary.revenue).toBeGreaterThan(0);
    expect(summary.jobs).toBe(current.repairOrders.length);
    expect(Number.isFinite(summary.comparisons.revenue)).toBe(true);
  });

  it("separa cuentas por cobrar del efectivo", async () => {
    const provider = new MockFinancialDataProvider();
    const snapshot = await provider.getSnapshot(getPeriod("ytd"));
    const pendingRevenue = snapshot.repairOrders.filter((order) => order.status === "pending").reduce((total, order) => total + order.revenue, 0);
    const receivables = snapshot.receivables.reduce((total, item) => total + item.amount, 0);
    expect(receivables).toBeGreaterThanOrEqual(pendingRevenue);
    expect(snapshot.transactions.some((transaction) => transaction.type === "income" && snapshot.repairOrders.find((order) => order.id === transaction.relatedId)?.status === "pending")).toBe(false);
  });
});
