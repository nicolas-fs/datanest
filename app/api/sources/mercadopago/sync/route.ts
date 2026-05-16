// ============================================================
// DataNest - API: Sincronización manual de Mercado Pago
// POST /api/sources/mercadopago/sync
// Re-importa los últimos pagos usando el token guardado
// ============================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, withTransaction } from "@/lib/db";
import type { MercadoPagoPayment } from "@/types";

const MP_BASE = "https://api.mercadopago.com";

async function fetchLatestPayments(
  accessToken: string,
  since?: string
): Promise<MercadoPagoPayment[]> {
  const params = new URLSearchParams({
    access_token: accessToken,
    status:       "approved",
    limit:        "100",
    sort:         "date_created",
    criteria:     "desc",
  });

  // Filtrar por fecha si se conoce la última sincronización
  if (since) params.set("begin_date", since);

  const res = await fetch(`${MP_BASE}/v1/payments/search?${params}`);
  if (!res.ok) throw new Error("Error al consultar Mercado Pago");

  const data = await res.json();
  return data.results ?? [];
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Obtener la fuente de MP del usuario con su token guardado
    const sourceResult = await query<{
      id:        string;
      config:    Record<string, string>;
      last_sync: string | null;
    }>(
      "SELECT id, config, last_sync FROM data_sources WHERE user_id = $1 AND type = 'mercadopago' LIMIT 1",
      [userId]
    );

    if (!sourceResult.rowCount || sourceResult.rowCount === 0) {
      return NextResponse.json(
        { error: "No hay una cuenta de Mercado Pago conectada" },
        { status: 404 }
      );
    }

    const source      = sourceResult.rows[0];
    const accessToken = (source.config as Record<string, string>).access_token;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Token de Mercado Pago inválido. Reconectá tu cuenta." },
        { status: 401 }
      );
    }

    // Sincronizar desde la última fecha conocida
    const payments = await fetchLatestPayments(
      accessToken,
      source.last_sync ?? undefined
    );

    let imported = 0;

    await withTransaction(async (client) => {
      for (const payment of payments) {
        const payerEmail = payment.payer?.email;
        const payerName  = [payment.payer?.first_name, payment.payer?.last_name]
          .filter(Boolean).join(" ") || "Cliente MP";

        let clientId: string | null = null;
        if (payerName) {
          const clientResult = await client.query<{ id: string }>(
            `INSERT INTO clients (user_id, source_id, external_id, name, email)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id, external_id, source_id) DO UPDATE
               SET name  = EXCLUDED.name,
                   email = COALESCE(EXCLUDED.email, clients.email)
             RETURNING id`,
            [userId, source.id, String(payment.payer?.id ?? ""), payerName, payerEmail ?? null]
          );
          clientId = clientResult.rows[0]?.id ?? null;
        }

        const result = await client.query(
          `INSERT INTO sales
             (user_id, source_id, client_id, external_id, amount, currency, status, description, sale_date, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (user_id, external_id, source_id) DO NOTHING`,
          [
            userId,
            source.id,
            clientId,
            String(payment.id),
            payment.transaction_amount,
            payment.currency_id ?? "ARS",
            "completed",
            payment.description ?? null,
            payment.date_approved ?? payment.date_created,
            JSON.stringify({ mp_payment_id: payment.id }),
          ]
        );

        if ((result.rowCount ?? 0) > 0) imported++;
      }
    });

    // Actualizar fecha de última sincronización
    await query(
      "UPDATE data_sources SET last_sync = NOW(), status = 'active' WHERE id = $1",
      [source.id]
    );

    return NextResponse.json({
      synced:   imported,
      total:    payments.length,
      message: `${imported} nuevos pagos importados`,
    });
  } catch (err) {
    console.error("[MP Sync] Error:", err);
    return NextResponse.json({ error: "Error al sincronizar con Mercado Pago" }, { status: 500 });
  }
}
