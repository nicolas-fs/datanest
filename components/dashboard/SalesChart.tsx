// ============================================================
// DataNest - Componente de gráfico de ventas mensuales
// Usa Recharts con gradiente y tooltip personalizado
// ============================================================

"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { formatCurrency, formatCompact } from "@/lib/utils";

interface SalesPoint {
  month:        string;
  total:        number;
  transactions: number;
}

interface SalesChartProps {
  data:    SalesPoint[];
  loading?: boolean;
}

// --- Tooltip personalizado ---
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const total        = payload[0]?.value ?? 0;
  const transactions = payload[0]?.payload?.transactions ?? 0;

  return (
    <div className="bg-surface-900 text-white rounded-2xl px-4 py-3 shadow-xl border border-surface-700 text-sm">
      <p className="font-semibold text-surface-300 mb-1">{label}</p>
      <p className="font-bold text-lg">{formatCurrency(total)}</p>
      <p className="text-surface-400 text-xs mt-0.5">{transactions} transacciones</p>
    </div>
  );
}

export function SalesChart({ data, loading = false }: SalesChartProps) {
  if (loading) {
    return (
      <div className="card">
        <div className="skeleton h-5 w-56 rounded-lg mb-5" />
        <div className="skeleton h-60 w-full rounded-2xl" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card flex items-center justify-center h-40">
        <p className="text-sm text-surface-400">Sin datos para mostrar. Conectá una fuente para ver el gráfico.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-surface-800">
          Evolución de ventas
        </h2>
        <span className="text-xs text-surface-400 badge badge-gray">
          Últimos 12 meses
        </span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "var(--font-sora)" }}
            tickLine={false}
            axisLine={false}
            dy={8}
          />

          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "var(--font-sora)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${formatCompact(v)}`}
            width={60}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#6366f1", strokeWidth: 1, strokeDasharray: "4 4" }} />

          <Area
            type="monotone"
            dataKey="total"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#salesGradient)"
            dot={false}
            activeDot={{ r: 5, fill: "#6366f1", stroke: "#fff", strokeWidth: 2.5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
