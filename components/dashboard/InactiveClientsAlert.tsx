// ============================================================
// DataNest - Componente InactiveClientsAlert
// Alerta de clientes que no compraron en los últimos 30 días
// ============================================================

import { AlertTriangle, Phone, Mail, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface InactiveClient {
  id:              string;
  name:            string;
  email:           string | null;
  phone:           string | null;
  lastPurchaseDate: string;
  daysSince:       number;
}

interface InactiveClientsAlertProps {
  clients:  InactiveClient[];
  loading?: boolean;
}

// Colorea el badge según cuántos días llevan inactivos
function urgencyBadge(days: number) {
  if (days >= 90) return "bg-danger-500 text-white";
  if (days >= 60) return "bg-danger-400/20 text-danger-600";
  return "bg-orange-50 text-orange-600 border border-orange-200";
}

export function InactiveClientsAlert({ clients, loading = false }: InactiveClientsAlertProps) {
  if (loading) {
    return (
      <div className="card">
        <div className="skeleton h-5 w-44 rounded-lg mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-danger-500" />
        <h2 className="text-base font-semibold text-surface-800">Clientes inactivos</h2>
        {clients.length > 0 && (
          <span className="badge badge-red ml-auto">{clients.length}</span>
        )}
      </div>

      {/* Sin alertas */}
      {clients.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="w-12 h-12 bg-accent-400/10 rounded-2xl flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6 text-accent-500" />
          </div>
          <p className="text-sm font-semibold text-surface-700">¡Todos activos!</p>
          <p className="text-xs text-surface-400 mt-0.5">
            Ningún cliente lleva más de 30 días sin comprar.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.slice(0, 6).map((client) => (
            <div
              key={client.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-danger-400/5
                         border border-danger-400/10 hover:bg-danger-400/8 transition-colors"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-danger-400/10 flex items-center
                              justify-center text-danger-500 text-sm font-bold flex-shrink-0 mt-0.5">
                {client.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-surface-800 truncate">{client.name}</p>
                <p className="text-xs text-surface-400 mt-0.5">
                  Última compra: {formatDate(client.lastPurchaseDate)}
                </p>

                {/* Contacto */}
                <div className="flex items-center gap-3 mt-1.5">
                  {client.email && (
                    <a
                      href={`mailto:${client.email}`}
                      className="flex items-center gap-1 text-xs text-brand-500 hover:underline"
                    >
                      <Mail className="w-3 h-3" />
                      Email
                    </a>
                  )}
                  {client.phone && (
                    <a
                      href={`tel:${client.phone}`}
                      className="flex items-center gap-1 text-xs text-brand-500 hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      Llamar
                    </a>
                  )}
                </div>
              </div>

              {/* Badge de días */}
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${urgencyBadge(client.daysSince)}`}
              >
                {client.daysSince}d
              </span>
            </div>
          ))}

          {clients.length > 6 && (
            <p className="text-xs text-surface-400 text-center pt-1">
              +{clients.length - 6} clientes más sin compras recientes
            </p>
          )}
        </div>
      )}
    </div>
  );
}
