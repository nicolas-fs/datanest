// ============================================================
// DataNest - API: Subir y procesar Excel / CSV
// POST /api/sources/upload
// Acepta: multipart/form-data con campo "file"
// Importa ventas a la base de datos del usuario autenticado
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, withTransaction } from "@/lib/db";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import type { SaleRow } from "@/types";

// Límite de tamaño: 10 MB
export const config = { api: { bodyParser: false } };

// --- Función: Normalizar una fila de datos ---
function normalizeRow(row: Record<string, unknown>): SaleRow | null {
  // Buscar las columnas requeridas con variantes de nombre comunes
  const clientName =
    (row["client_name"] ?? row["cliente"] ?? row["nombre"] ?? row["name"]) as string;
  const amount =
    (row["amount"] ?? row["monto"] ?? row["total"] ?? row["precio"]) as string | number;
  const date =
    (row["date"] ?? row["fecha"] ?? row["sale_date"]) as string;

  if (!clientName || !amount || !date) return null;

  return {
    client_name:   String(clientName).trim(),
    client_email:  String(row["client_email"] ?? row["email"] ?? "").trim() || undefined,
    amount:        parseFloat(String(amount).replace(/[^0-9.,]/g, "").replace(",", ".")),
    date:          String(date).trim(),
    description:   String(row["description"] ?? row["descripcion"] ?? "").trim() || undefined,
    status:        String(row["status"] ?? "completed").trim(),
  };
}

// --- Función: Parsear fecha en múltiples formatos ---
function parseDate(raw: string): Date | null {
  // Intentar formatos comunes en Argentina: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY
  const formats = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,  // DD/MM/YYYY
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,    // YYYY-MM-DD
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,    // DD-MM-YYYY
  ];

  for (const format of formats) {
    const match = raw.match(format);
    if (match) {
      if (format === formats[0] || format === formats[2]) {
        const [, d, m, y] = match;
        return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      } else {
        const [, y, m, d] = match;
        return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      }
    }
  }

  // Último intento con Date.parse nativo
  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    // Validar tamaño
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo supera el límite de 10 MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let rows: Record<string, unknown>[] = [];
    const errors: string[] = [];

    // --- Parsear según tipo de archivo ---
    if (file.name.endsWith(".csv")) {
      const text = buffer.toString("utf-8");
      const result = Papa.parse<Record<string, unknown>>(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      });
      rows = result.data;
      if (result.errors.length > 0) {
        errors.push(...result.errors.map((e) => `Fila ${e.row}: ${e.message}`));
      }
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
    } else {
      return NextResponse.json({ error: "Formato de archivo no soportado" }, { status: 400 });
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: "El archivo está vacío o no tiene datos válidos" }, { status: 400 });
    }

    // --- Crear registro de fuente de datos ---
    const sourceResult = await query<{ id: string }>(
      `INSERT INTO data_sources (user_id, type, name, status, last_sync)
       VALUES ($1, $2, $3, 'active', NOW())
       RETURNING id`,
      [userId, file.name.endsWith(".csv") ? "csv" : "excel", file.name]
    );
    const sourceId = sourceResult.rows[0].id;

    // --- Importar ventas en una transacción ---
    let rowsImported = 0;

    await withTransaction(async (client) => {
      for (let i = 0; i < rows.length; i++) {
        const raw = rows[i];
        const row = normalizeRow(raw);

        if (!row) {
          errors.push(`Fila ${i + 2}: faltan columnas requeridas (client_name, amount, date)`);
          continue;
        }

        if (isNaN(row.amount as number) || (row.amount as number) <= 0) {
          errors.push(`Fila ${i + 2}: monto inválido "${row.amount}"`);
          continue;
        }

        const saleDate = parseDate(String(row.date));
        if (!saleDate) {
          errors.push(`Fila ${i + 2}: fecha inválida "${row.date}"`);
          continue;
        }

        // Upsert del cliente
        const clientResult = await client.query<{ id: string }>(
          `INSERT INTO clients (user_id, source_id, name, email)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id, external_id, source_id) DO UPDATE
             SET name  = EXCLUDED.name,
                 email = COALESCE(EXCLUDED.email, clients.email)
           RETURNING id`,
          [userId, sourceId, row.client_name, row.client_email || null]
        );

        // Insertar venta
        await client.query(
          `INSERT INTO sales (user_id, source_id, client_id, amount, status, description, sale_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT DO NOTHING`,
          [
            userId,
            sourceId,
            clientResult.rows[0]?.id || null,
            row.amount,
            row.status || "completed",
            row.description || null,
            saleDate,
          ]
        );

        rowsImported++;
      }
    });

    return NextResponse.json({
      sourceId,
      rowsImported,
      errors: errors.slice(0, 20), // Limitar errores a 20 para no saturar la respuesta
    });
  } catch (err) {
    console.error("[Upload] Error:", err);
    return NextResponse.json({ error: "Error al procesar el archivo" }, { status: 500 });
  }
}
