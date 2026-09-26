"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/format";
import type { MonthlyMetric } from "@/lib/types";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #DCE4EE",
  boxShadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
  fontFamily: "var(--font-poppins)",
  fontSize: 12,
};

const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: "#6B778B", fontSize: 11 },
};

export function RevenueOutflowChart({ data }: { data: MonthlyMetric[] }) {
  return (
    <div role="img" aria-label="Evolución mensual de ingresos y egresos operativos" className="h-[310px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
          <CartesianGrid stroke="#E8EEF5" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis tickFormatter={(value) => formatCurrency(Number(value), true)} width={64} {...axisProps} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(Number(value))} />
          <Legend iconType="line" wrapperStyle={{ fontSize: 12, paddingTop: 14 }} />
          <Line type="monotone" dataKey="revenue" name="Ingresos" stroke="#00307B" strokeWidth={3} dot={{ r: 3, fill: "#00307B" }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="outflow" name="Egresos" stroke="#C90301" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 3, fill: "#C90301" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HorizontalAmountChart({ data, ariaLabel, color = "#00307B" }: { data: { name: string; amount: number }[]; ariaLabel: string; color?: string }) {
  const visible = data.slice(0, 7);
  return (
    <div role="img" aria-label={ariaLabel} className="h-[310px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={visible} layout="vertical" margin={{ top: 0, right: 20, left: 12, bottom: 0 }}>
          <CartesianGrid stroke="#E8EEF5" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tickFormatter={(value) => formatCurrency(Number(value), true)} {...axisProps} />
          <YAxis dataKey="name" type="category" width={135} {...axisProps} tick={{ fill: "#4F5F75", fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(Number(value))} />
          <Bar dataKey="amount" name="Importe" fill={color} radius={[0, 7, 7, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CashAreaChart({ data }: { data: { date: string; balance: number; movement: number }[] }) {
  const thinned = data.filter((_, index) => index % Math.max(1, Math.floor(data.length / 48)) === 0 || index === data.length - 1);
  return (
    <div role="img" aria-label="Evolución del saldo de caja durante el período" className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={thinned} margin={{ top: 10, right: 18, left: -4, bottom: 0 }}>
          <defs>
            <linearGradient id="cashFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00307B" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#00307B" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E8EEF5" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tickFormatter={(value) => String(value).slice(5)} {...axisProps} />
          <YAxis tickFormatter={(value) => formatCurrency(Number(value), true)} width={64} {...axisProps} />
          <Tooltip contentStyle={tooltipStyle} labelFormatter={(value) => formatDate(String(value))} formatter={(value) => formatCurrency(Number(value))} />
          <ReferenceLine y={0} stroke="#C90301" strokeDasharray="4 4" />
          <Area type="monotone" dataKey="balance" name="Caja" stroke="#00307B" strokeWidth={3} fill="url(#cashFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

type WaterfallPoint = {
  name: string;
  value: number;
  base: number;
  display: number;
  kind: string;
  start: number;
  end: number;
};

export function WaterfallChart({ data }: { data: WaterfallPoint[] }) {
  const comparison = data.map((item) => ({
    ...item,
    label: item.name === "Repuestos y mano de obra" ? "Costos directos" : item.name,
    axisLabel: item.name === "Repuestos y mano de obra" ? "Repuestos" : item.name === "Gastos operativos" ? "Gastos" : item.name,
    amount: Math.abs(item.value),
  }));

  return (
    <div role="img" aria-label="Comparación desde cero de ingresos, costos directos, gastos operativos y utilidad" className="w-full">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparison} margin={{ top: 30, right: 12, left: -4, bottom: 10 }}>
            <CartesianGrid stroke="#E8EEF5" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="axisLabel" interval={0} padding={{ left: 12, right: 12 }} {...axisProps} tick={{ fill: "#4F5F75", fontSize: 10 }} />
            <YAxis domain={[0, "auto"]} tickFormatter={(value) => formatCurrency(Number(value), true)} width={68} {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="amount" name="Importe" radius={[8, 8, 0, 0]} maxBarSize={112}>
              {comparison.map((item) => <Cell key={item.name} fill={item.kind === "negative" ? "#C90301" : item.kind === "total" ? "#15803D" : "#00307B"} />)}
              <LabelList dataKey="amount" position="top" formatter={(value) => formatCurrency(Number(value), true)} style={{ fill: "#243247", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-poppins)" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <dl className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {comparison.map((item) => (
          <div key={item.name} className="rounded-xl border border-[#E1E8F0] bg-[#F8FAFC] px-3 py-2.5">
            <dt className="text-xs font-medium text-[#66748A]">{item.label}</dt>
            <dd className={item.kind === "negative" ? "mt-1 text-sm font-bold text-[#B42318]" : item.kind === "total" ? "mt-1 text-sm font-bold text-[#15803D]" : "mt-1 text-sm font-bold text-[#00307B]"}>{item.kind === "negative" ? "−" : item.kind === "total" ? "=" : "+"} {formatCurrency(Math.abs(item.value))}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ProfitChart({ data }: { data: MonthlyMetric[] }) {
  return (
    <div role="img" aria-label="Utilidad mensual" className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
          <CartesianGrid stroke="#E8EEF5" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis tickFormatter={(value) => formatCurrency(Number(value), true)} width={64} {...axisProps} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(Number(value))} />
          <ReferenceLine y={0} stroke="#718096" />
          <Bar dataKey="profit" name="Utilidad" radius={[6, 6, 0, 0]}>
            {data.map((item) => <Cell key={item.key} fill={item.profit >= 0 ? "#15803D" : "#C90301"} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
