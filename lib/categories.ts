export const SERVICE_CATALOG = [
  { name: "Transmission rebuild", base: 5_900, partsRatio: 0.32, laborRatio: 0.21 },
  { name: "Transmission replacement", base: 6_800, partsRatio: 0.43, laborRatio: 0.15 },
  { name: "Transmission repair", base: 3_850, partsRatio: 0.27, laborRatio: 0.23 },
  { name: "CVT service", base: 4_900, partsRatio: 0.34, laborRatio: 0.2 },
  { name: "Diesel transmission / fleet", base: 8_200, partsRatio: 0.36, laborRatio: 0.19 },
  { name: "Diagnostics and programming", base: 980, partsRatio: 0.08, laborRatio: 0.31 },
  { name: "Engine and drivetrain", base: 4_400, partsRatio: 0.3, laborRatio: 0.24 },
  { name: "Brakes and suspension", base: 1_650, partsRatio: 0.29, laborRatio: 0.26 },
] as const;

export const EXPENSE_CATEGORIES = [
  "Rent",
  "Utilities",
  "Insurance",
  "Marketing",
  "Software and administration",
  "Towing and logistics",
  "Shop supplies",
  "Professional fees",
] as const;

export const PAYMENT_METHODS = [
  "Visa / Mastercard",
  "Financing",
  "ACH / Zelle",
  "Cash",
  "Square",
  "Check",
] as const;

export const PARTS_VENDORS = [
  "Transtar Industries",
  "NAPA Auto Parts",
  "LKQ Heavy Truck",
  "Jasper Engines & Transmissions",
  "Sonnax",
] as const;

export const PARTS_BY_SERVICE: Record<string, readonly string[]> = {
  "Transmission rebuild": ["Rebuild kit", "Filter and gasket", "Solenoid set"],
  "Transmission replacement": ["Remanufactured transmission", "Transmission cooler", "ATF fluid"],
  "Transmission repair": ["Valve body", "Gasket kit", "Speed sensor"],
  "CVT service": ["CVT belt", "CVT filter", "CVT fluid"],
  "Diesel transmission / fleet": ["Heavy-duty torque converter", "Clutch kit", "HD cooler"],
  "Diagnostics and programming": ["Control module", "Wiring harness", "Range sensor"],
  "Engine and drivetrain": ["Engine mount", "Axle shaft", "CV joint"],
  "Brakes and suspension": ["Brake kit", "Shock absorbers", "Suspension bushings"],
};

export const ACCOUNTING_MAP = {
  directCosts: ["Parts", "Direct labor"],
  operatingExpenses: [...EXPENSE_CATEGORIES],
  capitalExpenditure: ["Equipment", "Technology", "Facilities", "Strategic marketing"],
} as const;
