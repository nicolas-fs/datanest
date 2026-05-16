// ============================================================
// DataNest - Página 404
// ============================================================

import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <div className="text-center max-w-md animate-in-1">
        <p className="text-8xl font-black text-surface-200 mb-4 select-none">404</p>
        <h1 className="text-2xl font-bold text-surface-900 mb-2">
          Página no encontrada
        </h1>
        <p className="text-surface-500 text-sm mb-8">
          La página que buscás no existe o fue movida.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary">
            <Home className="w-4 h-4" />
            Volver al inicio
          </Link>
          <Link href="/connect" className="btn-secondary">
            <Search className="w-4 h-4" />
            Conectar datos
          </Link>
        </div>
      </div>
    </div>
  );
}
