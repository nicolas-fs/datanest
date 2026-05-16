// ============================================================
// DataNest — Middleware de Next.js
// Protege las rutas del dashboard y redirige al login si no hay sesión.
// Cuando el usuario ya está autenticado, lo manda al dashboard.
// ============================================================

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Si el usuario está autenticado e intenta entrar a la raíz,
    // lo llevamos directo al dashboard para evitar loops de redirección.
    if (pathname === "/" && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Para cualquier otra ruta protegida, simplemente la dejamos pasar.
    return NextResponse.next();
  },
  {
    callbacks: {
      // Solo permite el acceso si existe un token JWT válido.
      authorized: ({ token }) => !!token,
    },
    pages: {
      // NextAuth redirigirá automáticamente a esta página si no hay sesión.
      signIn: "/login",
    },
  }
);

// El middleware se aplica a todas las rutas excepto las de login,
// las de la API de autenticación y los recursos estáticos.
export const config = {
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};