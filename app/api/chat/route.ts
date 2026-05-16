// ============================================================
// DataNest - API: Chatbot con IA (GPT-4o-mini + RAG básico)
// POST /api/chat
// Body: { messages: ChatMessage[], conversationId?: string }
//
// Estrategia RAG (Retrieval-Augmented Generation):
//   1. Consultar BD para obtener datos actuales del negocio del usuario
//   2. Construir un contexto en texto plano con esos datos
//   3. Inyectarlo en el system prompt para que GPT-4o-mini lo use
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import OpenAI from "openai";
import { buildDataContext } from "@/lib/utils";
import { z } from "zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Esquema de validación
const chatSchema = z.object({
  messages: z.array(
    z.object({
      role:    z.enum(["user", "assistant"]),
      content: z.string().max(2000),
    })
  ).min(1).max(20),
});

// --- Obtener contexto de datos del usuario para RAG ---
async function getUserDataContext(userId: string): Promise<string> {
  const [monthlySales, topClients, inactiveClients] = await Promise.all([
    // Ventas mensuales (últimos 12 meses)
    query<{ month: string; total: string; transactions: string }>(
      `SELECT
         TO_CHAR(DATE_TRUNC('month', sale_date), 'Month YYYY') AS month,
         SUM(amount)::text AS total,
         COUNT(*)::text AS transactions
       FROM sales
       WHERE user_id = $1 AND status = 'completed'
         AND sale_date >= NOW() - INTERVAL '12 months'
       GROUP BY DATE_TRUNC('month', sale_date)
       ORDER BY DATE_TRUNC('month', sale_date) ASC`,
      [userId]
    ),
    // Top clientes
    query<{ name: string; total: string; purchases: string }>(
      `SELECT
         c.name,
         SUM(s.amount)::text AS total,
         COUNT(s.id)::text AS purchases
       FROM clients c
       JOIN sales s ON s.client_id = c.id
       WHERE c.user_id = $1 AND s.status = 'completed'
       GROUP BY c.id, c.name
       ORDER BY SUM(s.amount) DESC
       LIMIT 10`,
      [userId]
    ),
    // Clientes inactivos
    query<{ name: string; last_purchase: string }>(
      `SELECT
         c.name,
         MAX(s.sale_date)::date::text AS last_purchase
       FROM clients c
       JOIN sales s ON s.client_id = c.id
       WHERE c.user_id = $1 AND s.status = 'completed'
       GROUP BY c.id, c.name
       HAVING MAX(s.sale_date) < NOW() - INTERVAL '30 days'
       LIMIT 5`,
      [userId]
    ),
  ]);

  return buildDataContext({
    monthlySales: monthlySales.rows.map((r) => ({
      month:        r.month.trim(),
      total:        parseFloat(r.total),
      transactions: parseInt(r.transactions),
    })),
    topClients: topClients.rows.map((r) => ({
      name:      r.name,
      total:     parseFloat(r.total),
      purchases: parseInt(r.purchases),
    })),
    inactiveClients: inactiveClients.rows.map((r) => ({
      name:         r.name,
      lastPurchase: r.last_purchase,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const { messages } = chatSchema.parse(body);

    // --- RAG: Obtener contexto actualizado de la BD ---
    const dataContext = await getUserDataContext(userId);

    // --- System prompt con contexto de datos ---
    const systemPrompt = `Sos DataNest, el asistente inteligente de gestión de negocios para pymes argentinas.
Tu objetivo es ayudar a los dueños de pequeñas empresas a entender sus datos de ventas y clientes.

INSTRUCCIONES:
- Respondé siempre en español, de forma clara y amigable.
- Cuando te pregunten sobre ventas, clientes o métricas, usá EXCLUSIVAMENTE los datos del contexto que se proporciona abajo.
- Si no hay datos disponibles, indicalo claramente y sugerí conectar una fuente de datos.
- Podés hacer cálculos simples con los datos (totales, promedios, comparaciones).
- Respondé de forma concisa pero completa. Evitá respuestas muy largas.
- No inventes datos ni hagas suposiciones sin base en el contexto.
- Para mencionar montos, usá el formato argentino: $1.250.000.

DATOS ACTUALES DEL NEGOCIO:
${dataContext || "No hay datos cargados aún. El usuario no ha conectado ninguna fuente de datos."}

Fecha actual: ${new Date().toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;

    // --- Llamar a la API de OpenAI ---
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 600,
      temperature: 0.3,  // Baja temperatura para respuestas más precisas con datos
    });

    const reply = completion.choices[0]?.message?.content;
    if (!reply) throw new Error("La IA no devolvió una respuesta");

    return NextResponse.json({
      message: reply,
      usage:   completion.usage,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[Chat] Error:", err);
    return NextResponse.json(
      { error: "Error al procesar tu consulta. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
