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
  Download,
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
import { CashAreaChart, HorizontalAmountChart, ProfitChart, RevenueOutflowChart } from "@/components/dashboard/charts";
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
} from "@/lib/finance";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { financialDataProvider } from "@/lib/provider";
import type { DashboardSummary, FinancialPeriod, FinancialSnapshot, PartsPurchaseStatus, PeriodPreset, RepairOrder, StorageVehicleStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type Section = "dashboard" | "purchases" | "storage" | "revenue" | "expenses" | "cash" | "investments" | "jobs";

const navigation: { id: Section; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "purchases", label: "Parts Purchases", icon: ShoppingCart },
  { id: "storage", label: "Vehicle Storage", icon: Warehouse },
  { id: "revenue", label: "Revenue", icon: TrendingUp },
  { id: "expenses", label: "Expenses", icon: ReceiptText },
  { id: "cash", label: "Cash Flow", icon: Banknote },
  { id: "investments", label: "Investments", icon: BriefcaseBusiness },
  { id: "jobs", label: "Jobs", icon: Wrench },
];

const periodOptions: { id: PeriodPreset; label: string }[] = [
  { id: "month", label: "This month" },
  { id: "quarter", label: "This quarter" },
  { id: "ytd", label: "Year to date" },
  { id: "12m", label: "Last 12 months" },
  { id: "custom", label: "Custom range" },
];

function Sidebar({ section, onNavigate, mobileOpen, onClose }: { section: Section; onNavigate: (section: Section) => void; mobileOpen: boolean; onClose: () => void }) {
  const content = (
    <>
      <div className="flex min-h-[94px] items-center justify-between border-b border-white/10 px-4">
        <button className="cursor-pointer overflow-hidden rounded-md bg-[#17191E] p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC834]" onClick={() => onNavigate("dashboard")} aria-label="Go to dashboard">
          <Image src="/speedys-logo.png" alt="Speedy's Transmission and Towing" width={500} height={107} priority className="h-auto w-[184px]" />
        </button>
        <Button className="lg:hidden" size="icon" variant="ghost" onClick={onClose} aria-label="Close menu">
          <X className="size-5 text-white" />
        </Button>
      </div>

      <div className="px-3 py-4">
        <nav className="space-y-1" aria-label="Primary navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-lg border-l-[3px] px-3 text-left text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC834]",
                  active ? "border-l-[#17C6CF] bg-[#174A69] text-white" : "border-l-transparent text-[#DCE7F4] hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <b className="font-semibold">{item.label}</b>
                {active && <ChevronRight className="ml-auto size-4 text-[#54D6DC]" aria-hidden="true" />}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4">
          <div className="rounded-[18px] border border-white/10 bg-white/[0.065] p-4 text-white">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B9C8D9]">
            <i aria-hidden="true" className="size-2 rounded-full bg-[#44C776] shadow-[0_0_0_4px_rgba(68,199,118,0.12)]" /> Operations active
            </div>
          <div className="mt-3 text-sm font-semibold">Richmond, Virginia</div>
          <div className="mt-1 text-xs leading-5 text-[#B9C8D9]">5300 Midlothian Tpke<br />Updated Sep 26, 2026</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[224px] flex-col bg-[#102845] lg:flex">{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 cursor-pointer bg-[#07111F]/60 backdrop-blur-sm" onClick={onClose} aria-label="Close menu" />
          <aside className="relative flex h-full w-[min(86vw,304px)] flex-col bg-[#102845] shadow-2xl">{content}</aside>
        </div>
      )}
    </>
  );
}

function Header({ section, period, dateRange, onPeriodChange, customStart, customEnd, onCustomStart, onCustomEnd, onMenu, onExport, canExport }: {
  section: Section;
  period: PeriodPreset;
  dateRange: FinancialPeriod;
  onPeriodChange: (value: PeriodPreset) => void;
  customStart: string;
  customEnd: string;
  onCustomStart: (value: string) => void;
  onCustomEnd: (value: string) => void;
  onMenu: () => void;
  onExport: () => void;
  canExport: boolean;
}) {
  const current = navigation.find((item) => item.id === section)?.label ?? "Dashboard";
  const dashboard = section === "dashboard";
  return (
    <header className="sticky top-0 z-30 border-b border-[#D9E2EC] bg-white/95 px-4 py-3 backdrop-blur-xl md:px-6 xl:px-7">
      <div className="mx-auto flex max-w-[1660px] flex-wrap items-center gap-3">
        <Button variant="secondary" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
        <div className="mr-auto min-w-0">
          <h1 className="truncate font-heading text-2xl font-bold tracking-[-0.02em] text-[#10213A] md:text-[1.9rem]">{dashboard ? "Speedy's Finance" : current}</h1>
          <div className="text-xs font-medium text-[#66748A] md:text-sm">{dashboard ? "Business overview" : `${formatDate(dateRange.start)} – ${formatDate(dateRange.end)}`}</div>
        </div>

        <div className="flex min-h-11 items-center gap-2 rounded-lg border border-[#DCE4EE] bg-white px-3 text-sm text-[#526176] shadow-sm">
          <CalendarDays className="size-4 text-[#00307B]" aria-hidden="true" />
          <label htmlFor="period" className="sr-only">Period</label>
          <select
            id="period"
            value={period}
            onChange={(event) => onPeriodChange(event.target.value as PeriodPreset)}
            className="min-h-10 max-w-[154px] cursor-pointer bg-transparent pr-1 font-semibold text-[#203149] outline-none"
          >
            {periodOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </div>

        <Button onClick={onExport} disabled={!canExport} className="bg-[#0AA6B2] hover:bg-[#078D98]">
          <Download className="size-4" aria-hidden="true" /> Export report
        </Button>
        <Badge tone="neutral" className="min-h-11 px-3 uppercase tracking-[0.06em]">Demo data</Badge>

        {period === "custom" && (
          <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
            <label className="sr-only" htmlFor="custom-start">Start date</label>
            <input id="custom-start" type="date" min="2025-04-01" max={customEnd} value={customStart} onChange={(event) => onCustomStart(event.target.value)} className="min-h-11 rounded-xl border border-[#DCE4EE] bg-white px-3 text-sm font-semibold text-[#203149] outline-none focus:ring-2 focus:ring-[#00307B]" />
            <b aria-hidden="true" className="text-sm font-normal text-[#738096]">to</b>
            <label className="sr-only" htmlFor="custom-end">End date</label>
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
      <h2 className="mt-4 font-heading text-2xl font-bold uppercase text-[#10213A]">No activity</h2>
      <div className="mt-2 text-sm text-[#66748A]">There are no records for the selected period. Try expanding the date range.</div>
    </Card>
  );
}

function SectionHeading({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-[-0.025em] text-[#10213A] md:text-[1.8rem]">{title}</h2>
        <div className="mt-1.5 max-w-3xl text-sm leading-6 text-[#66748A]">{description}</div>
      </div>
      {action}
    </div>
  );
}

function SummaryPage({ snapshot, summary, onNavigate }: { snapshot: FinancialSnapshot; summary: DashboardSummary; onNavigate: (section: Section) => void }) {
  const monthly = monthlyMetrics(snapshot);
  const parts = partsControlSummary(snapshot);
  const yard = storageSummary(snapshot);
  const expenses = groupByAmount(snapshot.expenses, (item) => item.category, (item) => item.amount);
  const purchaseVendors = groupByAmount(snapshot.partsPurchases, (item) => item.vendor, (item) => item.totalCost);
  const overdue = snapshot.receivables.filter((item) => item.status === "overdue");
  const largestExpense = expenses[0];
  const oldestVehicle = [...snapshot.storageVehicles].sort((a, b) => a.arrivedAt.localeCompare(b.arrivedAt))[0];
  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-medium text-[#66748A]">Performance from {formatDate(snapshot.period.start)} to {formatDate(snapshot.period.end)}</div>
        <Button variant="secondary" size="sm" onClick={() => onNavigate("jobs")}>{summary.jobs} completed jobs<ChevronRight className="size-3.5" aria-hidden="true" /></Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Sales" value={formatCurrency(summary.revenue)} icon={BarChart3} trend={summary.comparisons.revenue} onClick={() => onNavigate("revenue")} actionLabel="Open revenue details" />
        <KpiCard label="Operating expenses" value={formatCurrency(summary.operatingOutflow)} icon={ReceiptText} trend={summary.comparisons.operatingOutflow} inverse accent="red" onClick={() => onNavigate("expenses")} actionLabel="Open expense details" />
        <KpiCard label="Completed jobs" value={String(summary.jobs)} icon={Wrench} detail={`${formatCurrency(summary.averageTicket)} average ticket`} onClick={() => onNavigate("jobs")} actionLabel="Open completed jobs" />
        <KpiCard label="Open receivables" value={String(snapshot.receivables.length)} icon={ClipboardList} detail={`${overdue.length} overdue accounts`} accent="yellow" onClick={() => onNavigate("revenue")} actionLabel="Open receivables" />
        <KpiCard label="Bank balance" value={formatCurrency(summary.closingCash)} icon={PiggyBank} trend={summary.comparisons.closingCash} onClick={() => onNavigate("cash")} actionLabel="Open cash flow" />
        <KpiCard label="Parts purchases" value={formatCurrency(parts.total)} icon={ShoppingCart} detail={`${parts.purchases} linked purchase lines`} accent="red" onClick={() => onNavigate("purchases")} actionLabel="Open parts purchases" />
        <KpiCard label="Awaiting payment" value={formatCurrency(summary.receivables)} icon={CircleDollarSign} detail={`${snapshot.receivables.length} open invoices`} accent="yellow" onClick={() => onNavigate("revenue")} actionLabel="Open accounts receivable" />
        <KpiCard label="Estimated profit" value={formatCurrency(summary.netProfit)} icon={TrendingUp} trend={summary.comparisons.netProfit} accent="green" onClick={() => onNavigate("revenue")} actionLabel="Open profit analysis" />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1.65fr_1fr]">
        <BentoSurface className="min-w-0">
          <CardHeader>
            <div><CardTitle>Monthly performance</CardTitle><CardDescription>Revenue and operating expenses before investments.</CardDescription></div>
            <Badge tone={summary.margin >= 15 ? "positive" : "warning"}>{formatPercent(summary.margin)} margin</Badge>
          </CardHeader>
          <CardContent className="pt-3">
            <RevenueOutflowChart data={monthly} />
            <div className="mt-2 text-xs text-[#66748A]">Each dollar billed produced {formatCurrency(summary.revenue ? summary.netProfit / summary.revenue : 0, false, 2)} in operating profit.</div>
          </CardContent>
        </BentoSurface>

        <BentoSurface className="overflow-hidden">
          <div className="border-b border-[#E4EAF1] px-5 py-4">
            <div className="flex items-center justify-between gap-3"><CardTitle>Business insights</CardTitle><Badge tone="brand">Live</Badge></div>
            <CardDescription>Items that deserve attention first.</CardDescription>
          </div>
          <div className="grid gap-3 p-4">
            <CompactInsight label="Top parts supplier" value={purchaseVendors[0]?.name ?? "No data"} detail={purchaseVendors[0] ? `${formatCurrency(purchaseVendors[0].amount)} in parts` : "No purchases recorded"} icon={PackageSearch} tone="red" onClick={() => onNavigate("purchases")} actionLabel="Open purchases by supplier" />
            <CompactInsight label="Oldest stored vehicle" value={oldestVehicle?.vehicle ?? "No vehicles"} detail={oldestVehicle ? `Since ${formatDate(oldestVehicle.arrivedAt)} · ${formatCurrency(oldestVehicle.amountDue)} to recover` : "No stored vehicles"} icon={CarFront} tone="yellow" onClick={() => onNavigate("storage")} actionLabel="Open oldest stored vehicle" />
            <CompactInsight label="Largest overhead category" value={largestExpense?.name ?? "No data"} detail={largestExpense ? `${formatCurrency(largestExpense.amount)} during this period` : "No expenses recorded"} icon={AlertTriangle} tone="red" onClick={() => onNavigate("expenses")} actionLabel="Open expense details" />
            <CompactInsight label="Vehicle storage exposure" value={formatCurrency(yard.amountDue)} detail={`${yard.vehicles} vehicles · ${yard.criticalVehicles} require action`} icon={Warehouse} tone="blue" onClick={() => onNavigate("storage")} actionLabel="Open vehicle storage" />
          </div>
        </BentoSurface>
      </div>
    </>
  );
}

const purchaseStatusLabels: Record<PartsPurchaseStatus, string> = {
  ordered: "Ordered",
  received: "Received",
  installed: "Installed",
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
        title="Parts purchasing control"
        description="Every purchase is tied to a part, supplier, repair order, and vehicle. This is the shop's primary cost trail."
        action={<Badge tone="brand">{control.linkedPurchases} linked purchases</Badge>}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Period purchases" value={formatCurrency(control.total)} icon={ShoppingCart} detail={`${control.purchases} purchase lines`} accent="red" />
        <KpiCard label="Average cost per vehicle" value={formatCurrency(control.averagePerOrder)} icon={CarFront} detail="Parts per linked repair order" accent="yellow" />
        <KpiCard label="Suppliers used" value={String(control.suppliers)} icon={Warehouse} detail="Supplier concentration below" />
        <KpiCard label="Traceability" value={control.purchases ? formatPercent(control.linkedPurchases / control.purchases * 100) : "—"} icon={PackageSearch} detail="Purchase → order → vehicle" accent="green" />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Card><CardHeader><div><CardTitle>Purchases by supplier</CardTitle><CardDescription>Suppliers receiving the largest share of parts spending.</CardDescription></div></CardHeader><CardContent className="pt-3"><HorizontalAmountChart data={byVendor} ariaLabel="Parts purchases grouped by supplier" color="#C90301" /></CardContent></Card>
        <Card><CardHeader><div><CardTitle>Vehicles with the highest parts cost</CardTitle><CardDescription>Repair orders carrying the largest parts investment.</CardDescription></div></CardHeader><CardContent className="pt-3"><HorizontalAmountChart data={byVehicle} ariaLabel="Parts cost grouped by vehicle and repair order" color="#00307B" /></CardContent></Card>
      </div>

      <Card className="mt-3 overflow-hidden">
        <CardHeader><div><CardTitle>Purchase details</CardTitle><CardDescription>Search by part, supplier, order, customer, or vehicle. Newest purchases appear first.</CardDescription></div><Badge tone="neutral">{Math.min(25, filtered.length)} of {filtered.length}</Badge></CardHeader>
        <CardContent className="border-b border-[#E1E8F0] pb-4 pt-4">
          <div className="flex flex-wrap gap-3">
            <label className="relative min-w-[240px] flex-1"><b className="sr-only">Search purchases</b><Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-[#738096]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search part, supplier, order, or vehicle" className="min-h-11 w-full rounded-xl border border-[#DCE4EE] bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#00307B]" /></label>
            <label><b className="sr-only">Filter purchases by status</b><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="min-h-11 cursor-pointer rounded-xl border border-[#DCE4EE] bg-white px-3 text-sm font-semibold text-[#203149] outline-none focus:ring-2 focus:ring-[#00307B]"><option value="all">All statuses</option><option value="ordered">Ordered</option><option value="received">Received</option><option value="installed">Installed</option></select></label>
          </div>
        </CardContent>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="bg-[#F4F7FA] text-xs uppercase tracking-[0.08em] text-[#66748A]"><tr><th className="px-5 py-3">Purchase / date</th><th className="px-4 py-3">Part</th><th className="px-4 py-3">Supplier</th><th className="px-4 py-3">Vehicle / customer</th><th className="px-4 py-3">Order</th><th className="px-4 py-3 text-right">Quantity</th><th className="px-4 py-3 text-right">Unit cost</th><th className="px-4 py-3 text-right">Total</th><th className="px-5 py-3">Status</th></tr></thead>
            <tbody className="divide-y divide-[#E4EAF1]">
              {filtered.slice(0, 25).map((purchase) => <tr key={purchase.id} className="hover:bg-[#F8FAFC]"><td className="px-5 py-3"><strong className="font-semibold text-[#00307B]">{purchase.id}</strong><div className="mt-1 text-xs text-[#738096]">{formatDate(purchase.date)}</div></td><td className="px-4 py-3"><strong className="font-medium text-[#203149]">{purchase.partName}</strong><div className="mt-1 text-xs text-[#738096]">{purchase.partNumber}</div></td><td className="px-4 py-3 text-[#40516A]">{purchase.vendor}</td><td className="px-4 py-3"><strong className="font-medium text-[#203149]">{purchase.vehicle}</strong><div className="mt-1 text-xs text-[#738096]">{purchase.customer}</div></td><td className="px-4 py-3 font-semibold text-[#00307B]">{purchase.repairOrderId}</td><td className="px-4 py-3 text-right">{purchase.quantity}</td><td className="px-4 py-3 text-right text-[#66748A]">{formatCurrency(purchase.unitCost, false, 2)}</td><td className="px-4 py-3 text-right font-bold text-[#10213A]">{formatCurrency(purchase.totalCost)}</td><td className="px-5 py-3"><Badge tone={purchaseStatusTones[purchase.status]}>{purchaseStatusLabels[purchase.status]}</Badge></td></tr>)}
            </tbody>
          </table>
          {!filtered.length && <div className="p-8 text-center text-sm text-[#66748A]">No purchases match the selected filters.</div>}
        </div>
      </Card>
    </>
  );
}

const storageStatusLabels: Record<StorageVehicleStatus, string> = {
  awaiting_pickup: "Awaiting pickup",
  abandoned_risk: "Abandonment risk",
  lien_review: "Lien review",
  recovery_review: "Recovery review",
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
        title="Vehicles held in storage"
        description={`Physical inventory as of ${formatDate(snapshot.period.end)}: occupied space, outstanding balance, and potential recovery value. Any vehicle disposition requires legal and document review.`}
        action={<Badge tone={control.criticalVehicles ? "negative" : "positive"}>{control.criticalVehicles} vehicles require action</Badge>}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Vehicles in storage" value={String(control.vehicles)} icon={Warehouse} detail={`${formatPercent(control.occupancy)} of 48 spaces`} />
        <KpiCard label="Outstanding balance" value={formatCurrency(control.amountDue)} icon={CircleDollarSign} detail="Repairs + storage fees" accent="red" />
        <KpiCard label="Potential sale value" value={formatCurrency(control.estimatedSaleValue)} icon={DollarSign} detail="Operating estimate, not a final appraisal" accent="green" />
        <KpiCard label="Average age" value={`${control.averageDays} days`} icon={CarFront} detail={`${control.criticalVehicles} vehicles exceed normal wait time`} accent="yellow" />
      </div>

      <div className="mt-3 grid items-start gap-3 lg:grid-cols-[1.25fr_0.75fr]">
        <BentoSurface className="overflow-hidden bg-[#081A31] text-white">
          <div className="grid gap-5 p-6 sm:grid-cols-3">
            <div><div className="text-sm text-[#B9C8D9]">Outstanding repairs</div><output className="mt-2 block text-3xl font-bold tracking-[-0.03em]">{formatCurrency(control.repairAmount)}</output></div>
            <div><div className="text-sm text-[#B9C8D9]">Storage fees</div><output className="mt-2 block text-3xl font-bold tracking-[-0.03em]">{formatCurrency(control.storageFees)}</output></div>
            <div><div className="text-sm text-[#B9C8D9]">Total exposure</div><output className="mt-2 block text-3xl font-bold tracking-[-0.03em] text-[#FFC834]">{formatCurrency(control.amountDue)}</output></div>
          </div>
          <div className="border-t border-white/10 px-6 py-4 text-sm leading-6 text-[#B9C8D9]">This amount represents billable or recoverable value currently tied to vehicles that have not been picked up.</div>
        </BentoSurface>
        <Card>
          <CardHeader><div><CardTitle>Inventory status</CardTitle><CardDescription>Vehicles by follow-up stage.</CardDescription></div></CardHeader>
          <CardContent className="space-y-3">
            {byStatus.map((item) => <div key={item.name} className="flex items-center justify-between gap-4 rounded-xl border border-[#E1E8F0] px-4 py-3"><strong className="text-sm font-semibold text-[#40516A]">{item.name}</strong><output className="text-lg font-bold text-[#10213A]">{item.amount}</output></div>)}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-3 overflow-hidden">
        <CardHeader><div><CardTitle>Storage inventory</CardTitle><CardDescription>Prioritized by time in storage, from oldest to newest.</CardDescription></div><Badge tone="neutral">{filtered.length} vehicles</Badge></CardHeader>
        <CardContent className="border-b border-[#E1E8F0] pb-4 pt-4">
          <div className="flex flex-wrap gap-3">
            <label className="relative min-w-[240px] flex-1"><b className="sr-only">Search stored vehicles</b><Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-[#738096]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search vehicle, customer, VIN, or order" className="min-h-11 w-full rounded-xl border border-[#DCE4EE] bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#00307B]" /></label>
            <label><b className="sr-only">Filter vehicles by status</b><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="min-h-11 cursor-pointer rounded-xl border border-[#DCE4EE] bg-white px-3 text-sm font-semibold text-[#203149] outline-none focus:ring-2 focus:ring-[#00307B]"><option value="all">All statuses</option><option value="awaiting_pickup">Awaiting pickup</option><option value="abandoned_risk">Abandonment risk</option><option value="lien_review">Lien review</option><option value="recovery_review">Recovery review</option></select></label>
          </div>
        </CardContent>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[1200px] text-left text-sm">
            <thead className="bg-[#F4F7FA] text-xs uppercase tracking-[0.08em] text-[#66748A]"><tr><th className="px-5 py-3">Unit / age</th><th className="px-4 py-3">Vehicle / VIN</th><th className="px-4 py-3">Customer / order</th><th className="px-4 py-3 text-right">Repair</th><th className="px-4 py-3 text-right">Storage</th><th className="px-4 py-3 text-right">Amount due</th><th className="px-4 py-3 text-right">Est. sale value</th><th className="w-[176px] px-5 py-3">Status</th></tr></thead>
            <tbody className="divide-y divide-[#E4EAF1]">
              {filtered.map((vehicle) => <tr key={vehicle.id} className="hover:bg-[#F8FAFC]"><td className="px-5 py-3"><strong className="font-semibold text-[#00307B]">{vehicle.id}</strong><div className="mt-1 text-xs font-semibold text-[#C90301]">{daysStored(vehicle.arrivedAt)} days</div><div className="mt-1 text-xs text-[#738096]">Arrived {formatDate(vehicle.arrivedAt)}</div></td><td className="px-4 py-3"><strong className="font-medium text-[#203149]">{vehicle.vehicle}</strong><div className="mt-1 text-xs text-[#738096]">VIN · {vehicle.vinLast6}</div></td><td className="px-4 py-3"><strong className="font-medium text-[#203149]">{vehicle.customer}</strong><div className="mt-1 text-xs text-[#00307B]">{vehicle.repairOrderId}</div><div className="mt-1 text-xs text-[#738096]">Last contact: {formatDate(vehicle.lastContactAt)}</div></td><td className="px-4 py-3 text-right font-semibold">{formatCurrency(vehicle.repairAmount)}</td><td className="px-4 py-3 text-right text-[#66748A]">{formatCurrency(vehicle.storageFees)}</td><td className="px-4 py-3 text-right font-bold text-[#C90301]">{formatCurrency(vehicle.amountDue)}</td><td className="px-4 py-3 text-right font-bold text-[#15803D]">{formatCurrency(vehicle.estimatedSaleValue)}</td><td className="px-5 py-3"><Badge tone={storageStatusTones[vehicle.status]}>{storageStatusLabels[vehicle.status]}</Badge></td></tr>)}
            </tbody>
          </table>
          {!filtered.length && <div className="p-8 text-center text-sm text-[#66748A]">No vehicles match the selected filters.</div>}
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
      <SectionHeading title="What is generating revenue" description="Earned revenue by service, payment channel, and highest-contribution jobs." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Period revenue" value={formatCurrency(summary.revenue)} icon={DollarSign} trend={summary.comparisons.revenue} />
        <KpiCard label="Average ticket" value={formatCurrency(summary.averageTicket)} icon={ReceiptText} detail={`${summary.jobs} completed orders`} accent="yellow" />
        <KpiCard label="Accounts receivable" value={formatCurrency(summary.receivables)} icon={CircleDollarSign} detail={`${snapshot.receivables.length} open invoices`} accent="red" />
        <KpiCard label="Operating margin" value={formatPercent(summary.margin)} icon={BarChart3} detail="After direct costs and overhead" accent="green" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><div><CardTitle>Revenue by service</CardTitle><CardDescription>Services contributing the most billed revenue.</CardDescription></div></CardHeader><CardContent className="pt-3"><HorizontalAmountChart data={byService} ariaLabel="Revenue grouped by service type" /></CardContent></Card>
        <Card><CardHeader><div><CardTitle>Payment channels</CardTitle><CardDescription>Distribution of paid repair orders.</CardDescription></div></CardHeader><CardContent className="pt-3"><HorizontalAmountChart data={byPayment} ariaLabel="Collected revenue by payment method" color="#15803D" /></CardContent></Card>
      </div>
      <Card className="mt-4 overflow-hidden">
        <CardHeader><div><CardTitle>Highest-contribution jobs</CardTitle><CardDescription>Gross margin before overhead.</CardDescription></div></CardHeader>
        <div className="mt-3 overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#F4F7FA] text-xs uppercase tracking-[0.1em] text-[#66748A]"><tr><th className="px-5 py-3">Order</th><th className="px-4 py-3">Service</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3 text-right">Revenue</th><th className="px-5 py-3 text-right">Contribution</th></tr></thead>
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
      <SectionHeading title="Where the money is going" description="Direct repair costs and operating expenses required to keep the shop running." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Operating outflow" value={formatCurrency(operations.operatingOutflow)} icon={WalletCards} detail="Direct costs + operations" accent="red" />
        <KpiCard label="Parts" value={formatCurrency(parts)} icon={Wrench} detail={formatPercent(operations.revenue ? parts / operations.revenue * 100 : 0) + " of revenue"} />
        <KpiCard label="Direct labor" value={formatCurrency(labor)} icon={ClipboardList} detail={formatPercent(operations.revenue ? labor / operations.revenue * 100 : 0) + " of revenue"} accent="yellow" />
        <KpiCard label="Overhead" value={formatCurrency(operations.operatingExpenses)} icon={ReceiptText} detail={`${snapshot.expenses.length} transactions`} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><div><CardTitle>Expenses by category</CardTitle><CardDescription>Monthly cost structure outside individual repair orders.</CardDescription></div></CardHeader><CardContent className="pt-3"><HorizontalAmountChart data={byCategory} ariaLabel="Operating expenses grouped by category" color="#C90301" /></CardContent></Card>
        <Card><CardHeader><div><CardTitle>Top vendors</CardTitle><CardDescription>Spending concentration and operating exposure.</CardDescription></div></CardHeader><CardContent className="pt-3"><HorizontalAmountChart data={byVendor} ariaLabel="Expenses grouped by vendor" color="#00307B" /></CardContent></Card>
      </div>
      <Card className="mt-4">
        <CardHeader><div><CardTitle>Recurring expenses</CardTitle><CardDescription>Ongoing commitments that should be reviewed regularly.</CardDescription></div></CardHeader>
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
      <SectionHeading title="Cash position and next decision" description="Only payments actually collected or paid are included; accounts receivable remain separate." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Opening balance" value={formatCurrency(snapshot.openingCash)} icon={PiggyBank} detail={formatDate(snapshot.period.start)} />
        <KpiCard label="Collections" value={formatCurrency(income)} icon={ArrowUpRight} detail="Cash received" accent="green" />
        <KpiCard label="Payments" value={formatCurrency(out)} icon={ArrowDownRight} detail="Operations + investments" accent="red" />
        <KpiCard label="Closing balance" value={formatCurrency(summary.closingCash)} icon={Banknote} detail={`${movement >= 0 ? "+" : ""}${formatCurrency(movement)} net`} accent="yellow" />
      </div>
      <Card className="mt-4">
        <CardHeader><div><CardTitle>Cash trend</CardTitle><CardDescription>Running balance after each movement in the selected period.</CardDescription></div><Badge tone={movement >= 0 ? "positive" : "negative"}>{movement >= 0 ? "Cash increasing" : "Cash decreasing"}</Badge></CardHeader>
        <CardContent className="pt-3"><CashAreaChart data={series} /><div className="mt-2 text-xs text-[#66748A]">Lowest balance in the period: {formatCurrency(Math.min(snapshot.openingCash, ...series.map((item) => item.balance)))}.</div></CardContent>
      </Card>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><div><CardTitle>Profit by month</CardTitle><CardDescription>Indicator of future cash-generating capacity.</CardDescription></div></CardHeader><CardContent className="pt-3"><ProfitChart data={monthly} /></CardContent></Card>
        <Card>
          <CardHeader><div><CardTitle>Short-term outlook</CardTitle><CardDescription>Simple projection based on the latest three visible months.</CardDescription></div></CardHeader>
          <CardContent>
            <div className="rounded-xl bg-[#071D3B] p-6 text-white"><div className="text-xs font-bold uppercase tracking-[0.14em] text-[#AFC0D4]">Estimated cash next month</div><output className="mt-3 block text-4xl font-bold">{formatCurrency(summary.closingCash + projection)}</output><div className="mt-3 text-sm leading-6 text-[#C9D5E3]">Assumes the recent average result continues without an extraordinary investment.</div></div>
            <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl border p-4"><div className="text-xs text-[#66748A]">Estimated change</div><output className={cn("mt-1 block text-xl font-bold", projection >= 0 ? "text-[#15803D]" : "text-[#C90301]")}>{projection >= 0 ? "+" : ""}{formatCurrency(projection)}</output></div><div className="rounded-xl border p-4"><div className="text-xs text-[#66748A]">Receivables</div><output className="mt-1 block text-xl font-bold text-[#10213A]">{formatCurrency(summary.receivables)}</output></div></div>
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
      <SectionHeading title="Where the business is reinvesting" description="Extraordinary purchases kept separate from operating expenses to show their actual cash impact." />
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Invested this period" value={formatCurrency(summary.investments)} icon={BriefcaseBusiness} detail={`${snapshot.investments.length} initiatives`} />
        <KpiCard label="Active categories" value={String(byCategory.length)} icon={BarChart3} detail="Equipment, technology, and growth" accent="yellow" />
        <KpiCard label="Average expected return" value={snapshot.investments.length ? `${Math.round(snapshot.investments.reduce((total, item) => total + item.expectedReturnMonths, 0) / snapshot.investments.length)} months` : "—"} icon={TrendingUp} detail="Initial estimate" accent="green" />
      </div>
      {snapshot.investments.length ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.4fr]">
          <Card><CardHeader><div><CardTitle>Allocation</CardTitle><CardDescription>Capital assigned by initiative type.</CardDescription></div></CardHeader><CardContent className="pt-3"><HorizontalAmountChart data={byCategory} ariaLabel="Investments by category" color="#00307B" /></CardContent></Card>
          <Card>
            <CardHeader><div><CardTitle>Period initiatives</CardTitle><CardDescription>Details and expected impact of each investment.</CardDescription></div></CardHeader>
            <CardContent className="space-y-3">
              {snapshot.investments.map((item) => <div key={item.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-[#E1E8F0] p-4"><div className="flex size-11 items-center justify-center rounded-full bg-[#DDF6F7] text-[#078D98]"><BriefcaseBusiness className="size-5" /></div><div className="min-w-[220px] flex-1"><strong className="font-semibold text-[#10213A]">{item.description}</strong><div className="mt-1 text-xs text-[#66748A]">{formatDate(item.date)} · {item.category}</div></div><div className="text-right"><output className="block font-bold text-[#10213A]">{formatCurrency(item.amount)}</output><div className="mt-1 text-xs text-[#66748A]">Return: {item.expectedReturnMonths} months</div></div><Badge tone={item.status === "active" ? "positive" : "neutral"}>{item.status === "active" ? "Active" : "Completed"}</Badge></div>)}
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
      <button className="absolute inset-0 cursor-pointer" aria-label="Close details" onClick={onClose} />
      <div className="relative h-auto max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-lg sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4"><h2 id="order-detail-title" className="font-heading text-3xl font-bold uppercase text-[#10213A]">{order.id}</h2><Button variant="secondary" size="icon" onClick={onClose} aria-label="Close"><X className="size-5" /></Button></div>
        <div className="mt-6 rounded-xl bg-[#071D3B] p-5 text-white"><div className="text-sm text-[#B9C8D9]">Job contribution</div><output className="mt-2 block text-4xl font-bold">{formatCurrency(margin)}</output><div className="mt-2 text-sm text-[#C9D5E3]">{formatPercent(order.revenue ? margin / order.revenue * 100 : 0)} of revenue</div></div>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          {[['Customer', order.customer], ['Vehicle', order.vehicle], ['Service', order.service], ['Date', formatDate(order.date)], ['Revenue', formatCurrency(order.revenue)], ['Parts', formatCurrency(order.partsCost)], ['Labor', formatCurrency(order.laborCost)], ['Payment method', order.paymentMethod]].map(([label, value]) => <div key={label} className="rounded-xl border border-[#E1E8F0] p-3"><dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[#66748A]">{label}</dt><dd className="mt-1 font-semibold text-[#10213A]">{value}</dd></div>)}
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
      <SectionHeading title="Profitability by job" description="Each repair order shows revenue, direct costs, margin, and payment status." action={<Badge tone="brand">{filtered.length} results</Badge>} />
      <Card className="overflow-hidden">
        <CardContent className="border-b border-[#E1E8F0] p-4">
          <div className="flex flex-wrap gap-3">
            <label className="relative min-w-[240px] flex-1"><b className="sr-only">Search jobs</b><Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-[#738096]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, customer, vehicle, or service" className="min-h-11 w-full rounded-xl border border-[#DCE4EE] bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#00307B]" /></label>
            <label><b className="sr-only">Filter by status</b><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="min-h-11 cursor-pointer rounded-xl border border-[#DCE4EE] bg-white px-3 text-sm font-semibold text-[#203149] outline-none focus:ring-2 focus:ring-[#00307B]"><option value="all">All statuses</option><option value="paid">Paid</option><option value="pending">Pending</option></select></label>
          </div>
        </CardContent>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-[#F4F7FA] text-xs uppercase tracking-[0.09em] text-[#66748A]"><tr><th className="px-5 py-3">Order / date</th><th className="px-4 py-3">Customer / vehicle</th><th className="px-4 py-3">Service</th><th className="px-4 py-3 text-right">Revenue</th><th className="px-4 py-3 text-right">Costs</th><th className="px-4 py-3 text-right">Margin</th><th className="px-4 py-3">Status</th><th className="px-5 py-3"><b className="sr-only">Actions</b></th></tr></thead>
            <tbody className="divide-y divide-[#E4EAF1]">
              {filtered.slice(0, 80).map((order) => {
                const margin = orderMargin(order);
                return <tr key={order.id} className="hover:bg-[#F8FAFC]"><td className="px-5 py-3"><strong className="font-semibold text-[#00307B]">{order.id}</strong><div className="mt-1 text-xs text-[#738096]">{formatDate(order.date)}</div></td><td className="px-4 py-3"><strong className="font-medium text-[#203149]">{order.customer}</strong><div className="mt-1 text-xs text-[#738096]">{order.vehicle}</div></td><td className="max-w-[220px] px-4 py-3 text-[#40516A]">{order.service}</td><td className="px-4 py-3 text-right font-semibold">{formatCurrency(order.revenue)}</td><td className="px-4 py-3 text-right text-[#66748A]">{formatCurrency(order.partsCost + order.laborCost)}</td><td className="px-4 py-3 text-right font-bold text-[#15803D]">{formatCurrency(margin)}</td><td className="px-4 py-3"><Badge tone={order.status === "paid" ? "positive" : "warning"}>{order.status === "paid" ? "Paid" : "Pending"}</Badge></td><td className="px-5 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => setSelected(order)}>View details</Button></td></tr>;
              })}
            </tbody>
          </table>
          {!filtered.length && <div className="p-8 text-center text-sm text-[#66748A]">No jobs match the selected filters.</div>}
        </div>
      </Card>
      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function DashboardSkeleton() {
  return <div className="animate-pulse space-y-4" aria-label="Loading financial data"><div className="h-12 rounded-xl bg-[#DFE7EF]" /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div className="h-32 rounded-xl bg-[#DFE7EF]" key={index} />)}</div><div className="h-[390px] rounded-xl bg-[#DFE7EF]" /></div>;
}

export function DashboardApp() {
  const [section, setSection] = useState<Section>("dashboard");
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

  const exportReport = () => {
    if (!snapshot || !summary) return;
    const report = [
      ["Metric", "Value"],
      ["Period start", snapshot.period.start],
      ["Period end", snapshot.period.end],
      ["Revenue", summary.revenue],
      ["Operating outflow", summary.operatingOutflow],
      ["Net profit", summary.netProfit],
      ["Operating margin", `${summary.margin.toFixed(1)}%`],
      ["Closing cash", summary.closingCash],
      ["Accounts receivable", summary.receivables],
      ["Investments", summary.investments],
      ["Completed jobs", summary.jobs],
      ["Average ticket", summary.averageTicket],
    ];
    const csv = report.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `speedys-financial-report-${snapshot.period.end}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-transparent">
      <a href="#main-content" className="fixed left-4 top-3 z-[80] -translate-y-20 rounded-lg bg-[#00307B] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#FFC834]">
        Skip to content
      </a>
      <Sidebar section={section} onNavigate={navigate} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="min-w-0 lg:pl-[224px]">
        <Header section={section} period={preset} dateRange={period} onPeriodChange={setPreset} customStart={customStart} customEnd={customEnd} onCustomStart={setCustomStart} onCustomEnd={setCustomEnd} onMenu={() => setMobileOpen(true)} onExport={exportReport} canExport={Boolean(snapshot && summary)} />
        <main id="main-content" tabIndex={-1} className="dashboard-grid mx-auto max-w-[1700px] px-4 py-4 outline-none md:px-6 xl:px-7 xl:py-5">
          {!snapshot || !summary ? <DashboardSkeleton /> : snapshot.repairOrders.length === 0 && section !== "investments" && section !== "storage" ? <EmptyState /> : (
            <>
              {section === "dashboard" && <SummaryPage snapshot={snapshot} summary={summary} onNavigate={navigate} />}
              {section === "purchases" && <PurchasesPage snapshot={snapshot} />}
              {section === "storage" && <StoragePage snapshot={snapshot} />}
              {section === "revenue" && <IncomePage snapshot={snapshot} summary={summary} />}
              {section === "expenses" && <ExpensesPage snapshot={snapshot} />}
              {section === "cash" && <CashFlowPage snapshot={snapshot} summary={summary} />}
              {section === "investments" && <InvestmentsPage snapshot={snapshot} summary={summary} />}
              {section === "jobs" && <JobsPage snapshot={snapshot} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
