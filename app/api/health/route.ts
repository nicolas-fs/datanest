// ============================================================
// DataNest - API: Health check
// GET /api/health
// Verificar que la app y la BD están funcionando
// Útil para monitoring, Vercel health checks y Docker
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const start = Date.now();

  try {
    // Verificar conexión a la BD con una query mínima
    await query("SELECT 1");

    return NextResponse.json({
      status:    "ok",
      version:   "1.0.0",
      db:        "connected",
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        status:    "error",
        db:        "disconnected",
        latencyMs: Date.now() - start,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
