// ============================================================
// DataNest - Error boundary del dashboard
// Captura errores en server components y muestra un fallback amigable
// ============================================================

"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Loguear el error para debugging (en producción usar Sentry, etc.)
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center max-w-sm mx-auto">
      <div className="w-16 h-16 bg-danger-400/10 rounded-2xl flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-danger-500" />
      </div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">
        Algo salió mal
      </h2>
      <p className="text-sm text-surface-500 mb-6">
        Ocurrió un error inesperado al cargar el dashboard. Podés intentar recargar o volver al inicio.
      </p>
      {error.digest && (
        <p className="text-xs font-mono text-surface-400 mb-4 bg-surface-100 px-3 py-1 rounded-lg">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary">
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
        <Link href="/" className="btn-secondary">
          <Home className="w-4 h-4" />
          Inicio
        </Link>
      </div>
    </div>
  );
}
