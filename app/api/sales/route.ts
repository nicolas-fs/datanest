// ============================================================
// DataNest - API: Ventas
// GET /api/sales?from=YYYY-MM-DD&to=YYYY-MM-DD&clientId=&page=1
// Retorna ventas filtradas y paginadas
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from     = searchParams.get("from")     ?? "";
  const to       = searchParams.get("to")       ?? "";
  const clientId = searchParams.get("clientId") ?? "";
  const status   = searchParams.get("status")   ?? "";
  const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit    = Math.min(100, parseInt(searchParams.get("limit") ?? "20"));
  const offset   = (page - 1) * limit;

  try {
    const result = await query<{
      id:          string;
      client_name: string | null;
      client_id:   string | null;
      amount:      string;
      currency:    string;
      status:      string;
      description: string | null;
      sale_date:   string;
      source_name: string | null;
    }>(
      `SELECT
         s.id,
         c.name AS client_name,
         s.client_id,
         s.amount::text,
         s.currency,
         s.status,
         s.description,
         s.sale_date::text,
         ds.name AS source_name
       FROM sales s
       LEFT JOIN clients c       ON c.id = s.client_id
       LEFT JOIN data_sources ds ON ds.id = s.source_id
       WHERE s.user_id = $1
         AND ($2 = '' OR s.sale_date::date >= $2::date)
         AND ($3 = '' OR s.sale_date::date <= $3::date)
         AND ($4 = '' OR s.client_id::text = $4)
         AND ($5 = '' OR s.status = $5)
       ORDER BY s.sale_date DESC
       LIMIT $6 OFFSET $7`,
      [session.user.id, from, to, clientId, status, limit, offset]
    );

    const countResult = await query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM sales
       WHERE user_id = $1
         AND ($2 = '' OR sale_date::date >= $2::date)
         AND ($3 = '' OR sale_date::date <= $3::date)
         AND ($4 = '' OR client_id::text = $4)
         AND ($5 = '' OR status = $5)`,
      [session.user.id, from, to, clientId, status]
    );

    return NextResponse.json({
      sales: result.rows.map((r) => ({
        id:          r.id,
        clientName:  r.client_name,
        clientId:    r.client_id,
        amount:      parseFloat(r.amount),
        currency:    r.currency,
        status:      r.status,
        description: r.description,
        saleDate:    r.sale_date,
        sourceName:  r.source_name,
      })),
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0]?.total ?? "0"),
        pages: Math.ceil(parseInt(countResult.rows[0]?.total ?? "0") / limit),
      },
    });
  } catch (err) {
    console.error("[Sales API] Error:", err);
    return NextResponse.json({ error: "Error al obtener ventas" }, { status: 500 });
  }
}
