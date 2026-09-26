export const SERVICE_CATALOG = [
  { name: "Reconstrucción de transmisión", base: 5_900, partsRatio: 0.32, laborRatio: 0.21 },
  { name: "Reemplazo de transmisión", base: 6_800, partsRatio: 0.43, laborRatio: 0.15 },
  { name: "Reparación de transmisión", base: 3_850, partsRatio: 0.27, laborRatio: 0.23 },
  { name: "Servicio CVT", base: 4_900, partsRatio: 0.34, laborRatio: 0.2 },
  { name: "Transmisión diésel / flota", base: 8_200, partsRatio: 0.36, laborRatio: 0.19 },
  { name: "Diagnóstico y programación", base: 980, partsRatio: 0.08, laborRatio: 0.31 },
  { name: "Motor y tren motriz", base: 4_400, partsRatio: 0.3, laborRatio: 0.24 },
  { name: "Frenos y suspensión", base: 1_650, partsRatio: 0.29, laborRatio: 0.26 },
] as const;

export const EXPENSE_CATEGORIES = [
  "Alquiler",
  "Servicios públicos",
  "Seguros",
  "Marketing",
  "Software y administración",
  "Grúas y logística",
  "Insumos del taller",
  "Honorarios profesionales",
] as const;

export const PAYMENT_METHODS = [
  "Visa / Mastercard",
  "Financiación",
  "ACH / Zelle",
  "Efectivo",
  "Square",
  "Cheque",
] as const;

export const PARTS_VENDORS = [
  "Transtar Industries",
  "NAPA Auto Parts",
  "LKQ Heavy Truck",
  "Jasper Engines & Transmissions",
  "Sonnax",
] as const;

export const PARTS_BY_SERVICE: Record<string, readonly string[]> = {
  "Reconstrucción de transmisión": ["Kit de reconstrucción", "Filtro y junta", "Juego de solenoides"],
  "Reemplazo de transmisión": ["Transmisión remanufacturada", "Enfriador de transmisión", "Fluido ATF"],
  "Reparación de transmisión": ["Cuerpo de válvulas", "Kit de juntas", "Sensor de velocidad"],
  "Servicio CVT": ["Correa CVT", "Filtro CVT", "Fluido CVT"],
  "Transmisión diésel / flota": ["Convertidor de torque reforzado", "Kit de embragues", "Enfriador HD"],
  "Diagnóstico y programación": ["Módulo de control", "Arnés eléctrico", "Sensor de rango"],
  "Motor y tren motriz": ["Soporte de motor", "Semieje", "Junta homocinética"],
  "Frenos y suspensión": ["Kit de frenos", "Amortiguadores", "Bujes de suspensión"],
};

export const ACCOUNTING_MAP = {
  directCosts: ["Repuestos", "Mano de obra directa"],
  operatingExpenses: [...EXPENSE_CATEGORIES],
  capitalExpenditure: ["Equipamiento", "Tecnología", "Instalaciones", "Marketing estratégico"],
} as const;
