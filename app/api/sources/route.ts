// ============================================================
// DataNest - API: Listar fuentes de datos del usuario
// GET /api/sources
// ============================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await query(
      `SELECT id, type, name, status, last_sync, created_at
       FROM data_sources
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [session.user.id]
    );

    return NextResponse.json({ sources: result.rows });
  } catch (err) {
    console.error("[Sources] Error:", err);
    return NextResponse.json({ error: "Error al obtener fuentes" }, { status: 500 });
  }
}
