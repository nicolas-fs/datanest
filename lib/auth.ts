/* ============================================================
   DataNest — Configuración de NextAuth
   ============================================================ */

import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// El adaptador de PostgreSQL se desactiva temporalmente hasta que
// se configuren las credenciales de Google OAuth.
// import { PostgresAdapter } from "@auth/pg-adapter";
// import { pool } from "./db";

export const authOptions: NextAuthOptions = {
  // adapter: PostgresAdapter(pool),  // ← Desactivado hasta nuevo aviso

  providers: [
    // --- Google OAuth ---
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // --- Credenciales locales (desarrollo / demo) ---
    CredentialsProvider({
      name: "credenciales",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        // Usuario de prueba para desarrollo
        if (
          credentials?.email === "admin@datanest.com" &&
          credentials?.password === "admin123"
        ) {
          return { id: "1", name: "Admin", email: "admin@datanest.com" };
        }
        return null;
      },
    }),
  ],

  // Sesiones basadas en JWT (no requieren base de datos)
  session: { strategy: "jwt" },

  // Secreto para firmar los tokens
  secret: process.env.NEXTAUTH_SECRET,
};

// NextAuth requiere exportar las funciones HTTP para el App Router
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };