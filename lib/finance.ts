import { getPreviousPeriod, monthKey, monthLabel } from "@/lib/date";
import type { DashboardSummary, FinancialDataset, FinancialSnapshot, MonthlyMetric, PartsControlSummary, RepairOrder, StorageSummary } from "@/lib/types";

export const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export function pctChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function orderMargin(order: RepairOrder) {
  return order.revenue - order.partsCost - order.laborCost;
}

export function partsControlSummary(snapshot: FinancialSnapshot): PartsControlSummary {
  const total = sum(snapshot.partsPurchases.map((item) => item.totalCost));
  const linkedPurchases = snapshot.partsPurchases.filter((item) => item.repairOrderId).length;
  const linkedOrders = new Set(snapshot.partsPurchases.map((item) => item.repairOrderId));
  return {
    total,
    purchases: snapshot.partsPurchases.length,
    suppliers: new Set(snapshot.partsPurchases.map((item) => item.vendor)).size,
    linkedPurchases,
    averagePerOrder: linkedOrders.size ? total / linkedOrders.size : 0,
  };
}

export function storageSummary(snapshot: FinancialSnapshot): StorageSummary {
  const capacity = 48;
  const days = snapshot.storageVehicles.map((item) => Math.max(0, Math.floor((Date.parse(`${snapshot.period.end}T12:00:00Z`) - Date.parse(`${item.arrivedAt}T12:00:00Z`)) / 86_400_000)));
  return {
    vehicles: snapshot.storageVehicles.length,
    criticalVehicles: snapshot.storageVehicles.filter((item) => item.status !== "awaiting_pickup").length,
    repairAmount: sum(snapshot.storageVehicles.map((item) => item.repairAmount)),
    storageFees: sum(snapshot.storageVehicles.map((item) => item.storageFees)),
    amountDue: sum(snapshot.storageVehicles.map((item) => item.amountDue)),
    estimatedSaleValue: sum(snapshot.storageVehicles.map((item) => item.estimatedSaleValue)),
    averageDays: days.length ? Math.round(sum(days) / days.length) : 0,
    capacity,
    occupancy: capacity ? (snapshot.storageVehicles.length / capacity) * 100 : 0,
  };
}

export function operatingValues(snapshot: FinancialSnapshot) {
  const revenue = sum(snapshot.repairOrders.map((order) => order.revenue));
  const directCosts = sum(snapshot.repairOrders.map((order) => order.partsCost + order.laborCost));
  const operatingExpenses = sum(snapshot.expenses.map((expense) => expense.amount));
  const operatingOutflow = directCosts + operatingExpenses;
  const netProfit = revenue - operatingOutflow;
  const investments = sum(snapshot.investments.map((investment) => investment.amount));
  const cashMovement = snapshot.transactions.reduce(
    (total, transaction) => total + (transaction.type === "income" ? transaction.amount : -transaction.amount),
    0,
  );
  const closingCash = snapshot.openingCash + cashMovement;
  return { revenue, directCosts, operatingExpenses, operatingOutflow, netProfit, investments, closingCash };
}

export function calculateSummary(current: FinancialSnapshot, previous: FinancialSnapshot): DashboardSummary {
  const now = operatingValues(current);
  const before = operatingValues(previous);
  const receivables = sum(current.receivables.map((item) => item.amount));
  return {
    revenue: now.revenue,
    operatingOutflow: now.operatingOutflow,
    netProfit: now.netProfit,
    margin: now.revenue ? (now.netProfit / now.revenue) * 100 : 0,
    closingCash: now.closingCash,
    receivables,
    investments: now.investments,
    jobs: current.repairOrders.length,
    averageTicket: current.repairOrders.length ? now.revenue / current.repairOrders.length : 0,
    comparisons: {
      revenue: pctChange(now.revenue, before.revenue),
      operatingOutflow: pctChange(now.operatingOutflow, before.operatingOutflow),
      netProfit: pctChange(now.netProfit, before.netProfit),
      closingCash: pctChange(now.closingCash, before.closingCash),
    },
  };
}

export function monthlyMetrics(snapshot: FinancialSnapshot): MonthlyMetric[] {
  const keys = new Set<string>();
  snapshot.repairOrders.forEach((item) => keys.add(monthKey(item.date)));
  snapshot.expenses.forEach((item) => keys.add(monthKey(item.date)));

  let rollingCash = snapshot.openingCash;
  return [...keys].sort().map((key) => {
    const orders = snapshot.repairOrders.filter((item) => monthKey(item.date) === key);
    const expenses = snapshot.expenses.filter((item) => monthKey(item.date) === key);
    const revenue = sum(orders.map((item) => item.revenue));
    const directCosts = sum(orders.map((item) => item.partsCost + item.laborCost));
    const operating = sum(expenses.map((item) => item.amount));
    const monthTransactions = snapshot.transactions.filter((item) => monthKey(item.date) === key);
    rollingCash += monthTransactions.reduce(
      (total, transaction) => total + (transaction.type === "income" ? transaction.amount : -transaction.amount),
      0,
    );
    return {
      key,
      label: monthLabel(key),
      revenue,
      outflow: directCosts + operating,
      profit: revenue - directCosts - operating,
      cash: rollingCash,
    };
  });
}

export function groupByAmount<T>(items: T[], key: (item: T) => string, value: (item: T) => number) {
  const grouped = new Map<string, number>();
  items.forEach((item) => grouped.set(key(item), (grouped.get(key(item)) ?? 0) + value(item)));
  return [...grouped.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function cashSeries(snapshot: FinancialSnapshot) {
  let balance = snapshot.openingCash;
  const byDate = new Map<string, number>();
  snapshot.transactions.forEach((transaction) => {
    const impact = transaction.type === "income" ? transaction.amount : -transaction.amount;
    byDate.set(transaction.date, (byDate.get(transaction.date) ?? 0) + impact);
  });
  return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, movement]) => {
    balance += movement;
    return { date, movement, balance };
  });
}

export function waterfallData(snapshot: FinancialSnapshot) {
  const values = operatingValues(snapshot);
  const points = [
    { name: "Revenue", value: values.revenue, kind: "positive" },
    { name: "Parts and labor", value: -values.directCosts, kind: "negative" },
    { name: "Operating expenses", value: -values.operatingExpenses, kind: "negative" },
    { name: "Profit", value: values.netProfit, kind: "total" },
  ];
  let running = 0;
  return points.map((point, index) => {
    if (index === points.length - 1) return { ...point, start: 0, end: point.value, base: Math.min(0, point.value), display: Math.abs(point.value) };
    const start = running;
    running += point.value;
    return { ...point, start, end: running, base: Math.min(start, running), display: Math.abs(point.value) };
  });
}

export function netCash(dataset: FinancialDataset) {
  return dataset.openingCash + dataset.transactions.reduce(
    (total, transaction) => total + (transaction.type === "income" ? transaction.amount : -transaction.amount),
    0,
  );
}

export { getPreviousPeriod };
