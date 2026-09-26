import { EXPENSE_CATEGORIES, PARTS_BY_SERVICE, PARTS_VENDORS, PAYMENT_METHODS, SERVICE_CATALOG } from "@/lib/categories";
import { addDays } from "@/lib/date";
import type { Expense, FinancialDataset, Investment, PartsPurchase, Receivable, RepairOrder, StorageVehicle, Transaction } from "@/lib/types";

const customers = [
  "River City Plumbing",
  "Méndez Landscaping",
  "Virginia Courier Fleet",
  "James Walker",
  "Ashley Brooks",
  "Rafael Martínez",
  "Commonwealth HVAC",
  "David Carter",
  "Bon Air Delivery",
  "Patricia Evans",
  "Richmond Site Works",
  "Michael Johnson",
];

const vehicles = [
  "Ford F-150 2019",
  "Chevrolet Silverado 2020",
  "Nissan Altima 2018",
  "Honda CR-V 2021",
  "Ford Transit 2017",
  "RAM 2500 Diesel 2019",
  "Toyota Camry 2020",
  "GMC Sierra 2018",
  "Jeep Grand Cherokee 2017",
  "Chevrolet Express 2019",
];

const vendorByCategory: Record<string, string> = {
  Alquiler: "Midlothian Properties LLC",
  "Servicios públicos": "Dominion Energy & City Utilities",
  Seguros: "Virginia Auto Business Insurance",
  Marketing: "Richmond Growth Media",
  "Software y administración": "Shop Systems & Office",
  "Grúas y logística": "Central VA Towing Network",
  "Insumos del taller": "NAPA Auto Parts",
  "Honorarios profesionales": "Harrison Accounting Group",
};

const expenseBase: Record<string, number> = {
  Alquiler: 8_900,
  "Servicios públicos": 3_250,
  Seguros: 4_100,
  Marketing: 5_400,
  "Software y administración": 1_350,
  "Grúas y logística": 4_300,
  "Insumos del taller": 6_200,
  "Honorarios profesionales": 2_300,
};

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

const round = (value: number, unit = 10) => Math.round(value / unit) * unit;

function monthEntries() {
  const months: string[] = [];
  for (let index = 0; index < 18; index += 1) {
    const date = new Date(Date.UTC(2025, 3 + index, 1));
    months.push(date.toISOString().slice(0, 7));
  }
  return months;
}

export function createMockDataset(): FinancialDataset {
  const random = mulberry32(804_999_7595);
  const orders: RepairOrder[] = [];
  const partsPurchases: PartsPurchase[] = [];
  const expenses: Expense[] = [];
  const investments: Investment[] = [];
  const receivables: Receivable[] = [];
  const transactions: Transaction[] = [];

  monthEntries().forEach((month, monthIndex) => {
    const seasonal = [0.98, 1.03, 1.08, 1.12, 1.05, 0.96, 0.91, 0.94, 1.01, 1.07, 1.09, 1.02][monthIndex % 12];
    const growth = 1 + monthIndex * 0.012;
    const orderCount = Math.round((36 + random() * 10) * seasonal);
    const lastDay = month === "2026-09" ? 25 : 27;

    for (let orderIndex = 0; orderIndex < orderCount; orderIndex += 1) {
      const serviceIndex = Math.floor(random() * SERVICE_CATALOG.length);
      const service = SERVICE_CATALOG[serviceIndex];
      const isFleet = service.name.includes("flota") || random() < 0.2;
      const date = `${month}-${String(2 + Math.floor(random() * (lastDay - 1))).padStart(2, "0")}`;
      const revenue = round(service.base * (0.82 + random() * 0.42) * growth * (isFleet ? 1.12 : 1));
      const partsCost = round(revenue * service.partsRatio * (0.92 + random() * 0.16));
      const laborCost = round(revenue * service.laborRatio * (0.9 + random() * 0.18));
      const recent = date >= "2026-07-01";
      const pending = recent && random() < (isFleet ? 0.28 : 0.12);
      const customer = customers[(serviceIndex * 2 + orderIndex + monthIndex) % customers.length];
      const id = `ST-${month.replace("-", "")}-${String(orderIndex + 1).padStart(3, "0")}`;
      const paymentMethod = PAYMENT_METHODS[Math.floor(random() * PAYMENT_METHODS.length)];
      const order: RepairOrder = {
        id,
        date,
        customer,
        customerType: isFleet ? "Flota" : "Particular",
        vehicle: vehicles[(orderIndex + serviceIndex + monthIndex) % vehicles.length],
        service: service.name,
        revenue,
        partsCost,
        laborCost,
        status: pending ? "pending" : "paid",
        paymentMethod,
      };
      orders.push(order);

      const partNames = PARTS_BY_SERVICE[service.name];
      const purchaseWeights = [0.58, 0.27, 0.15];
      let allocatedParts = 0;
      partNames.forEach((partName, partIndex) => {
        const totalCost = partIndex === partNames.length - 1
          ? partsCost - allocatedParts
          : round(partsCost * purchaseWeights[partIndex]);
        allocatedParts += totalCost;
        const quantity = partName.includes("Fluido") ? 8 : 1;
        const purchaseStatus = pending && date >= "2026-09-15"
          ? (partIndex === 2 ? "ordered" : "received")
          : "installed";
        partsPurchases.push({
          id: `PO-${month.replace("-", "")}-${String(orderIndex + 1).padStart(3, "0")}-${partIndex + 1}`,
          date,
          vendor: PARTS_VENDORS[(serviceIndex + partIndex + monthIndex) % PARTS_VENDORS.length],
          partName,
          partNumber: `SPD-${serviceIndex + 1}${partIndex + 1}-${String(orderIndex + 1).padStart(3, "0")}`,
          quantity,
          unitCost: Number((totalCost / quantity).toFixed(2)),
          totalCost,
          repairOrderId: id,
          customer,
          vehicle: order.vehicle,
          status: purchaseStatus,
        });
      });

      transactions.push(
        {
          id: `TX-P-${id}`,
          date,
          type: "expense",
          amount: partsCost,
          category: "Repuestos",
          description: `Repuestos para ${id}`,
          relatedId: id,
        },
        {
          id: `TX-L-${id}`,
          date,
          type: "expense",
          amount: laborCost,
          category: "Mano de obra directa",
          description: `Mano de obra para ${id}`,
          relatedId: id,
        },
      );

      if (!pending) {
        transactions.push({
          id: `TX-I-${id}`,
          date: addDays(date, Math.floor(random() * 4)),
          type: "income",
          amount: revenue,
          category: service.name,
          description: `Cobro ${id}`,
          paymentMethod,
          relatedId: id,
        });
      } else {
        const dueDate = addDays(date, isFleet ? 30 : 10);
        receivables.push({
          id: `AR-${id}`,
          repairOrderId: id,
          customer,
          dueDate,
          amount: revenue,
          status: dueDate < "2026-09-26" ? "overdue" : "current",
        });
      }
    }

    EXPENSE_CATEGORIES.forEach((category, categoryIndex) => {
      const amount = round(expenseBase[category] * (0.94 + random() * 0.12) * (1 + monthIndex * 0.003));
      const date = `${month}-${String(3 + categoryIndex * 2).padStart(2, "0")}`;
      const id = `EX-${month.replace("-", "")}-${categoryIndex + 1}`;
      const expense: Expense = {
        id,
        date,
        category,
        vendor: vendorByCategory[category],
        description: category === "Insumos del taller" ? "Consumibles, fluidos y herramientas menores" : `Gasto mensual de ${category.toLowerCase()}`,
        amount,
        recurring: categoryIndex < 5,
      };
      expenses.push(expense);
      transactions.push({
        id: `TX-${id}`,
        date,
        type: "expense",
        amount,
        category,
        description: expense.description,
        relatedId: id,
      });
    });
  });

  const investmentSeed: Investment[] = [
    { id: "INV-001", date: "2025-05-14", category: "Equipamiento", description: "Elevador hidráulico de alta capacidad", amount: 24_800, expectedReturnMonths: 20, status: "active" },
    { id: "INV-002", date: "2025-08-09", category: "Tecnología", description: "Escáner y estación de diagnóstico", amount: 16_400, expectedReturnMonths: 14, status: "active" },
    { id: "INV-003", date: "2025-11-18", category: "Instalaciones", description: "Renovación del área de atención", amount: 11_900, expectedReturnMonths: 24, status: "completed" },
    { id: "INV-004", date: "2026-02-12", category: "Equipamiento", description: "Lavadora industrial de piezas", amount: 19_600, expectedReturnMonths: 18, status: "active" },
    { id: "INV-005", date: "2026-05-21", category: "Marketing estratégico", description: "Campaña regional para flotas comerciales", amount: 13_500, expectedReturnMonths: 8, status: "active" },
    { id: "INV-006", date: "2026-08-07", category: "Tecnología", description: "Terminales y red del taller", amount: 9_800, expectedReturnMonths: 16, status: "active" },
  ];

  investmentSeed.forEach((investment) => {
    investments.push(investment);
    transactions.push({
      id: `TX-${investment.id}`,
      date: investment.date,
      type: "investment",
      amount: investment.amount,
      category: investment.category,
      description: investment.description,
      relatedId: investment.id,
    });
  });

  const storageMonths = ["2025-05", "2025-07", "2025-10", "2026-01", "2026-03", "2026-05", "2026-07", "2026-08", "2026-09", "2026-09", "2026-09"];
  const storageVehicles: StorageVehicle[] = storageMonths.map((month, index) => {
    const monthlyOrders = orders.filter((order) => order.date.startsWith(month));
    const order = monthlyOrders[(index * 7 + 3) % monthlyOrders.length];
    if (order.status !== "pending") {
      order.status = "pending";
      const incomeIndex = transactions.findIndex((transaction) => transaction.id === `TX-I-${order.id}`);
      if (incomeIndex >= 0) transactions.splice(incomeIndex, 1);
      const dueDate = addDays(order.date, 10);
      receivables.push({
        id: `AR-${order.id}`,
        repairOrderId: order.id,
        customer: order.customer,
        dueDate,
        amount: order.revenue,
        status: dueDate < "2026-09-26" ? "overdue" : "current",
      });
    }
    const arrivedAt = order.date;
    const daysStored = Math.max(1, Math.floor((Date.parse("2026-09-26T12:00:00Z") - Date.parse(`${arrivedAt}T12:00:00Z`)) / 86_400_000));
    const storageFees = Math.min(4_800, round(Math.max(0, daysStored - 10) * 18));
    const amountDue = order.revenue + storageFees;
    const estimatedSaleValue = round(6_500 + (index % 5) * 2_100 + order.revenue * 0.45, 100);
    const status = daysStored > 180
      ? "recovery_review"
      : daysStored > 90
        ? "lien_review"
        : daysStored > 30
          ? "abandoned_risk"
          : "awaiting_pickup";
    return {
      id: `YARD-${String(index + 1).padStart(3, "0")}`,
      repairOrderId: order.id,
      arrivedAt,
      customer: order.customer,
      vehicle: order.vehicle,
      vinLast6: `${(482_731 + index * 7_913).toString().slice(-6)}`,
      repairAmount: order.revenue,
      storageFees,
      amountDue,
      estimatedSaleValue,
      lastContactAt: addDays(arrivedAt, Math.min(daysStored, 8 + index * 3)),
      status,
    } satisfies StorageVehicle;
  });

  const byDate = <T extends { date: string }>(a: T, b: T) => a.date.localeCompare(b.date);
  return {
    transactions: transactions.sort(byDate),
    repairOrders: orders.sort(byDate),
    partsPurchases: partsPurchases.sort(byDate),
    storageVehicles,
    expenses: expenses.sort(byDate),
    investments: investments.sort(byDate),
    receivables,
    openingCash: 118_500,
    datasetStart: "2025-04-01",
    datasetEnd: "2026-09-26",
  };
}

export const MOCK_DATASET = createMockDataset();
