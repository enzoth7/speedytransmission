"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  BarChart3,
  BriefcaseBusiness,
  CarFront,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  DollarSign,
  Gauge,
  Menu,
  PackageOpen,
  PackageSearch,
  PiggyBank,
  ReceiptText,
  Search,
  ShoppingCart,
  TrendingUp,
  Warehouse,
  WalletCards,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CashAreaChart, HorizontalAmountChart, ProfitChart, RevenueOutflowChart, WaterfallChart } from "@/components/dashboard/charts";
import { BentoSurface, CompactInsight, MetricCard as KpiCard } from "@/components/dashboard/finance-ui";
import { getPeriod, getPreviousPeriod, TODAY } from "@/lib/date";
import {
  calculateSummary,
  cashSeries,
  groupByAmount,
  monthlyMetrics,
  operatingValues,
  orderMargin,
  partsControlSummary,
  storageSummary,
  waterfallData,
} from "@/lib/finance";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { financialDataProvider } from "@/lib/provider";
import type { DashboardSummary, FinancialPeriod, FinancialSnapshot, PartsPurchaseStatus, PeriodPreset, RepairOrder, StorageVehicleStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type Section = "resumen" | "compras" | "deposito" | "ingresos" | "gastos" | "flujo" | "inversiones" | "trabajos";

const navigation: { id: Section; label: string; icon: LucideIcon }[] = [
  { id: "resumen", label: "Resumen", icon: Gauge },
  { id: "compras", label: "Compras", icon: ShoppingCart },
  { id: "deposito", label: "Autos en depósito", icon: Warehouse },
  { id: "ingresos", label: "Ingresos", icon: TrendingUp },
  { id: "gastos", label: "Gastos", icon: ReceiptText },
  { id: "flujo", label: "Flujo de caja", icon: Banknote },
  { id: "inversiones", label: "Inversiones", icon: BriefcaseBusiness },
  { id: "trabajos", label: "Trabajos", icon: Wrench },
];

const periodOptions: { id: PeriodPreset; label: string }[] = [
  { id: "month", label: "Este mes" },
  { id: "quarter", label: "Trimestre" },
  { id: "ytd", label: "Año a la fecha" },
  { id: "12m", label: "Últimos 12 meses" },
  { id: "custom", label: "Personalizado" },
];

function Sidebar({ section, onNavigate, mobileOpen, onClose }: { section: Section; onNavigate: (section: Section) => void; mobileOpen: boolean; onClose: () => void }) {
  const content = (
    <>
      <div className="flex min-h-[92px] items-center justify-between border-b border-white/10 px-4">
        <button className="cursor-pointer overflow-hidden rounded-lg bg-[#151519] p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC834]" onClick={() => onNavigate("resumen")} aria-label="Ir al resumen">
          <Image src="/speedys-logo.png" alt="Speedy's Transmission & Towing" width={500} height={107} priority className="h-auto w-[196px]" />
        </button>
        <Button className="lg:hidden" size="icon" variant="ghost" onClick={onClose} aria-label="Cerrar menú">
          <X className="size-5 text-white" />
        </Button>
      </div>

      <div className="px-3 py-4">
        <nav className="space-y-1.5" aria-label="Navegación principal">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-[14px] px-3 text-left text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC834]",
                  active ? "bg-white text-[#00307B] shadow-[0_8px_22px_rgba(0,0,0,0.16)]" : "text-[#DCE7F4] hover:translate-x-0.5 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <b className="font-semibold">{item.label}</b>
                {active && <ChevronRight className="ml-auto size-4 text-[#C90301]" aria-hidden="true" />}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4">
          <div className="rounded-[18px] border border-white/10 bg-white/[0.065] p-4 text-white">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B9C8D9]">
            <i aria-hidden="true" className="size-2 rounded-full bg-[#44C776] shadow-[0_0_0_4px_rgba(68,199,118,0.12)]" /> Operación activa
            </div>
          <div className="mt-3 text-sm font-semibold">Richmond, Virginia</div>
          <div className="mt-1 text-xs leading-5 text-[#B9C8D9]">5300 Midlothian Tpke<br />Actualizado al 26 sep 2026</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[244px] flex-col bg-[#081A31] lg:flex">{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 cursor-pointer bg-[#07111F]/60 backdrop-blur-sm" onClick={onClose} aria-label="Cerrar menú" />
          <aside className="relative flex h-full w-[min(86vw,304px)] flex-col bg-[#081A31] shadow-2xl">{content}</aside>
        </div>
      )}
    </>
  );
}

function Header({ section, period, onPeriodChange, customStart, customEnd, onCustomStart, onCustomEnd, onMenu }: {
  section: Section;
  period: PeriodPreset;
  onPeriodChange: (value: PeriodPreset) => void;
  customStart: string;
  customEnd: string;
  onCustomStart: (value: string) => void;
  onCustomEnd: (value: string) => void;
  onMenu: () => void;
}) {
  const current = navigation.find((item) => item.id === section)?.label ?? "Resumen";
  return (
    <header className="sticky top-0 z-30 border-b border-[#DCE4EE] bg-white/95 px-4 py-3 backdrop-blur-xl md:px-6 xl:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3">
        <Button variant="secondary" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Abrir menú">
          <Menu className="size-5" />
        </Button>
        <div className="mr-auto min-w-0">
          <h1 className="truncate font-heading text-2xl font-bold tracking-[-0.02em] text-[#10213A] md:text-[1.75rem]">{current}</h1>
        </div>

        <div className="flex min-h-11 items-center gap-2 rounded-full border border-[#DCE4EE] bg-[#F7F9FC] px-4 text-sm text-[#526176]">
          <CalendarDays className="size-4 text-[#00307B]" aria-hidden="true" />
          <label htmlFor="period" className="sr-only">Período</label>
          <select
            id="period"
            value={period}
            onChange={(event) => onPeriodChange(event.target.value as PeriodPreset)}
            className="min-h-10 cursor-pointer bg-transparent pr-2 font-semibold text-[#203149] outline-none"
          >
            {periodOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </div>

        {period === "custom" && (
          <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
            <label className="sr-only" htmlFor="custom-start">Fecha inicial</label>
            <input id="custom-start" type="date" min="2025-04-01" max={customEnd} value={customStart} onChange={(event) => onCustomStart(event.target.value)} className="min-h-11 rounded-xl border border-[#DCE4EE] bg-white px-3 text-sm font-semibold text-[#203149] outline-none focus:ring-2 focus:ring-[#00307B]" />
            <b aria-hidden="true" className="text-sm font-normal text-[#738096]">a</b>
            <label className="sr-only" htmlFor="custom-end">Fecha final</label>
            <input id="custom-end" type="date" min={customStart} max={TODAY} value={customEnd} onChange={(event) => onCustomEnd(event.target.value)} className="min-h-11 rounded-xl border border-[#DCE4EE] bg-white px-3 text-sm font-semibold text-[#203149] outline-none focus:ring-2 focus:ring-[#00307B]" />
          </div>
        )}
      </div>
    </header>
  );
}

function EmptyState() {
  return (
    <Card className="p-10 text-center">
      <PackageOpen className="mx-auto size-10 text-[#8290A4]" />
      <h2 className="mt-4 font-heading text-2xl font-bold uppercase text-[#10213A]">Sin movimientos</h2>
      <div className="mt-2 text-sm text-[#66748A]">No hay registros para el período elegido. Probá ampliando el rango de fechas.</div>
    </Card>
  );
}

function SectionHeading({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-heading text-3xl font-bold tracking-[-0.025em] text-[#10213A] md:text-[2.15rem]">{title}</h2>
        <div className="mt-1.5 max-w-3xl text-sm leading-6 text-[#66748A]">{description}</div>
      </div>
      {action}
    </div>
  );
}

function SummaryPage({ snapshot, summary, onNavigate }: { snapshot: FinancialSnapshot; summary: DashboardSummary; onNavigate: (section: Section) => void }) {
  const monthly = monthlyMetrics(snapshot);
  const waterfall = waterfallData(snapshot);
  const parts = partsControlSummary(snapshot);
  const yard = storageSummary(snapshot);
  const expenses = groupByAmount(snapshot.expenses, (item) => item.category, (item) => item.amount);
  const purchaseVendors = groupByAmount(snapshot.partsPurchases, (item) => item.vendor, (item) => item.totalCost);
  const overdue = snapshot.receivables.filter((item) => item.status === "overdue");
  const largestExpense = expenses[0];
  const oldestVehicle = [...snapshot.storageVehicles].sort((a, b) => a.arrivedAt.localeCompare(b.arrivedAt))[0];
  return (
    <>
      <SectionHeading
        title="El negocio, en números"
        description={`Resultado consolidado del ${formatDate(snapshot.period.start)} al ${formatDate(snapshot.period.end)}. Lo importante primero: rentabilidad, caja y cobros pendientes.`}
        action={<Button variant="secondary" size="sm" onClick={() => onNavigate("trabajos")}>{summary.jobs} trabajos finalizados<ChevronRight className="size-3.5" aria-hidden="true" /></Button>}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-12">
        <KpiCard className="xl:col-span-3" label="Compras de repuestos" value={formatCurrency(parts.total)} icon={ShoppingCart} detail={`${parts.purchases} líneas vinculadas a órdenes`} accent="red" onClick={() => onNavigate("compras")} actionLabel="Abrir detalle de compras" />
        <KpiCard className="xl:col-span-3" label="Plata inmovilizada en depósito" value={formatCurrency(yard.amountDue)} icon={Warehouse} detail={`${yard.vehicles} autos · ${yard.criticalVehicles} requieren acción`} accent="yellow" onClick={() => onNavigate("deposito")} actionLabel="Abrir autos en depósito" />
        <KpiCard className="xl:col-span-3" label="Ingresos" value={formatCurrency(summary.revenue)} icon={DollarSign} trend={summary.comparisons.revenue} onClick={() => onNavigate("ingresos")} actionLabel="Abrir detalle de ingresos" />
        <KpiCard className="xl:col-span-3" label="Utilidad neta" value={formatCurrency(summary.netProfit)} icon={TrendingUp} trend={summary.comparisons.netProfit} accent="green" onClick={() => onNavigate("ingresos")} actionLabel="Abrir análisis de utilidad" />

        <BentoSurface className="min-w-0 sm:col-span-2 xl:col-span-8">
          <CardHeader>
            <div><CardTitle>Ingresos vs. egresos</CardTitle><CardDescription>Evolución mensual del negocio antes de inversiones.</CardDescription></div>
            <Badge tone={summary.margin >= 15 ? "positive" : "warning"}>{formatPercent(summary.margin)} de margen</Badge>
          </CardHeader>
          <CardContent className="pt-3">
            <RevenueOutflowChart data={monthly} />
            <div className="mt-2 text-xs text-[#66748A]">En el período, cada dólar facturado dejó {formatCurrency(summary.revenue ? summary.netProfit / summary.revenue : 0, false, 2)} de utilidad operativa.</div>
          </CardContent>
        </BentoSurface>

        <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2 xl:col-span-4 xl:grid-cols-2">
          <KpiCard className="sm:col-span-2" label="Caja disponible" value={formatCurrency(summary.closingCash)} icon={PiggyBank} trend={summary.comparisons.closingCash} accent="dark" onClick={() => onNavigate("flujo")} actionLabel="Abrir flujo de caja" />
          <CompactInsight label="Por cobrar" value={formatCurrency(summary.receivables)} detail={`${overdue.length} facturas vencidas requieren seguimiento`} icon={CircleDollarSign} tone="yellow" onClick={() => onNavigate("ingresos")} actionLabel="Abrir cuentas por cobrar" />
          <CompactInsight label="Ticket promedio" value={formatCurrency(summary.averageTicket)} detail={`${summary.jobs} órdenes completadas`} icon={ClipboardList} tone="blue" onClick={() => onNavigate("trabajos")} actionLabel="Abrir trabajos del período" />
        </div>

        <BentoSurface className="min-w-0 sm:col-span-2 xl:col-span-7">
          <CardHeader><div><CardTitle>Ingresos, costos y utilidad</CardTitle><CardDescription>Comparación directa: todas las columnas parten desde cero.</CardDescription></div></CardHeader>
          <CardContent className="pt-3"><WaterfallChart data={waterfall} /></CardContent>
        </BentoSurface>

        <BentoSurface className="overflow-hidden sm:col-span-2 xl:col-span-5">
          <div className="border-b border-[#E4EAF1] px-5 py-5">
            <CardTitle>Atención ejecutiva</CardTitle>
            <CardDescription>Los puntos que conviene revisar primero.</CardDescription>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-1">
            <CompactInsight label="Proveedor con más compras" value={purchaseVendors[0]?.name ?? "Sin datos"} detail={purchaseVendors[0] ? `${formatCurrency(purchaseVendors[0].amount)} en repuestos` : "No hay compras registradas"} icon={PackageSearch} tone="red" onClick={() => onNavigate("compras")} actionLabel="Abrir compras por proveedor" />
            <CompactInsight label="Auto más antiguo en depósito" value={oldestVehicle?.vehicle ?? "Sin autos"} detail={oldestVehicle ? `Desde ${formatDate(oldestVehicle.arrivedAt)} · ${formatCurrency(oldestVehicle.amountDue)} por recuperar` : "No hay unidades inmovilizadas"} icon={CarFront} tone="yellow" onClick={() => onNavigate("deposito")} actionLabel="Abrir auto más antiguo en depósito" />
            <CompactInsight label="Mayor gasto fijo" value={largestExpense?.name ?? "Sin datos"} detail={largestExpense ? `${formatCurrency(largestExpense.amount)} en el período` : "No hay gastos registrados"} icon={AlertTriangle} tone="red" className="sm:col-span-2 xl:col-span-1" onClick={() => onNavigate("gastos")} actionLabel="Abrir detalle de gastos" />
          </div>
        </BentoSurface>
      </div>
    </>
  );
}

const purchaseStatusLabels: Record<PartsPurchaseStatus, string> = {
  ordered: "Pedido",
  received: "Recibido",
  installed: "Instalado",
};

const purchaseStatusTones: Record<PartsPurchaseStatus, "warning" | "brand" | "positive"> = {
  ordered: "warning",
  received: "brand",
  installed: "positive",
};

function PurchasesPage({ snapshot }: { snapshot: FinancialSnapshot }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | PartsPurchaseStatus>("all");
  const control = partsControlSummary(snapshot);
  const byVendor = groupByAmount(snapshot.partsPurchases, (item) => item.vendor, (item) => item.totalCost);
  const byVehicle = groupByAmount(snapshot.partsPurchases, (item) => `${item.vehicle} · ${item.repairOrderId}`, (item) => item.totalCost);
  const filtered = snapshot.partsPurchases
    .filter((item) => status === "all" || item.status === status)
    .filter((item) => `${item.id} ${item.vendor} ${item.partName} ${item.partNumber} ${item.repairOrderId} ${item.customer} ${item.vehicle}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <SectionHeading
        title="Control de compras y repuestos"
        description="Cada compra queda atada a una pieza, un proveedor, una orden y el auto donde se utilizó. Esta es la trazabilidad principal del taller."
        action={<Badge tone="brand">{control.linkedPurchases} compras vinculadas</Badge>}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Compras del período" value={formatCurrency(control.total)} icon={ShoppingCart} detail={`${control.purchases} líneas de compra`} accent="red" />
        <KpiCard label="Costo medio por auto" value={formatCurrency(control.averagePerOrder)} icon={CarFront} detail="Repuestos por orden vinculada" accent="yellow" />
        <KpiCard label="Proveedores utilizados" value={String(control.suppliers)} icon={Warehouse} detail="Concentración visible debajo" />
        <KpiCard label="Trazabilidad" value={control.purchases ? formatPercent(control.linkedPurchases / control.purchases * 100) : "—"} icon={PackageSearch} detail="Compra → orden → vehículo" accent="green" />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Card><CardHeader><div><CardTitle>Compras por proveedor</CardTitle><CardDescription>Quién está recibiendo la mayor parte del gasto en repuestos.</CardDescription></div></CardHeader><CardContent className="pt-3"><HorizontalAmountChart data={byVendor} ariaLabel="Compras de repuestos agrupadas por proveedor" color="#C90301" /></CardContent></Card>
        <Card><CardHeader><div><CardTitle>Autos con más repuestos</CardTitle><CardDescription>Órdenes donde quedó concentrada la mayor inversión en piezas.</CardDescription></div></CardHeader><CardContent className="pt-3"><HorizontalAmountChart data={byVehicle} ariaLabel="Costo de repuestos agrupado por vehículo y orden" color="#00307B" /></CardContent></Card>
      </div>

      <Card className="mt-3 overflow-hidden">
        <CardHeader><div><CardTitle>Detalle de cada compra</CardTitle><CardDescription>Buscá por repuesto, proveedor, orden, cliente o vehículo. Se muestran primero las compras más recientes.</CardDescription></div><Badge tone="neutral">{Math.min(25, filtered.length)} de {filtered.length}</Badge></CardHeader>
        <CardContent className="border-b border-[#E1E8F0] pb-4 pt-4">
          <div className="flex flex-wrap gap-3">
            <label className="relative min-w-[240px] flex-1"><b className="sr-only">Buscar compras</b><Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-[#738096]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar repuesto, proveedor, orden o auto" className="min-h-11 w-full rounded-xl border border-[#DCE4EE] bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#00307B]" /></label>
            <label><b className="sr-only">Filtrar compras por estado</b><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="min-h-11 cursor-pointer rounded-xl border border-[#DCE4EE] bg-white px-3 text-sm font-semibold text-[#203149] outline-none focus:ring-2 focus:ring-[#00307B]"><option value="all">Todos los estados</option><option value="ordered">Pedidos</option><option value="received">Recibidos</option><option value="installed">Instalados</option></select></label>
          </div>
        </CardContent>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="bg-[#F4F7FA] text-xs uppercase tracking-[0.08em] text-[#66748A]"><tr><th className="px-5 py-3">Compra / fecha</th><th className="px-4 py-3">Repuesto</th><th className="px-4 py-3">Proveedor</th><th className="px-4 py-3">Auto / cliente</th><th className="px-4 py-3">Orden</th><th className="px-4 py-3 text-right">Cantidad</th><th className="px-4 py-3 text-right">Unitario</th><th className="px-4 py-3 text-right">Total</th><th className="px-5 py-3">Estado</th></tr></thead>
            <tbody className="divide-y divide-[#E4EAF1]">
              {filtered.slice(0, 25).map((purchase) => <tr key={purchase.id} className="hover:bg-[#F8FAFC]"><td className="px-5 py-3"><strong className="font-semibold text-[#00307B]">{purchase.id}</strong><div className="mt-1 text-xs text-[#738096]">{formatDate(purchase.date)}</div></td><td className="px-4 py-3"><strong className="font-medium text-[#203149]">{purchase.partName}</strong><div className="mt-1 text-xs text-[#738096]">{purchase.partNumber}</div></td><td className="px-4 py-3 text-[#40516A]">{purchase.vendor}</td><td className="px-4 py-3"><strong className="font-medium text-[#203149]">{purchase.vehicle}</strong><div className="mt-1 text-xs text-[#738096]">{purchase.customer}</div></td><td className="px-4 py-3 font-semibold text-[#00307B]">{purchase.repairOrderId}</td><td className="px-4 py-3 text-right">{purchase.quantity}</td><td className="px-4 py-3 text-right text-[#66748A]">{formatCurrency(purchase.unitCost, false, 2)}</td><td className="px-4 py-3 text-right font-bold text-[#10213A]">{formatCurrency(purchase.totalCost)}</td><td className="px-5 py-3"><Badge tone={purchaseStatusTones[purchase.status]}>{purchaseStatusLabels[purchase.status]}</Badge></td></tr>)}
            </tbody>
          </table>
          {!filtered.length && <div className="p-8 text-center text-sm text-[#66748A]">No hay compras que coincidan con los filtros.</div>}
        </div>
      </Card>
    </>
  );
}

const storageStatusLabels: Record<StorageVehicleStatus, string> = {
  awaiting_pickup: "Esperando retiro",
  abandoned_risk: "Riesgo de abandono",
  lien_review: "Revisión de gravamen",
  recovery_review: "Revisión para recuperar",
};

const storageStatusTones: Record<StorageVehicleStatus, "neutral" | "warning" | "negative" | "brand"> = {
  awaiting_pickup: "neutral",
  abandoned_risk: "warning",
  lien_review: "negative",
  recovery_review: "brand",
};

function StoragePage({ snapshot }: { snapshot: FinancialSnapshot }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | StorageVehicleStatus>("all");
  const control = storageSummary(snapshot);
  const daysStored = (date: string) => Math.max(0, Math.floor((Date.parse(`${snapshot.period.end}T12:00:00Z`) - Date.parse(`${date}T12:00:00Z`)) / 86_400_000));
  const filtered = snapshot.storageVehicles
    .filter((item) => status === "all" || item.status === status)
    .filter((item) => `${item.id} ${item.repairOrderId} ${item.customer} ${item.vehicle} ${item.vinLast6}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => daysStored(b.arrivedAt) - daysStored(a.arrivedAt));
  const byStatus = groupByAmount(snapshot.storageVehicles, (item) => storageStatusLabels[item.status], () => 1);

  return (
    <>
      <SectionHeading
        title="Autos inmovilizados en el depósito"
        description={`Inventario físico al ${formatDate(snapshot.period.end)}: cuánto espacio ocupa, qué importe está pendiente y cuánto podría recuperarse. La disposición de cada vehículo requiere validación legal y documental.`}
        action={<Badge tone={control.criticalVehicles ? "negative" : "positive"}>{control.criticalVehicles} unidades requieren acción</Badge>}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Autos en depósito" value={String(control.vehicles)} icon={Warehouse} detail={`${formatPercent(control.occupancy)} de 48 lugares`} />
        <KpiCard label="Plata inmovilizada" value={formatCurrency(control.amountDue)} icon={CircleDollarSign} detail="Arreglos + cargos de almacenamiento" accent="red" />
        <KpiCard label="Valor potencial de venta" value={formatCurrency(control.estimatedSaleValue)} icon={DollarSign} detail="Estimación operativa, no tasación final" accent="green" />
        <KpiCard label="Antigüedad promedio" value={`${control.averageDays} días`} icon={CarFront} detail={`${control.criticalVehicles} autos superan la espera normal`} accent="yellow" />
      </div>

      <div className="mt-3 grid items-start gap-3 lg:grid-cols-[1.25fr_0.75fr]">
        <BentoSurface className="overflow-hidden bg-[#081A31] text-white">
          <div className="grid gap-5 p-6 sm:grid-cols-3">
            <div><div className="text-sm text-[#B9C8D9]">Arreglos pendientes</div><output className="mt-2 block text-3xl font-bold tracking-[-0.03em]">{formatCurrency(control.repairAmount)}</output></div>
            <div><div className="text-sm text-[#B9C8D9]">Cargos de depósito</div><output className="mt-2 block text-3xl font-bold tracking-[-0.03em]">{formatCurrency(control.storageFees)}</output></div>
            <div><div className="text-sm text-[#B9C8D9]">Exposición total</div><output className="mt-2 block text-3xl font-bold tracking-[-0.03em] text-[#FFC834]">{formatCurrency(control.amountDue)}</output></div>
          </div>
          <div className="border-t border-white/10 px-6 py-4 text-sm leading-6 text-[#B9C8D9]">La cifra representa dinero facturable o recuperable que hoy permanece asociado a unidades sin retirar.</div>
        </BentoSurface>
        <Card>
          <CardHeader><div><CardTitle>Estado del inventario</CardTitle><CardDescription>Unidades por etapa de seguimiento.</CardDescription></div></CardHeader>
          <CardContent className="space-y-3">
            {byStatus.map((item) => <div key={item.name} className="flex items-center justify-between gap-4 rounded-xl border border-[#E1E8F0] px-4 py-3"><strong className="text-sm font-semibold text-[#40516A]">{item.name}</strong><output className="text-lg font-bold text-[#10213A]">{item.amount}</output></div>)}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-3 overflow-hidden">
        <CardHeader><div><CardTitle>Inventario del depósito</CardTitle><CardDescription>Priorizado por tiempo inmovilizado, del más antiguo al más reciente.</CardDescription></div><Badge tone="neutral">{filtered.length} autos</Badge></CardHeader>
        <CardContent className="border-b border-[#E1E8F0] pb-4 pt-4">
          <div className="flex flex-wrap gap-3">
            <label className="relative min-w-[240px] flex-1"><b className="sr-only">Buscar autos en depósito</b><Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-[#738096]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar auto, cliente, VIN u orden" className="min-h-11 w-full rounded-xl border border-[#DCE4EE] bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#00307B]" /></label>
            <label><b className="sr-only">Filtrar autos por estado</b><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="min-h-11 cursor-pointer rounded-xl border border-[#DCE4EE] bg-white px-3 text-sm font-semibold text-[#203149] outline-none focus:ring-2 focus:ring-[#00307B]"><option value="all">Todos los estados</option><option value="awaiting_pickup">Esperando retiro</option><option value="abandoned_risk">Riesgo de abandono</option><option value="lien_review">Revisión de gravamen</option><option value="recovery_review">Revisión para recuperar</option></select></label>
          </div>
        </CardContent>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[1200px] text-left text-sm">
            <thead className="bg-[#F4F7FA] text-xs uppercase tracking-[0.08em] text-[#66748A]"><tr><th className="px-5 py-3">Unidad / antigüedad</th><th className="px-4 py-3">Auto / VIN</th><th className="px-4 py-3">Cliente / orden</th><th className="px-4 py-3 text-right">Arreglo</th><th className="px-4 py-3 text-right">Depósito</th><th className="px-4 py-3 text-right">Total pendiente</th><th className="px-4 py-3 text-right">Venta estimada</th><th className="w-[176px] px-5 py-3">Estado</th></tr></thead>
            <tbody className="divide-y divide-[#E4EAF1]">
              {filtered.map((vehicle) => <tr key={vehicle.id} className="hover:bg-[#F8FAFC]"><td className="px-5 py-3"><strong className="font-semibold text-[#00307B]">{vehicle.id}</strong><div className="mt-1 text-xs font-semibold text-[#C90301]">{daysStored(vehicle.arrivedAt)} días</div><div className="mt-1 text-xs text-[#738096]">Llegó {formatDate(vehicle.arrivedAt)}</div></td><td className="px-4 py-3"><strong className="font-medium text-[#203149]">{vehicle.vehicle}</strong><div className="mt-1 text-xs text-[#738096]">VIN · {vehicle.vinLast6}</div></td><td className="px-4 py-3"><strong className="font-medium text-[#203149]">{vehicle.customer}</strong><div className="mt-1 text-xs text-[#00307B]">{vehicle.repairOrderId}</div><div className="mt-1 text-xs text-[#738096]">Último contacto: {formatDate(vehicle.lastContactAt)}</div></td><td className="px-4 py-3 text-right font-semibold">{formatCurrency(vehicle.repairAmount)}</td><td className="px-4 py-3 text-right text-[#66748A]">{formatCurrency(vehicle.storageFees)}</td><td className="px-4 py-3 text-right font-bold text-[#C90301]">{formatCurrency(vehicle.amountDue)}</td><td className="px-4 py-3 text-right font-bold text-[#15803D]">{formatCurrency(vehicle.estimatedSaleValue)}</td><td className="px-5 py-3"><Badge tone={storageStatusTones[vehicle.status]}>{storageStatusLabels[vehicle.status]}</Badge></td></tr>)}
            </tbody>
          </table>
          {!filtered.length && <div className="p-8 text-center text-sm text-[#66748A]">No hay autos que coincidan con los filtros.</div>}
        </div>
      </Card>
    </>
  );
}

function IncomePage({ snapshot, summary }: { snapshot: FinancialSnapshot; summary: DashboardSummary }) {
  const byService = groupByAmount(snapshot.repairOrders, (item) => item.service, (item) => item.revenue);
  const byPayment = groupByAmount(snapshot.repairOrders.filter((item) => item.status === "paid"), (item) => item.paymentMethod, (item) => item.revenue);
  const topMargins = [...snapshot.repairOrders].sort((a, b) => orderMargin(b) - orderMargin(a)).slice(0, 6);
  return (
    <>
      <SectionHeading title="Qué está generando dinero" description="Ingresos devengados por servicio, canal de cobro y trabajos con mejor contribución." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Ingresos del período" value={formatCurrency(summary.revenue)} icon={DollarSign} trend={summary.comparisons.revenue} />
        <KpiCard label="Ticket promedio" value={formatCurrency(summary.averageTicket)} icon={ReceiptText} detail={`${summary.jobs} órdenes completadas`} accent="yellow" />
        <KpiCard label="Cuentas por cobrar" value={formatCurrency(summary.receivables)} icon={CircleDollarSign} detail={`${snapshot.receivables.length} facturas abiertas`} accent="red" />
        <KpiCard label="Margen operativo" value={formatPercent(summary.margin)} icon={BarChart3} detail="Después de costos y gastos" accent="green" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><div><CardTitle>Ingresos por servicio</CardTitle><CardDescription>Los servicios que más facturación aportaron.</CardDescription></div></CardHeader><CardContent className="pt-3"><HorizontalAmountChart data={byService} ariaLabel="Ingresos agrupados por tipo de servicio" /></CardContent></Card>
        <Card><CardHeader><div><CardTitle>Canales de cobro</CardTitle><CardDescription>Distribución de órdenes ya cobradas.</CardDescription></div></CardHeader><CardContent className="pt-3"><HorizontalAmountChart data={byPayment} ariaLabel="Ingresos cobrados por forma de pago" color="#15803D" /></CardContent></Card>
      </div>
      <Card className="mt-4 overflow-hidden">
        <CardHeader><div><CardTitle>Trabajos con mayor contribución</CardTitle><CardDescription>Margen bruto antes de gastos generales.</CardDescription></div></CardHeader>
        <div className="mt-3 overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#F4F7FA] text-xs uppercase tracking-[0.1em] text-[#66748A]"><tr><th className="px-5 py-3">Orden</th><th className="px-4 py-3">Servicio</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3 text-right">Ingreso</th><th className="px-5 py-3 text-right">Contribución</th></tr></thead>
            <tbody className="divide-y divide-[#E4EAF1]">{topMargins.map((order) => <tr key={order.id} className="hover:bg-[#F8FAFC]"><td className="px-5 py-3 font-semibold text-[#00307B]">{order.id}</td><td className="px-4 py-3 font-medium text-[#203149]">{order.service}</td><td className="px-4 py-3 text-[#66748A]">{order.customer}</td><td className="px-4 py-3 text-right font-semibold">{formatCurrency(order.revenue)}</td><td className="px-5 py-3 text-right font-bold text-[#15803D]">{formatCurrency(orderMargin(order))}</td></tr>)}</tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function ExpensesPage({ snapshot }: { snapshot: FinancialSnapshot }) {
  const operations = operatingValues(snapshot);
  const byCategory = groupByAmount(snapshot.expenses, (item) => item.category, (item) => item.amount);
  const byVendor = groupByAmount(snapshot.expenses, (item) => item.vendor, (item) => item.amount);
  const parts = snapshot.repairOrders.reduce((total, item) => total + item.partsCost, 0);
  const labor = snapshot.repairOrders.reduce((total, item) => total + item.laborCost, 0);
  return (
    <>
      <SectionHeading title="Dónde se está yendo la plata" description="Costos directos de cada reparación y gastos necesarios para mantener el taller operando." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Egresos operativos" value={formatCurrency(operations.operatingOutflow)} icon={WalletCards} detail="Costos directos + operación" accent="red" />
        <KpiCard label="Repuestos" value={formatCurrency(parts)} icon={Wrench} detail={formatPercent(operations.revenue ? parts / operations.revenue * 100 : 0) + " de ingresos"} />
        <KpiCard label="Mano de obra directa" value={formatCurrency(labor)} icon={ClipboardList} detail={formatPercent(operations.revenue ? labor / operations.revenue * 100 : 0) + " de ingresos"} accent="yellow" />
        <KpiCard label="Gastos generales" value={formatCurrency(operations.operatingExpenses)} icon={ReceiptText} detail={`${snapshot.expenses.length} movimientos`} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><div><CardTitle>Gastos por categoría</CardTitle><CardDescription>La estructura mensual fuera de cada reparación.</CardDescription></div></CardHeader><CardContent className="pt-3"><HorizontalAmountChart data={byCategory} ariaLabel="Gastos operativos agrupados por categoría" color="#C90301" /></CardContent></Card>
        <Card><CardHeader><div><CardTitle>Principales proveedores</CardTitle><CardDescription>Concentración del gasto y exposición operativa.</CardDescription></div></CardHeader><CardContent className="pt-3"><HorizontalAmountChart data={byVendor} ariaLabel="Gastos agrupados por proveedor" color="#00307B" /></CardContent></Card>
      </div>
      <Card className="mt-4">
        <CardHeader><div><CardTitle>Gastos recurrentes</CardTitle><CardDescription>Compromisos que se repiten y conviene revisar periódicamente.</CardDescription></div></CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {byCategory.slice(0, 4).map((item) => <div key={item.name} className="rounded-xl border border-[#E1E8F0] bg-[#F8FAFC] p-4"><div className="text-xs font-bold uppercase tracking-[0.1em] text-[#66748A]">{item.name}</div><output className="mt-2 block text-xl font-bold text-[#10213A]">{formatCurrency(item.amount)}</output></div>)}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function CashFlowPage({ snapshot, summary }: { snapshot: FinancialSnapshot; summary: DashboardSummary }) {
  const series = cashSeries(snapshot);
  const income = snapshot.transactions.filter((item) => item.type === "income").reduce((total, item) => total + item.amount, 0);
  const out = snapshot.transactions.filter((item) => item.type !== "income").reduce((total, item) => total + item.amount, 0);
  const movement = income - out;
  const monthly = monthlyMetrics(snapshot);
  const projection = monthly.length ? monthly.slice(-3).reduce((total, item) => total + item.profit, 0) / Math.min(3, monthly.length) : 0;
  return (
    <>
      <SectionHeading title="Caja real y próxima decisión" description="Solo movimientos efectivamente cobrados o pagados; las cuentas por cobrar se mantienen separadas." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Saldo inicial" value={formatCurrency(snapshot.openingCash)} icon={PiggyBank} detail={formatDate(snapshot.period.start)} />
        <KpiCard label="Cobros" value={formatCurrency(income)} icon={ArrowUpRight} detail="Entradas efectivas" accent="green" />
        <KpiCard label="Pagos" value={formatCurrency(out)} icon={ArrowDownRight} detail="Operación + inversiones" accent="red" />
        <KpiCard label="Saldo final" value={formatCurrency(summary.closingCash)} icon={Banknote} detail={`${movement >= 0 ? "+" : ""}${formatCurrency(movement)} neto`} accent="yellow" />
      </div>
      <Card className="mt-4">
        <CardHeader><div><CardTitle>Evolución del efectivo</CardTitle><CardDescription>Saldo acumulado movimiento por movimiento dentro del período.</CardDescription></div><Badge tone={movement >= 0 ? "positive" : "negative"}>{movement >= 0 ? "Caja creciendo" : "Caja en descenso"}</Badge></CardHeader>
        <CardContent className="pt-3"><CashAreaChart data={series} /><div className="mt-2 text-xs text-[#66748A]">Saldo mínimo del período: {formatCurrency(Math.min(snapshot.openingCash, ...series.map((item) => item.balance)))}.</div></CardContent>
      </Card>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><div><CardTitle>Utilidad por mes</CardTitle><CardDescription>Señal de capacidad futura para generar caja.</CardDescription></div></CardHeader><CardContent className="pt-3"><ProfitChart data={monthly} /></CardContent></Card>
        <Card>
          <CardHeader><div><CardTitle>Lectura de corto plazo</CardTitle><CardDescription>Proyección simple basada en los últimos tres meses visibles.</CardDescription></div></CardHeader>
          <CardContent>
            <div className="rounded-2xl bg-[#071D3B] p-6 text-white"><div className="text-xs font-bold uppercase tracking-[0.14em] text-[#AFC0D4]">Caja estimada próximo mes</div><output className="mt-3 block text-4xl font-bold">{formatCurrency(summary.closingCash + projection)}</output><div className="mt-3 text-sm leading-6 text-[#C9D5E3]">Si se mantiene el resultado promedio reciente y no aparece una inversión extraordinaria.</div></div>
            <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl border p-4"><div className="text-xs text-[#66748A]">Cambio estimado</div><output className={cn("mt-1 block text-xl font-bold", projection >= 0 ? "text-[#15803D]" : "text-[#C90301]")}>{projection >= 0 ? "+" : ""}{formatCurrency(projection)}</output></div><div className="rounded-xl border p-4"><div className="text-xs text-[#66748A]">Por cobrar</div><output className="mt-1 block text-xl font-bold text-[#10213A]">{formatCurrency(summary.receivables)}</output></div></div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function InvestmentsPage({ snapshot, summary }: { snapshot: FinancialSnapshot; summary: DashboardSummary }) {
  const byCategory = groupByAmount(snapshot.investments, (item) => item.category, (item) => item.amount);
  return (
    <>
      <SectionHeading title="En qué se está reinvirtiendo" description="Compras extraordinarias separadas del gasto operativo para medir su impacto real sobre la caja." />
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Invertido en el período" value={formatCurrency(summary.investments)} icon={BriefcaseBusiness} detail={`${snapshot.investments.length} iniciativas`} />
        <KpiCard label="Categorías activas" value={String(byCategory.length)} icon={BarChart3} detail="Equipamiento, tecnología y crecimiento" accent="yellow" />
        <KpiCard label="Retorno medio esperado" value={snapshot.investments.length ? `${Math.round(snapshot.investments.reduce((total, item) => total + item.expectedReturnMonths, 0) / snapshot.investments.length)} meses` : "—"} icon={TrendingUp} detail="Estimación inicial" accent="green" />
      </div>
      {snapshot.investments.length ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.4fr]">
          <Card><CardHeader><div><CardTitle>Distribución</CardTitle><CardDescription>Capital asignado por tipo de iniciativa.</CardDescription></div></CardHeader><CardContent className="pt-3"><HorizontalAmountChart data={byCategory} ariaLabel="Inversiones por categoría" color="#00307B" /></CardContent></Card>
          <Card>
            <CardHeader><div><CardTitle>Iniciativas del período</CardTitle><CardDescription>Detalle e impacto esperado de cada inversión.</CardDescription></div></CardHeader>
            <CardContent className="space-y-3">
              {snapshot.investments.map((item) => <div key={item.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-[#E1E8F0] p-4"><div className="flex size-11 items-center justify-center rounded-xl bg-[#EAF1FB] text-[#00307B]"><BriefcaseBusiness className="size-5" /></div><div className="min-w-[220px] flex-1"><strong className="font-semibold text-[#10213A]">{item.description}</strong><div className="mt-1 text-xs text-[#66748A]">{formatDate(item.date)} · {item.category}</div></div><div className="text-right"><output className="block font-bold text-[#10213A]">{formatCurrency(item.amount)}</output><div className="mt-1 text-xs text-[#66748A]">Retorno: {item.expectedReturnMonths} meses</div></div><Badge tone={item.status === "active" ? "positive" : "neutral"}>{item.status === "active" ? "Activa" : "Completada"}</Badge></div>)}
            </CardContent>
          </Card>
        </div>
      ) : <div className="mt-4"><EmptyState /></div>}
    </>
  );
}

function OrderDetail({ order, onClose }: { order: RepairOrder; onClose: () => void }) {
  const margin = orderMargin(order);
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-end bg-[#07111F]/50 p-0 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true" aria-labelledby="order-detail-title">
      <button className="absolute inset-0 cursor-pointer" aria-label="Cerrar detalle" onClick={onClose} />
      <div className="relative h-auto max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-lg sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4"><h2 id="order-detail-title" className="font-heading text-3xl font-bold uppercase text-[#10213A]">{order.id}</h2><Button variant="secondary" size="icon" onClick={onClose} aria-label="Cerrar"><X className="size-5" /></Button></div>
        <div className="mt-6 rounded-2xl bg-[#071D3B] p-5 text-white"><div className="text-sm text-[#B9C8D9]">Contribución del trabajo</div><output className="mt-2 block text-4xl font-bold">{formatCurrency(margin)}</output><div className="mt-2 text-sm text-[#C9D5E3]">{formatPercent(order.revenue ? margin / order.revenue * 100 : 0)} del ingreso</div></div>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          {[['Cliente', order.customer], ['Vehículo', order.vehicle], ['Servicio', order.service], ['Fecha', formatDate(order.date)], ['Ingreso', formatCurrency(order.revenue)], ['Repuestos', formatCurrency(order.partsCost)], ['Mano de obra', formatCurrency(order.laborCost)], ['Forma de pago', order.paymentMethod]].map(([label, value]) => <div key={label} className="rounded-xl border border-[#E1E8F0] p-3"><dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[#66748A]">{label}</dt><dd className="mt-1 font-semibold text-[#10213A]">{value}</dd></div>)}
        </dl>
      </div>
    </div>
  );
}

function JobsPage({ snapshot }: { snapshot: FinancialSnapshot }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "paid" | "pending">("all");
  const [selected, setSelected] = useState<RepairOrder | null>(null);
  const filtered = snapshot.repairOrders
    .filter((item) => status === "all" || item.status === status)
    .filter((item) => `${item.id} ${item.customer} ${item.vehicle} ${item.service}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <SectionHeading title="Rentabilidad trabajo por trabajo" description="Cada orden muestra facturación, costos directos, margen y estado de cobro." action={<Badge tone="brand">{filtered.length} resultados</Badge>} />
      <Card className="overflow-hidden">
        <CardContent className="border-b border-[#E1E8F0] p-4">
          <div className="flex flex-wrap gap-3">
            <label className="relative min-w-[240px] flex-1"><b className="sr-only">Buscar trabajos</b><Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-[#738096]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar orden, cliente, vehículo o servicio" className="min-h-11 w-full rounded-xl border border-[#DCE4EE] bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#00307B]" /></label>
            <label><b className="sr-only">Filtrar por estado</b><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="min-h-11 cursor-pointer rounded-xl border border-[#DCE4EE] bg-white px-3 text-sm font-semibold text-[#203149] outline-none focus:ring-2 focus:ring-[#00307B]"><option value="all">Todos los estados</option><option value="paid">Cobrados</option><option value="pending">Pendientes</option></select></label>
          </div>
        </CardContent>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-[#F4F7FA] text-xs uppercase tracking-[0.09em] text-[#66748A]"><tr><th className="px-5 py-3">Orden / fecha</th><th className="px-4 py-3">Cliente / vehículo</th><th className="px-4 py-3">Servicio</th><th className="px-4 py-3 text-right">Ingreso</th><th className="px-4 py-3 text-right">Costos</th><th className="px-4 py-3 text-right">Margen</th><th className="px-4 py-3">Estado</th><th className="px-5 py-3"><b className="sr-only">Acciones</b></th></tr></thead>
            <tbody className="divide-y divide-[#E4EAF1]">
              {filtered.slice(0, 80).map((order) => {
                const margin = orderMargin(order);
                return <tr key={order.id} className="hover:bg-[#F8FAFC]"><td className="px-5 py-3"><strong className="font-semibold text-[#00307B]">{order.id}</strong><div className="mt-1 text-xs text-[#738096]">{formatDate(order.date)}</div></td><td className="px-4 py-3"><strong className="font-medium text-[#203149]">{order.customer}</strong><div className="mt-1 text-xs text-[#738096]">{order.vehicle}</div></td><td className="max-w-[220px] px-4 py-3 text-[#40516A]">{order.service}</td><td className="px-4 py-3 text-right font-semibold">{formatCurrency(order.revenue)}</td><td className="px-4 py-3 text-right text-[#66748A]">{formatCurrency(order.partsCost + order.laborCost)}</td><td className="px-4 py-3 text-right font-bold text-[#15803D]">{formatCurrency(margin)}</td><td className="px-4 py-3"><Badge tone={order.status === "paid" ? "positive" : "warning"}>{order.status === "paid" ? "Cobrado" : "Pendiente"}</Badge></td><td className="px-5 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => setSelected(order)}>Ver detalle</Button></td></tr>;
              })}
            </tbody>
          </table>
          {!filtered.length && <div className="p-8 text-center text-sm text-[#66748A]">No hay trabajos que coincidan con los filtros.</div>}
        </div>
      </Card>
      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function DashboardSkeleton() {
  return <div className="animate-pulse space-y-4" aria-label="Cargando información"><div className="h-24 rounded-2xl bg-[#E7EDF4]" /><div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div className="h-32 rounded-2xl bg-[#E7EDF4]" key={index} />)}</div><div className="h-[420px] rounded-2xl bg-[#E7EDF4]" /></div>;
}

export function DashboardApp() {
  const [section, setSection] = useState<Section>("resumen");
  const [preset, setPreset] = useState<PeriodPreset>("ytd");
  const [customStart, setCustomStart] = useState("2026-01-01");
  const [customEnd, setCustomEnd] = useState(TODAY);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<FinancialSnapshot | null>(null);
  const [previous, setPrevious] = useState<FinancialSnapshot | null>(null);

  const period: FinancialPeriod = useMemo(() => getPeriod(preset, customStart, customEnd), [preset, customStart, customEnd]);

  useEffect(() => {
    if (period.start > period.end) return;
    let active = true;
    Promise.all([
      financialDataProvider.getSnapshot(period),
      financialDataProvider.getSnapshot(getPreviousPeriod(period)),
    ]).then(([current, prior]) => {
      if (active) {
        setSnapshot(current);
        setPrevious(prior);
      }
    });
    return () => { active = false; };
  }, [period]);

  const navigate = (next: Section) => {
    setSection(next);
    setMobileOpen(false);
    window.history.replaceState(null, "", `#${next}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const summary = snapshot && previous ? calculateSummary(snapshot, previous) : null;

  return (
    <div className="min-h-screen bg-transparent">
      <a href="#main-content" className="fixed left-4 top-3 z-[80] -translate-y-20 rounded-lg bg-[#00307B] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#FFC834]">
        Saltar al contenido
      </a>
      <Sidebar section={section} onNavigate={navigate} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="min-w-0 lg:pl-[244px]">
        <Header section={section} period={preset} onPeriodChange={setPreset} customStart={customStart} customEnd={customEnd} onCustomStart={setCustomStart} onCustomEnd={setCustomEnd} onMenu={() => setMobileOpen(true)} />
        <main id="main-content" tabIndex={-1} className="dashboard-grid mx-auto max-w-[1700px] px-4 py-6 outline-none md:px-6 xl:px-8 xl:py-7">
          {!snapshot || !summary ? <DashboardSkeleton /> : snapshot.repairOrders.length === 0 && section !== "inversiones" && section !== "deposito" ? <EmptyState /> : (
            <>
              {section === "resumen" && <SummaryPage snapshot={snapshot} summary={summary} onNavigate={navigate} />}
              {section === "compras" && <PurchasesPage snapshot={snapshot} />}
              {section === "deposito" && <StoragePage snapshot={snapshot} />}
              {section === "ingresos" && <IncomePage snapshot={snapshot} summary={summary} />}
              {section === "gastos" && <ExpensesPage snapshot={snapshot} />}
              {section === "flujo" && <CashFlowPage snapshot={snapshot} summary={summary} />}
              {section === "inversiones" && <InvestmentsPage snapshot={snapshot} summary={summary} />}
              {section === "trabajos" && <JobsPage snapshot={snapshot} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
