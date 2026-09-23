"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { CHART_COLORS } from "@/config/constants";
import type { CategorySlice, MonthlyPoint } from "@/lib/finance";
import { formatCurrency, formatMonthYear } from "@/lib/formatters";

/** Eixo Y compacto: 1500 -> "R$ 1,5 mil" */
function compactCurrency(reais: number) {
  if (Math.abs(reais) >= 1000) {
    return `R$ ${(reais / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  }
  return `R$ ${reais.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}

function ChartTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as MonthlyPoint | undefined;
  return (
    <div className="min-w-44 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-lg">
      {point && <p className="mb-1.5 font-semibold text-slate-800">{formatMonthYear(point.month)}</p>}
      <ul className="space-y-1">
        {payload.map((row) => (
          <li key={String(row.dataKey)} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="size-2.5 rounded-sm" style={{ backgroundColor: row.color }} aria-hidden />
              {row.name}
            </span>
            <span className="font-semibold text-slate-800">{formatCurrency(Math.round(Number(row.value) * 100))}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ backgroundColor: item.color }} aria-hidden />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: CHART_COLORS.axis, fontSize: 12 },
} as const;

/** Entradas x Saídas por mês (barras agrupadas). */
export function IncomeExpenseChart({ data, height = 280 }: { data: MonthlyPoint[]; height?: number }) {
  return (
    <figure className="space-y-3">
      <Legend
        items={[
          { label: "Entradas", color: CHART_COLORS.income },
          { label: "Saídas", color: CHART_COLORS.expense },
        ]}
      />
      <div style={{ height }} aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2} barCategoryGap="28%" margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} width={88} tickFormatter={compactCurrency} />
            <Tooltip content={ChartTooltip} cursor={{ fill: "#f1f5f9" }} />
            <Bar dataKey="income" name="Entradas" fill={CHART_COLORS.income} radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="expense" name="Saídas" fill={CHART_COLORS.expense} radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">
        {data
          .map((p) => `${formatMonthYear(p.month)}: entradas ${formatCurrency(p.income * 100)}, saídas ${formatCurrency(p.expense * 100)}`)
          .join("; ")}
      </figcaption>
    </figure>
  );
}

/** Resultado (entradas - saídas) mês a mês. */
export function BalanceTrendChart({ data, height = 260 }: { data: MonthlyPoint[]; height?: number }) {
  return (
    <figure className="space-y-3">
      <div style={{ height }} aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 16, right: 12, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.income} stopOpacity={0.25} />
                <stop offset="100%" stopColor={CHART_COLORS.income} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} width={88} tickFormatter={compactCurrency} />
            <ReferenceLine y={0} stroke={CHART_COLORS.axis} />
            <Tooltip content={ChartTooltip} cursor={{ stroke: CHART_COLORS.axis, strokeDasharray: "3 3" }} />
            <Area
              type="linear"
              dataKey="balance"
              name="Resultado"
              stroke={CHART_COLORS.income}
              strokeWidth={2}
              fill="url(#balanceFill)"
              dot={{ r: 4, fill: CHART_COLORS.income, stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">
        {data.map((p) => `${formatMonthYear(p.month)}: resultado ${formatCurrency(p.balance * 100)}`).join("; ")}
      </figcaption>
    </figure>
  );
}

/** Ranking de categorias em barras horizontais (mais legível que pizza). */
export function CategoryBreakdown({ slices, limit }: { slices: CategorySlice[]; limit?: number }) {
  const visible = limit ? slices.slice(0, limit) : slices;
  const max = Math.max(...visible.map((s) => s.total), 1);
  return (
    <ul className="space-y-3.5">
      {visible.map((slice) => (
        <li key={slice.categoryId} className="group">
          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-slate-700">
              <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: slice.color }} aria-hidden />
              <span className="truncate font-medium">{slice.name}</span>
            </span>
            <span className="shrink-0 text-slate-500">
              <span className="font-semibold text-slate-800">{formatCurrency(slice.total)}</span> · {slice.percent.toLocaleString("pt-BR")}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100" title={`${slice.count} lançamento(s)`}>
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{ width: `${(slice.total / max) * 100}%`, backgroundColor: slice.color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
