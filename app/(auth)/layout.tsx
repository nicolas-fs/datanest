// ============================================================
// DataNest - Layout para páginas de autenticación (/login)
// Si el usuario ya tiene sesión, lo redirige al dashboard
// ============================================================

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Si ya está autenticado, no mostrar el login
  if (session) redirect("/");

  return <>{children}</>;
}
