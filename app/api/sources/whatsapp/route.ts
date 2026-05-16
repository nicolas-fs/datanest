// ============================================================
// DataNest - API: Importar chat exportado de WhatsApp
// POST /api/sources/whatsapp
// Body: { rawChat: string }
// Parsea el formato de exportación de WhatsApp y guarda los mensajes
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { parseWhatsAppChat } from "@/lib/utils";
import { z } from "zod";

const bodySchema = z.object({
  rawChat: z.string().min(10, "El chat exportado parece estar vacío"),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const { rawChat } = bodySchema.parse(body);

    // Parsear mensajes del formato de exportación de WhatsApp
    const messages = parseWhatsAppChat(rawChat);

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron mensajes en el formato esperado. Verificá que copiaste el chat completo." },
        { status: 400 }
      );
    }

    // Crear fuente de datos
    const sourceResult = await query<{ id: string }>(
      `INSERT INTO data_sources (user_id, type, name, status, last_sync)
       VALUES ($1, 'whatsapp', $2, 'active', NOW())
       RETURNING id`,
      [userId, `WhatsApp – ${new Date().toLocaleDateString("es-AR")}`]
    );
    const sourceId = sourceResult.rows[0].id;

    // Insertar mensajes
    let imported = 0;
    for (const msg of messages) {
      await query(
        `INSERT INTO whatsapp_messages (user_id, source_id, sender, content, sent_at, is_outbound)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [userId, sourceId, msg.sender, msg.content, msg.sentAt, false]
      );
      imported++;
    }

    // Extraer participantes únicos (posibles clientes)
    const senders = [...new Set(messages.map((m) => m.sender))];

    return NextResponse.json({
      sourceId,
      messagesImported: imported,
      participants: senders.length,
      message: `Se importaron ${imported} mensajes de ${senders.length} contacto(s)`,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[WhatsApp Import] Error:", err);
    return NextResponse.json({ error: "Error al procesar el chat" }, { status: 500 });
  }
}
