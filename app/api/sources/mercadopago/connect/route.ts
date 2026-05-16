// ============================================================
// DataNest - API: Iniciar flujo OAuth de Mercado Pago
// GET /api/sources/mercadopago/connect
// Genera la URL de autorización y redirige al usuario a MP
// ============================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(
      new URL("/login", process.env.NEXTAUTH_URL!)
    );
  }

  // Generar state aleatorio para prevenir ataques CSRF
  const state = crypto.randomBytes(16).toString("hex");

  // Construir URL de autorización de Mercado Pago
  const params = new URLSearchParams({
    response_type: "code",
    client_id:     process.env.MERCADOPAGO_CLIENT_ID!,
    redirect_uri:  process.env.MERCADOPAGO_REDIRECT_URI!,
    scope:         "read offline_access",
    state,
  });

  const authUrl = `https://auth.mercadopago.com.ar/authorization?${params}`;

  // Podría guardarse el state en Redis/BD para validarlo en callback
  // Por simplicidad del MVP lo omitimos (aceptable para demo)

  return NextResponse.redirect(authUrl);
}
