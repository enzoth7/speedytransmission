export type PeriodPreset = "month" | "quarter" | "ytd" | "12m" | "custom";

export interface FinancialPeriod {
  start: string;
  end: string;
  label: string;
  preset: PeriodPreset;
}

export type TransactionType = "income" | "expense" | "investment";

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  paymentMethod?: string;
  relatedId?: string;
}

export type RepairOrderStatus = "paid" | "pending";

export interface RepairOrder {
  id: string;
  date: string;
  customer: string;
  customerType: "Particular" | "Flota";
  vehicle: string;
  service: string;
  revenue: number;
  partsCost: number;
  laborCost: number;
  status: RepairOrderStatus;
  paymentMethod: string;
}

export type PartsPurchaseStatus = "ordered" | "received" | "installed";

export interface PartsPurchase {
  id: string;
  date: string;
  vendor: string;
  partName: string;
  partNumber: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  repairOrderId: string;
  customer: string;
  vehicle: string;
  status: PartsPurchaseStatus;
}

export type StorageVehicleStatus = "awaiting_pickup" | "abandoned_risk" | "lien_review" | "recovery_review";

export interface StorageVehicle {
  id: string;
  repairOrderId: string;
  arrivedAt: string;
  customer: string;
  vehicle: string;
  vinLast6: string;
  repairAmount: number;
  storageFees: number;
  amountDue: number;
  estimatedSaleValue: number;
  lastContactAt: string;
  status: StorageVehicleStatus;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  vendor: string;
  description: string;
  amount: number;
  recurring: boolean;
}

export interface Investment {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  expectedReturnMonths: number;
  status: "active" | "completed";
}

export interface Receivable {
  id: string;
  repairOrderId: string;
  customer: string;
  dueDate: string;
  amount: number;
  status: "current" | "overdue";
}

export interface FinancialDataset {
  transactions: Transaction[];
  repairOrders: RepairOrder[];
  partsPurchases: PartsPurchase[];
  storageVehicles: StorageVehicle[];
  expenses: Expense[];
  investments: Investment[];
  receivables: Receivable[];
  openingCash: number;
  datasetStart: string;
  datasetEnd: string;
}

export interface FinancialSnapshot extends FinancialDataset {
  period: FinancialPeriod;
  openingCash: number;
}

export interface DashboardSummary {
  revenue: number;
  operatingOutflow: number;
  netProfit: number;
  margin: number;
  closingCash: number;
  receivables: number;
  investments: number;
  jobs: number;
  averageTicket: number;
  comparisons: {
    revenue: number;
    operatingOutflow: number;
    netProfit: number;
    closingCash: number;
  };
}

export interface FinancialDataProvider {
  getDataset(): Promise<FinancialDataset>;
  getSnapshot(period: FinancialPeriod): Promise<FinancialSnapshot>;
}

export interface MonthlyMetric {
  key: string;
  label: string;
  revenue: number;
  outflow: number;
  profit: number;
  cash: number;
}

export interface PartsControlSummary {
  total: number;
  purchases: number;
  suppliers: number;
  linkedPurchases: number;
  averagePerOrder: number;
}

export interface StorageSummary {
  vehicles: number;
  criticalVehicles: number;
  repairAmount: number;
  storageFees: number;
  amountDue: number;
  estimatedSaleValue: number;
  averageDays: number;
  capacity: number;
  occupancy: number;
}
