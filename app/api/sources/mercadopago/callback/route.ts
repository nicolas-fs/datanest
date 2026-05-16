// ============================================================
// DataNest - API: Mercado Pago OAuth
// GET /api/sources/mercadopago/callback
// Recibe el código de autorización de Mercado Pago, intercambia por tokens
// e importa el historial de pagos del usuario.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, withTransaction } from "@/lib/db";
import type { MercadoPagoPayment } from "@/types";

const MP_BASE = "https://api.mercadopago.com";
const MP_AUTH = "https://auth.mercadopago.com";

// --- Intercambiar código de autorización por access token ---
async function exchangeCode(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  user_id: number;
}> {
  const res = await fetch(`${MP_AUTH}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id:     process.env.MERCADOPAGO_CLIENT_ID,
      client_secret: process.env.MERCADOPAGO_CLIENT_SECRET,
      grant_type:    "authorization_code",
      code,
      redirect_uri:  process.env.MERCADOPAGO_REDIRECT_URI,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Error OAuth MP: ${err.message || res.statusText}`);
  }

  return res.json();
}

// --- Obtener pagos del usuario desde la API de MP ---
async function fetchPayments(accessToken: string): Promise<MercadoPagoPayment[]> {
  // Traer los últimos 100 pagos completados
  const params = new URLSearchParams({
    access_token: accessToken,
    status:       "approved",
    limit:        "100",
    sort:         "date_created",
    criteria:     "desc",
  });

  const res = await fetch(`${MP_BASE}/v1/payments/search?${params}`);
  if (!res.ok) throw new Error("Error al obtener pagos de Mercado Pago");

  const data = await res.json();
  return data.results || [];
}

// --- Handler del callback OAuth ---
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Si no está autenticado, redirigir al login
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const code  = searchParams.get("code");
  const error = searchParams.get("error");

  // Error en la autorización (usuario canceló, etc.)
  if (error || !code) {
    return NextResponse.redirect(
      new URL("/connect?error=mp_auth_cancelled", request.url)
    );
  }

  const userId = session.user.id;

  try {
    // 1. Intercambiar código por token
    const { access_token, refresh_token, user_id: mpUserId } = await exchangeCode(code);

    // 2. Crear/actualizar la fuente de datos en BD
    const sourceResult = await query<{ id: string }>(
      `INSERT INTO data_sources (user_id, type, name, status, config, last_sync)
       VALUES ($1, 'mercadopago', $2, 'active', $3, NOW())
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [
        userId,
        `Mercado Pago (${mpUserId})`,
        JSON.stringify({
          access_token,
          refresh_token,
          mp_user_id: mpUserId,
        }),
      ]
    );

    // Si ya existía la fuente (ON CONFLICT), buscarla
    let sourceId = sourceResult.rows[0]?.id;
    if (!sourceId) {
      const existing = await query<{ id: string }>(
        "SELECT id FROM data_sources WHERE user_id = $1 AND type = 'mercadopago'",
        [userId]
      );
      sourceId = existing.rows[0]?.id;
      // Actualizar token
      await query(
        "UPDATE data_sources SET config = $1, last_sync = NOW() WHERE id = $2",
        [JSON.stringify({ access_token, refresh_token, mp_user_id: mpUserId }), sourceId]
      );
    }

    // 3. Importar pagos
    const payments = await fetchPayments(access_token);

    await withTransaction(async (client) => {
      for (const payment of payments) {
        // Upsert del cliente por email
        const payerEmail = payment.payer?.email;
        const payerName  = [payment.payer?.first_name, payment.payer?.last_name]
          .filter(Boolean).join(" ") || "Cliente MP";

        let clientId: string | null = null;
        if (payerEmail || payerName) {
          const clientResult = await client.query<{ id: string }>(
            `INSERT INTO clients (user_id, source_id, external_id, name, email)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id, external_id, source_id) DO UPDATE
               SET name  = EXCLUDED.name,
                   email = COALESCE(EXCLUDED.email, clients.email)
             RETURNING id`,
            [userId, sourceId, String(payment.payer?.id || ""), payerName, payerEmail || null]
          );
          clientId = clientResult.rows[0]?.id || null;
        }

        // Upsert de la venta
        await client.query(
          `INSERT INTO sales
             (user_id, source_id, client_id, external_id, amount, currency, status, description, sale_date, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (user_id, external_id, source_id) DO NOTHING`,
          [
            userId,
            sourceId,
            clientId,
            String(payment.id),
            payment.transaction_amount,
            payment.currency_id || "ARS",
            payment.status === "approved" ? "completed" : payment.status,
            payment.description || null,
            payment.date_approved || payment.date_created,
            JSON.stringify({ mp_payment_id: payment.id }),
          ]
        );
      }
    });

    // 4. Redirigir al dashboard con mensaje de éxito
    return NextResponse.redirect(
      new URL(`/connect?success=mp&payments=${payments.length}`, request.url)
    );
  } catch (err) {
    console.error("[MP OAuth] Error:", err);
    return NextResponse.redirect(
      new URL("/connect?error=mp_import_failed", request.url)
    );
  }
}
