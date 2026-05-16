// ============================================================
// DataNest - Página raíz
// Redirige automáticamente al dashboard (protegido por middleware)
// ============================================================

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  // El middleware redirige aquí desde "/" — redirigimos al dashboard
  redirect("/");
}
