// ============================================================
// DataNest - Metadatos de páginas del dashboard
// Centraliza los títulos y descripciones SEO de cada ruta
// ============================================================

import type { Metadata } from "next";

export const DASHBOARD_META: Record<string, Metadata> = {
  dashboard: {
    title:       "Dashboard",
    description: "KPIs, ventas mensuales y alertas de clientes de tu negocio",
  },
  connect: {
    title:       "Conectar fuente",
    description: "Importá datos desde Excel, Mercado Pago o WhatsApp",
  },
  chat: {
    title:       "Asistente IA",
    description: "Consultá tus datos de negocio en lenguaje natural con GPT-4o-mini",
  },
};
