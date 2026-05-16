// ============================================================
// DataNest - Dashboard principal (refactorizado)
// Usa: useDashboard hook + KPICard + SalesChart + TopClientsTable + InactiveClientsAlert
// ============================================================

"use client";

import {
  TrendingUp, Receipt, Users, AlertTriangle,
  RefreshCw, PlugZap, Clock,
} from "lucide-react";
import Link from "next/link";
import { useDashboard }         from "@/hooks/useDashboard";
import { KPICard }              from "@/components/dashboard/KPICard";
import { SalesChart }           from "@/components/dashboard/SalesChart";
import { TopClientsTable }      from "@/components/dashboard/TopClientsTable";
import { InactiveClientsAlert } from "@/components/dashboard/InactiveClientsAlert";
import { formatCurrency, formatCompact, percentChange } from "@/lib/utils";

export default function DashboardPage() {
  const { data, loading, error, refetch, lastUpdated } = useDashboard();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center max-w-sm mx-auto">
        <div className="w-16 h-16 bg-danger-400/10 rounded-2xl flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-danger-500" />
        </div>
        <h2 className="text-lg font-bold text-surface-900 mb-2">No se pudieron cargar los datos</h2>
        <p className="text-sm text-surface-500 mb-5">{error}</p>
        <button onClick={refetch} className="btn-primary">
          <RefreshCw className="w-4 h-4" /> Reintentar
        </button>
      </div>
    );
  }

  const salesTrend = data
    ? percentChange(data.kpis.currentMonthSales, data.kpis.previousMonthSales)
    : undefined;

  const hasData = (data?.monthlySales.length ?? 0) > 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between animate-in-1">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Resumen en tiempo real de tu negocio
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-surface-400">
              <Clock className="w-3 h-3" />
              {new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(lastUpdated)}
            </span>
          )}
          <button onClick={refetch} disabled={loading} className="btn-secondary text-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Banner sin datos */}
      {!loading && !hasData && (
        <div className="animate-in-2 bg-gradient-to-r from-brand-50 to-accent-400/5
                        border border-brand-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <PlugZap className="w-5 h-5 text-brand-500" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-brand-800 text-sm">Todavía no hay datos</p>
            <p className="text-xs text-brand-600 mt-0.5">
              Conectá tu primera fuente para ver métricas reales.
            </p>
          </div>
          <Link href="/connect" className="btn-primary text-sm flex-shrink-0">
            Conectar →
          </Link>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Ventas este mes"
          value={loading ? "—" : formatCurrency(data?.kpis.currentMonthSales ?? 0)}
          sub={data ? `Mes ant.: ${formatCurrency(data.kpis.previousMonthSales)}` : undefined}
          trend={salesTrend}
          icon={TrendingUp}
          color="brand"
          loading={loading}
          className="animate-in-1"
        />
        <KPICard
          title="Ticket promedio"
          value={loading ? "—" : formatCurrency(data?.kpis.avgTicket ?? 0)}
          sub="Por transacción completada"
          icon={Receipt}
          color="accent"
          loading={loading}
          className="animate-in-2"
        />
        <KPICard
          title="Clientes totales"
          value={loading ? "—" : formatCompact(data?.kpis.totalClients ?? 0)}
          sub={data ? `${data.kpis.activeClients} activos en 90 días` : undefined}
          icon={Users}
          color="gray"
          loading={loading}
          className="animate-in-3"
        />
        <KPICard
          title="Alertas inactividad"
          value={loading ? "—" : String(data?.inactiveClients.length ?? 0)}
          sub="Sin compras en los últimos 30 días"
          icon={AlertTriangle}
          color={(data?.inactiveClients.length ?? 0) > 0 ? "danger" : "gray"}
          loading={loading}
          className="animate-in-4"
        />
      </div>

      {/* Gráfico */}
      <div className="animate-in-3">
        <SalesChart data={data?.monthlySales ?? []} loading={loading} />
      </div>

      {/* Grid inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="animate-in-4">
          <TopClientsTable clients={data?.topClients ?? []} loading={loading} />
        </div>
        <div className="animate-in-5">
          <InactiveClientsAlert clients={data?.inactiveClients ?? []} loading={loading} />
        </div>
      </div>
    </div>
  );
}
