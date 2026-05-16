// ============================================================
// DataNest - Componente KPI Card reutilizable
// Muestra una métrica con ícono, valor, tendencia y subtítulo
// ============================================================

import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ColorVariant = "brand" | "accent" | "danger" | "gray" | "orange";

interface KPICardProps {
  title:    string;
  value:    string;
  sub?:     string;
  trend?:   number;        // porcentaje de cambio respecto al período anterior
  icon:     LucideIcon;
  color?:   ColorVariant;
  loading?: boolean;
  className?: string;
}

const COLOR_MAP: Record<ColorVariant, { bg: string; icon: string; border: string }> = {
  brand:  { bg: "bg-brand-50",        icon: "text-brand-500",  border: "border-brand-100" },
  accent: { bg: "bg-accent-400/10",   icon: "text-accent-500", border: "border-accent-400/20" },
  danger: { bg: "bg-danger-400/10",   icon: "text-danger-500", border: "border-danger-400/20" },
  gray:   { bg: "bg-surface-100",     icon: "text-surface-500",border: "border-surface-200" },
  orange: { bg: "bg-orange-50",       icon: "text-orange-500", border: "border-orange-100" },
};

export function KPICard({
  title,
  value,
  sub,
  trend,
  icon: Icon,
  color = "brand",
  loading = false,
  className,
}: KPICardProps) {
  const c = COLOR_MAP[color];

  if (loading) {
    return (
      <div className={cn("card space-y-3", className)}>
        <div className="flex items-start justify-between">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
        <div className="skeleton h-8 w-32 rounded-lg" />
        <div className="skeleton h-4 w-44 rounded-lg" />
      </div>
    );
  }

  return (
    <div className={cn("card group cursor-default", className)}>
      {/* Ícono + badge de tendencia */}
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", c.bg, c.border)}>
          <Icon className={cn("w-5 h-5", c.icon)} />
        </div>

        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
              trend >= 0
                ? "bg-accent-400/10 text-accent-600"
                : "bg-danger-400/10 text-danger-500"
            )}
          >
            {trend >= 0
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />
            }
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Valor principal */}
      <p className="text-2xl font-black text-surface-900 leading-none tracking-tight">
        {value}
      </p>

      {/* Título */}
      <p className="text-sm text-surface-500 mt-1 font-medium">{title}</p>

      {/* Subtítulo opcional */}
      {sub && (
        <p className="text-xs text-surface-400 mt-0.5">{sub}</p>
      )}
    </div>
  );
}
