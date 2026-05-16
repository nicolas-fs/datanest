// ============================================================
// DataNest - API: Eliminar una fuente de datos
// DELETE /api/sources/[id]
// Elimina la fuente y todos los datos asociados (cascade)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

interface RouteParams {
  params: { id: string };
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = params;

  try {
    // Verificar que la fuente pertenece al usuario antes de eliminar
    const existing = await query(
      "SELECT id FROM data_sources WHERE id = $1 AND user_id = $2",
      [id, session.user.id]
    );

    if (!existing.rowCount || existing.rowCount === 0) {
      return NextResponse.json({ error: "Fuente no encontrada" }, { status: 404 });
    }

    // Eliminar (las ventas y mensajes se eliminan en cascade por FK)
    await query("DELETE FROM data_sources WHERE id = $1", [id]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Source Delete] Error:", err);
    return NextResponse.json({ error: "Error al eliminar la fuente" }, { status: 500 });
  }
}

// --- GET: Detalle de una fuente específica ---
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await query<{
      id:        string;
      type:      string;
      name:      string;
      status:    string;
      last_sync: string | null;
      sales_count: string;
    }>(
      `SELECT
         ds.id, ds.type, ds.name, ds.status, ds.last_sync,
         COUNT(s.id)::text AS sales_count
       FROM data_sources ds
       LEFT JOIN sales s ON s.source_id = ds.id
       WHERE ds.id = $1 AND ds.user_id = $2
       GROUP BY ds.id`,
      [params.id, session.user.id]
    );

    if (!result.rowCount || result.rowCount === 0) {
      return NextResponse.json({ error: "Fuente no encontrada" }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
      source: {
        id:         row.id,
        type:       row.type,
        name:       row.name,
        status:     row.status,
        lastSync:   row.last_sync,
        salesCount: parseInt(row.sales_count),
      },
    });
  } catch (err) {
    console.error("[Source GET] Error:", err);
    return NextResponse.json({ error: "Error al obtener la fuente" }, { status: 500 });
  }
}
