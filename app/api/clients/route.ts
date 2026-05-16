// ============================================================
// DataNest - API: Clientes
// GET /api/clients?q=búsqueda&page=1&limit=20
// Retorna la lista paginada de clientes del usuario autenticado
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
  const search = searchParams.get("q")?.trim() ?? "";
  const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit  = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
  const offset = (page - 1) * limit;

  try {
    // Query con búsqueda opcional por nombre o email
    const result = await query<{
      id:                string;
      name:              string;
      email:             string | null;
      phone:             string | null;
      total_spent:       string;
      total_purchases:   string;
      last_purchase_date: string | null;
    }>(
      `SELECT
         c.id,
         c.name,
         c.email,
         c.phone,
         COALESCE(SUM(s.amount), 0)::text         AS total_spent,
         COUNT(s.id)::text                         AS total_purchases,
         MAX(s.sale_date)::text                    AS last_purchase_date
       FROM clients c
       LEFT JOIN sales s ON s.client_id = c.id AND s.status = 'completed'
       WHERE c.user_id = $1
         AND ($2 = '' OR c.name ILIKE '%' || $2 || '%' OR c.email ILIKE '%' || $2 || '%')
       GROUP BY c.id, c.name, c.email, c.phone
       ORDER BY SUM(s.amount) DESC NULLS LAST, c.name ASC
       LIMIT $3 OFFSET $4`,
      [session.user.id, search, limit, offset]
    );

    // Total para paginación
    const countResult = await query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM clients
       WHERE user_id = $1
         AND ($2 = '' OR name ILIKE '%' || $2 || '%' OR email ILIKE '%' || $2 || '%')`,
      [session.user.id, search]
    );

    return NextResponse.json({
      clients: result.rows.map((r) => ({
        id:              r.id,
        name:            r.name,
        email:           r.email,
        phone:           r.phone,
        totalSpent:      parseFloat(r.total_spent),
        totalPurchases:  parseInt(r.total_purchases),
        lastPurchaseDate: r.last_purchase_date,
      })),
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0]?.total ?? "0"),
        pages: Math.ceil(parseInt(countResult.rows[0]?.total ?? "0") / limit),
      },
    });
  } catch (err) {
    console.error("[Clients API] Error:", err);
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 });
  }
}
