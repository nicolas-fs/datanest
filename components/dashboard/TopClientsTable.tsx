// ============================================================
// DataNest - Componente TopClientsTable
// Muestra los 5 clientes con mayor facturación
// ============================================================

import { Users } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

interface Client {
  id:              string;
  name:            string;
  email:           string | null;
  totalSpent:      number;
  totalPurchases:  number;
  lastPurchaseDate: string;
}

interface TopClientsTableProps {
  clients:  Client[];
  loading?: boolean;
}

// Colores para el podio (1°, 2°, 3° lugar)
const POSITION_STYLES = [
  "bg-yellow-50 text-yellow-700 border-yellow-200",   // 1°
  "bg-surface-100 text-surface-500 border-surface-200", // 2°
  "bg-orange-50 text-orange-600 border-orange-200",   // 3°
];

export function TopClientsTable({ clients, loading = false }: TopClientsTableProps) {
  if (loading) {
    return (
      <div className="card">
        <div className="skeleton h-5 w-36 rounded-lg mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton h-6 w-6 rounded-full" />
              <div className="skeleton h-10 flex-1 rounded-xl" />
              <div className="skeleton h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-surface-800">Top 5 clientes</h2>
        {clients.length > 0 && (
          <span className="badge badge-indigo">Por facturación</span>
        )}
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin clientes aún"
          description="Importá ventas para ver el ranking de tus mejores clientes."
          action={{ label: "Conectar datos", href: "/connect" }}
        />
      ) : (
        <div className="space-y-2">
          {clients.map((client, i) => (
            <div
              key={client.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors group"
            >
              {/* Posición */}
              <div
                className={`w-7 h-7 rounded-full border flex items-center justify-center
                            text-xs font-black flex-shrink-0 ${POSITION_STYLES[i] ?? POSITION_STYLES[2]}`}
              >
                {i + 1}
              </div>

              {/* Avatar inicial */}
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center
                              text-brand-600 text-sm font-bold flex-shrink-0">
                {client.name.charAt(0).toUpperCase()}
              </div>

              {/* Info del cliente */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-surface-800 truncate">{client.name}</p>
                <p className="text-xs text-surface-400 truncate">
                  {client.email ?? "Sin email"} · {client.totalPurchases} compras
                </p>
              </div>

              {/* Monto */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-brand-600">
                  {formatCurrency(client.totalSpent)}
                </p>
                <p className="text-xs text-surface-400">
                  Última: {formatDate(client.lastPurchaseDate)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
