// ============================================================
// DataNest - Layout del dashboard con sidebar
// Protegido: requiere sesión activa
// ============================================================

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar autenticación en el servidor
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      {/* Sidebar de navegación */}
      <Sidebar user={session.user} />

      {/* Área de contenido principal */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
