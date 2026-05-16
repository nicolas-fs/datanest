// ============================================================
// DataNest - Utilidades generales
// ============================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Merge de clases Tailwind ---
// Evita conflictos entre clases de Tailwind al combinarlas dinámicamente
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Formateo de moneda ---
// Por defecto usa ARS (Peso argentino), configurable por usuario
export function formatCurrency(
  amount: number,
  currency = "ARS",
  locale = "es-AR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// --- Formateo de números compactos ---
// Ej: 1500000 → "1,5M" | 250000 → "250K"
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
}

// --- Formateo de fechas ---
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  }).format(new Date(date));
}

// --- Variación porcentual entre dos valores ---
// Retorna el delta para mostrar tendencia en KPIs
export function percentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

// --- Truncar texto largo ---
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

// --- Parsear exportación de WhatsApp ---
// El formato exportado es: "DD/MM/YYYY, HH:MM - Sender: Message"
export function parseWhatsAppChat(raw: string): Array<{
  sentAt: Date;
  sender: string;
  content: string;
}> {
  const lines = raw.split("\n");
  const messages: Array<{ sentAt: Date; sender: string; content: string }> = [];

  // Regex para el formato de exportación de WhatsApp (iOS y Android)
  const pattern = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s-\s([^:]+):\s(.+)$/;

  for (const line of lines) {
    const match = line.match(pattern);
    if (!match) continue;

    const [, dateStr, timeStr, sender, content] = match;

    // Parsear fecha en formato argentino (DD/MM/YYYY)
    const [day, month, year] = dateStr.split("/").map(Number);
    const fullYear = year < 100 ? 2000 + year : year;

    const [hours, minutes] = timeStr.replace(/\s?[AP]M/i, "").split(":").map(Number);

    messages.push({
      sentAt: new Date(fullYear, month - 1, day, hours, minutes),
      sender: sender.trim(),
      content: content.trim(),
    });
  }

  return messages;
}

// --- Generar contexto de datos para el chatbot (RAG básico) ---
// Crea un resumen en texto plano de los datos del usuario para inyectarlo al prompt
export function buildDataContext(data: {
  monthlySales: Array<{ month: string; total: number; transactions: number }>;
  topClients: Array<{ name: string; total: number; purchases: number }>;
  inactiveClients: Array<{ name: string; lastPurchase: string }>;
}): string {
  const lines: string[] = [];

  lines.push("=== DATOS FINANCIEROS DEL NEGOCIO ===\n");

  // Ventas mensuales
  lines.push("VENTAS POR MES (últimos 12 meses):");
  for (const row of data.monthlySales) {
    lines.push(`  - ${row.month}: $${row.total.toLocaleString("es-AR")} (${row.transactions} transacciones)`);
  }

  // Top clientes
  lines.push("\nTOP CLIENTES POR MONTO COMPRADO:");
  for (const client of data.topClients.slice(0, 10)) {
    lines.push(`  - ${client.name}: $${client.total.toLocaleString("es-AR")} (${client.purchases} compras)`);
  }

  // Clientes inactivos
  if (data.inactiveClients.length > 0) {
    lines.push("\nCLIENTES INACTIVOS (sin compras en 30+ días):");
    for (const client of data.inactiveClients.slice(0, 5)) {
      lines.push(`  - ${client.name}: última compra el ${client.lastPurchase}`);
    }
  }

  return lines.join("\n");
}
