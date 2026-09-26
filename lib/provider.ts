import { inPeriod } from "@/lib/date";
import { MOCK_DATASET } from "@/lib/mock-data";
import type { FinancialDataProvider, FinancialDataset, FinancialPeriod, FinancialSnapshot } from "@/lib/types";

function cashImpact(dataset: FinancialDataset, before: string) {
  return dataset.transactions
    .filter((transaction) => transaction.date < before)
    .reduce((total, transaction) => total + (transaction.type === "income" ? transaction.amount : -transaction.amount), 0);
}

export class MockFinancialDataProvider implements FinancialDataProvider {
  async getDataset() {
    return MOCK_DATASET;
  }

  async getSnapshot(period: FinancialPeriod): Promise<FinancialSnapshot> {
    const dataset = MOCK_DATASET;
    return {
      period,
      transactions: dataset.transactions.filter((item) => inPeriod(item.date, period)),
      repairOrders: dataset.repairOrders.filter((item) => inPeriod(item.date, period)),
      partsPurchases: dataset.partsPurchases.filter((item) => inPeriod(item.date, period)),
      storageVehicles: dataset.storageVehicles.filter((item) => item.arrivedAt <= period.end),
      expenses: dataset.expenses.filter((item) => inPeriod(item.date, period)),
      investments: dataset.investments.filter((item) => inPeriod(item.date, period)),
      receivables: dataset.receivables.filter((item) => {
        const order = dataset.repairOrders.find((orderItem) => orderItem.id === item.repairOrderId);
        return order ? order.date <= period.end : false;
      }),
      openingCash: dataset.openingCash + cashImpact(dataset, period.start),
      datasetStart: dataset.datasetStart,
      datasetEnd: dataset.datasetEnd,
    };
  }
}

export const financialDataProvider = new MockFinancialDataProvider();
