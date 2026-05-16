// ============================================================
// DataNest - Middleware de Next.js
// Protege las rutas del dashboard y redirige al login si no hay sesión
// ============================================================

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Redirigir la raíz al dashboard o al login según el estado de sesión
    return NextResponse.next();
  },
  {
    callbacks: {
      // Autorizar si hay token JWT válido
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Aplicar middleware a estas rutas (excluye /login, /api/auth y assets)
export const config = {
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
