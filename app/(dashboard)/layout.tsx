// ============================================================
// DataNest - Layout del dashboard con sidebar + informe
// Protegido: requiere sesión activa.
// Monta el FloatingInformeWidget y el InformeDrawer en todas
// las rutas del dashboard.
// ============================================================

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar }                from "@/components/layout/Sidebar";
import { FloatingInformeWidget }  from "@/components/informe/FloatingInformeWidget";
import { InformeDrawer }          from "@/components/informe/InformeDrawer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      {/* Sidebar de navegación */}
      <Sidebar user={session.user} />

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Carrito de Informe PDF — disponible en toda la app */}
      <FloatingInformeWidget />
      <InformeDrawer />
    </div>
  );
}
