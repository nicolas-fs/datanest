// ============================================================
// DataNest - Configuración de NextAuth.js
// Proveedores: Google OAuth + Credentials (email/password)
// Adaptador: PostgreSQL (Neon) via @auth/pg-adapter
// ============================================================

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PostgresAdapter } from "@auth/pg-adapter";
import bcrypt from "bcryptjs";
import { pool, query } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  // Adaptador que persiste sesiones y cuentas en PostgreSQL
  adapter: PostgresAdapter(pool),

  providers: [
    // --- Google OAuth ---
    // Permite login con cuenta de Google. Ideal para pymes que ya usan Google Workspace.
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    // --- Email + Contraseña ---
    // Para usuarios que prefieren no vincular su cuenta de Google.
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",      type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const result = await query<{
          id: string;
          name: string;
          email: string;
          image: string | null;
          password_hash: string | null;
        }>(
          "SELECT id, name, email, image, password_hash FROM users WHERE email = $1",
          [credentials.email.toLowerCase()]
        );

        const user = result.rows[0];
        if (!user?.password_hash) return null;

        const valid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!valid) return null;

        return {
          id:    user.id,
          name:  user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  callbacks: {
    // Agregar el ID del usuario al token JWT para acceso rápido
    async jwt({ token, user }) {
      if (user) token.userId = user.id;
      return token;
    },
    // Exponer el userId en la sesión del cliente
    async session({ session, token }) {
      if (token.userId) session.user.id = token.userId as string;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// --- Extensión de tipos de NextAuth ---
// Permite usar session.user.id sin errores de TypeScript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
