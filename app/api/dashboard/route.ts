// ============================================================
// DataNest - API: Datos del dashboard
// GET /api/dashboard
// Retorna: KPIs, ventas mensuales, top clientes, clientes inactivos
// ============================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import type { DashboardData } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // --- Ejecutar todas las queries en paralelo para mejor rendimiento ---
    const [
      currentMonthResult,
      previousMonthResult,
      monthlySalesResult,
      topClientsResult,
      inactiveClientsResult,
      totalClientsResult,
    ] = await Promise.all([
      // KPI: ventas del mes actual
      query<{ total: string; transactions: string; avg_ticket: string }>(
        `SELECT
           COALESCE(SUM(amount), 0)::text AS total,
           COUNT(*)::text AS transactions,
           COALESCE(AVG(amount), 0)::text AS avg_ticket
         FROM sales
         WHERE user_id = $1
           AND status = 'completed'
           AND DATE_TRUNC('month', sale_date) = DATE_TRUNC('month', NOW())`,
        [userId]
      ),
      // KPI: ventas del mes anterior (para calcular tendencia)
      query<{ total: string }>(
        `SELECT COALESCE(SUM(amount), 0)::text AS total
         FROM sales
         WHERE user_id = $1
           AND status = 'completed'
           AND DATE_TRUNC('month', sale_date) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')`,
        [userId]
      ),
      // Ventas mensuales: últimos 12 meses
      query<{ month: string; total: string; transactions: string }>(
        `SELECT
           TO_CHAR(DATE_TRUNC('month', sale_date), 'Mon YYYY') AS month,
           SUM(amount)::text AS total,
           COUNT(*)::text AS transactions
         FROM sales
         WHERE user_id = $1
           AND status = 'completed'
           AND sale_date >= NOW() - INTERVAL '12 months'
         GROUP BY DATE_TRUNC('month', sale_date)
         ORDER BY DATE_TRUNC('month', sale_date) ASC`,
        [userId]
      ),
      // Top 5 clientes por monto total
      query<{
        id: string;
        name: string;
        email: string | null;
        total_spent: string;
        total_purchases: string;
        last_purchase_date: string;
      }>(
        `SELECT
           c.id,
           c.name,
           c.email,
           SUM(s.amount)::text AS total_spent,
           COUNT(s.id)::text AS total_purchases,
           MAX(s.sale_date)::text AS last_purchase_date
         FROM clients c
         JOIN sales s ON s.client_id = c.id
         WHERE c.user_id = $1 AND s.status = 'completed'
         GROUP BY c.id, c.name, c.email
         ORDER BY SUM(s.amount) DESC
         LIMIT 5`,
        [userId]
      ),
      // Clientes inactivos: no compraron en los últimos 30 días
      query<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        last_purchase_date: string;
        days_since: string;
      }>(
        `SELECT
           c.id,
           c.name,
           c.email,
           c.phone,
           MAX(s.sale_date)::text AS last_purchase_date,
           EXTRACT(DAY FROM NOW() - MAX(s.sale_date))::text AS days_since
         FROM clients c
         JOIN sales s ON s.client_id = c.id
         WHERE c.user_id = $1 AND s.status = 'completed'
         GROUP BY c.id, c.name, c.email, c.phone
         HAVING MAX(s.sale_date) < NOW() - INTERVAL '30 days'
         ORDER BY MAX(s.sale_date) ASC
         LIMIT 10`,
        [userId]
      ),
      // Total de clientes
      query<{ total: string; active: string }>(
        `SELECT
           COUNT(DISTINCT c.id)::text AS total,
           COUNT(DISTINCT s.client_id)::text AS active
         FROM clients c
         LEFT JOIN sales s ON s.client_id = c.id
           AND s.sale_date >= NOW() - INTERVAL '90 days'
           AND s.status = 'completed'
         WHERE c.user_id = $1`,
        [userId]
      ),
    ]);

    const dashboardData: DashboardData = {
      kpis: {
        currentMonthSales:  parseFloat(currentMonthResult.rows[0]?.total || "0"),
        previousMonthSales: parseFloat(previousMonthResult.rows[0]?.total || "0"),
        avgTicket:          parseFloat(currentMonthResult.rows[0]?.avg_ticket || "0"),
        totalClients:       parseInt(totalClientsResult.rows[0]?.total || "0"),
        activeClients:      parseInt(totalClientsResult.rows[0]?.active || "0"),
      },
      monthlySales: monthlySalesResult.rows.map((r) => ({
        month:        r.month,
        total:        parseFloat(r.total),
        transactions: parseInt(r.transactions),
      })),
      topClients: topClientsResult.rows.map((r) => ({
        id:              r.id,
        name:            r.name,
        email:           r.email,
        totalSpent:      parseFloat(r.total_spent),
        totalPurchases:  parseInt(r.total_purchases),
        lastPurchaseDate: r.last_purchase_date,
      })),
      inactiveClients: inactiveClientsResult.rows.map((r) => ({
        id:              r.id,
        name:            r.name,
        email:           r.email,
        phone:           r.phone,
        lastPurchaseDate: r.last_purchase_date,
        daysSince:       parseInt(r.days_since),
      })),
    };

    return NextResponse.json(dashboardData);
  } catch (err) {
    console.error("[Dashboard API] Error:", err);
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 });
  }
}
