// ============================================================
// DataNest - Documento PDF del Informe
// Creado con @react-pdf/renderer.
// Recibe los items del informe y genera un PDF profesional
// con portada, índice implícito y secciones por item.
// ============================================================

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { InformeItem } from "@/types";

// ── Paleta de colores (consistente con la UI) ───────────────
const COLORS = {
  brand:       "#6366f1",
  brandLight:  "#eef2ff",
  brandDark:   "#4338ca",
  accent:      "#10b981",
  surface:     "#f8fafc",
  border:      "#e2e8f0",
  text:        "#0f172a",
  textMuted:   "#64748b",
  textLight:   "#94a3b8",
  white:       "#ffffff",
  danger:      "#ef4444",
};

// ── Estilos del documento ───────────────────────────────────
const S = StyleSheet.create({
  page: {
    fontFamily:      "Helvetica",
    backgroundColor: COLORS.white,
    paddingTop:      0,
    paddingBottom:   40,
    paddingHorizontal: 0,
  },

  // --- Portada ---
  coverPage: {
    backgroundColor: COLORS.brand,
    flex:            1,
    justifyContent:  "center",
    alignItems:      "center",
    paddingHorizontal: 48,
  },
  coverLogo: {
    width:        56,
    height:       56,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems:   "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  coverLogoText: {
    color:      COLORS.brand,
    fontSize:   22,
    fontFamily: "Helvetica-Bold",
  },
  coverTitle: {
    color:      COLORS.white,
    fontSize:   28,
    fontFamily: "Helvetica-Bold",
    textAlign:  "center",
    marginBottom: 8,
  },
  coverSubtitle: {
    color:        "rgba(255,255,255,0.75)",
    fontSize:     12,
    textAlign:    "center",
    marginBottom: 36,
  },
  coverMeta: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius:    10,
    padding:         16,
    width:           "100%",
  },
  coverMetaRow: {
    flexDirection:  "row",
    justifyContent: "space-between",
    marginBottom:   4,
  },
  coverMetaLabel: {
    color:    "rgba(255,255,255,0.65)",
    fontSize: 10,
  },
  coverMetaValue: {
    color:      COLORS.white,
    fontSize:   10,
    fontFamily: "Helvetica-Bold",
  },

  // --- Header de páginas interiores ---
  pageHeader: {
    backgroundColor: COLORS.brand,
    paddingHorizontal: 40,
    paddingTop:        20,
    paddingBottom:     16,
    marginBottom:      0,
  },
  pageHeaderRow: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "center",
  },
  pageHeaderBrand: {
    color:      COLORS.white,
    fontSize:   11,
    fontFamily: "Helvetica-Bold",
    opacity:    0.9,
  },
  pageHeaderPage: {
    color:    "rgba(255,255,255,0.6)",
    fontSize: 9,
  },
  dividerAccent: {
    height:          2,
    backgroundColor: COLORS.accent,
    marginTop:       8,
  },

  // --- Contenido interior ---
  content: {
    paddingHorizontal: 40,
    paddingTop:        24,
  },

  // --- Item card ---
  itemCard: {
    marginBottom:    20,
    borderRadius:    10,
    border:          `1pt solid ${COLORS.border}`,
    overflow:        "hidden",
  },
  itemHeader: {
    backgroundColor: COLORS.brandLight,
    paddingHorizontal: 14,
    paddingVertical:   10,
    flexDirection:     "row",
    alignItems:        "flex-start",
    gap:               8,
  },
  itemNumber: {
    width:           20,
    height:          20,
    borderRadius:    10,
    backgroundColor: COLORS.brand,
    alignItems:      "center",
    justifyContent:  "center",
    marginTop:       1,
    flexShrink:      0,
  },
  itemNumberText: {
    color:      COLORS.white,
    fontSize:   8,
    fontFamily: "Helvetica-Bold",
  },
  itemQuestion: {
    color:      COLORS.brandDark,
    fontSize:   11,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.5,
    flex:       1,
  },
  itemBody: {
    paddingHorizontal: 14,
    paddingVertical:   12,
    backgroundColor:   COLORS.white,
  },
  itemAnswer: {
    color:      COLORS.text,
    fontSize:   10.5,
    lineHeight: 1.65,
  },
  itemFooter: {
    borderTop:         `1pt solid ${COLORS.border}`,
    paddingHorizontal: 14,
    paddingVertical:   7,
    flexDirection:     "row",
    justifyContent:    "space-between",
    backgroundColor:   COLORS.surface,
  },
  itemFooterText: {
    color:    COLORS.textLight,
    fontSize: 8.5,
  },

  // --- Footer de página ---
  pageFooter: {
    position:        "absolute",
    bottom:          16,
    left:            40,
    right:           40,
    flexDirection:   "row",
    justifyContent:  "space-between",
    alignItems:      "center",
    borderTop:       `1pt solid ${COLORS.border}`,
    paddingTop:      8,
  },
  pageFooterText: {
    color:    COLORS.textLight,
    fontSize: 8,
  },

  // --- Resumen ejecutivo ---
  summaryBox: {
    backgroundColor: COLORS.surface,
    borderRadius:    10,
    padding:         16,
    marginBottom:    20,
    border:          `1pt solid ${COLORS.border}`,
  },
  summaryTitle: {
    color:        COLORS.text,
    fontSize:     12,
    fontFamily:   "Helvetica-Bold",
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection:  "row",
    gap:            12,
  },
  summaryCard: {
    flex:            1,
    backgroundColor: COLORS.white,
    borderRadius:    8,
    padding:         10,
    border:          `1pt solid ${COLORS.border}`,
    alignItems:      "center",
  },
  summaryCardValue: {
    color:        COLORS.brand,
    fontSize:     20,
    fontFamily:   "Helvetica-Bold",
    marginBottom: 2,
  },
  summaryCardLabel: {
    color:    COLORS.textMuted,
    fontSize: 8,
    textAlign: "center",
  },
});

// ── Helpers ─────────────────────────────────────────────────
function formatFecha(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      day:    "2-digit",
      month:  "long",
      year:   "numeric",
      hour:   "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatFechaCorta(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit", month: "2-digit", year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ── Componente del documento PDF ────────────────────────────
interface InformePDFProps {
  items:     InformeItem[];
  userName?: string;
}

export function InformePDF({ items, userName = "Usuario" }: InformePDFProps) {
  const fechaGeneracion = new Intl.DateTimeFormat("es-AR", {
    day:    "2-digit",
    month:  "long",
    year:   "numeric",
  }).format(new Date());

  return (
    <Document
      title={`Informe DataNest — ${fechaGeneracion}`}
      author="DataNest"
      subject="Informe de análisis de negocio generado por IA"
      creator="DataNest App"
      producer="@react-pdf/renderer"
    >
      {/* ── Página de portada ───────────────────────────── */}
      <Page size="A4" style={S.page}>
        <View style={S.coverPage}>
          {/* Logo */}
          <View style={S.coverLogo}>
            <Text style={S.coverLogoText}>DN</Text>
          </View>

          {/* Títulos */}
          <Text style={S.coverTitle}>Informe de Análisis</Text>
          <Text style={S.coverSubtitle}>
            Generado por DataNest con Inteligencia Artificial
          </Text>

          {/* Metadata */}
          <View style={S.coverMeta}>
            <View style={S.coverMetaRow}>
              <Text style={S.coverMetaLabel}>Generado por</Text>
              <Text style={S.coverMetaValue}>{userName}</Text>
            </View>
            <View style={S.coverMetaRow}>
              <Text style={S.coverMetaLabel}>Fecha</Text>
              <Text style={S.coverMetaValue}>{fechaGeneracion}</Text>
            </View>
            <View style={[S.coverMetaRow, { marginBottom: 0 }]}>
              <Text style={S.coverMetaLabel}>Total de análisis</Text>
              <Text style={S.coverMetaValue}>{items.length}</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* ── Página de contenido ─────────────────────────── */}
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.pageHeader} fixed>
          <View style={S.pageHeaderRow}>
            <Text style={S.pageHeaderBrand}>DataNest — Informe de Análisis</Text>
            <Text
              style={S.pageHeaderPage}
              render={({ pageNumber, totalPages }) =>
                `Página ${pageNumber} de ${totalPages}`
              }
            />
          </View>
          <View style={S.dividerAccent} />
        </View>

        {/* Contenido */}
        <View style={S.content}>
          {/* Resumen ejecutivo */}
          <View style={S.summaryBox}>
            <Text style={S.summaryTitle}>Resumen ejecutivo</Text>
            <View style={S.summaryRow}>
              <View style={S.summaryCard}>
                <Text style={S.summaryCardValue}>{items.length}</Text>
                <Text style={S.summaryCardLabel}>Análisis{"\n"}incluidos</Text>
              </View>
              <View style={S.summaryCard}>
                <Text style={S.summaryCardValue}>
                  {formatFechaCorta(items[0]?.fecha ?? new Date().toISOString())}
                </Text>
                <Text style={S.summaryCardLabel}>Primera{"\n"}consulta</Text>
              </View>
              <View style={S.summaryCard}>
                <Text style={S.summaryCardValue}>
                  {formatFechaCorta(items[items.length - 1]?.fecha ?? new Date().toISOString())}
                </Text>
                <Text style={S.summaryCardLabel}>Última{"\n"}consulta</Text>
              </View>
            </View>
          </View>

          {/* Items */}
          {items.map((item, idx) => (
            <View key={item.id} style={S.itemCard} wrap={false}>
              {/* Pregunta */}
              <View style={S.itemHeader}>
                <View style={S.itemNumber}>
                  <Text style={S.itemNumberText}>{idx + 1}</Text>
                </View>
                <Text style={S.itemQuestion}>{item.pregunta}</Text>
              </View>

              {/* Respuesta */}
              <View style={S.itemBody}>
                <Text style={S.itemAnswer}>{item.respuesta}</Text>
              </View>

              {/* Fecha */}
              <View style={S.itemFooter}>
                <Text style={S.itemFooterText}>
                  Consulta realizada el {formatFecha(item.fecha)}
                </Text>
                <Text style={S.itemFooterText}>DataNest IA</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={S.pageFooter} fixed>
          <Text style={S.pageFooterText}>
            DataNest — datanest.app
          </Text>
          <Text style={S.pageFooterText}>
            Informe generado el {fechaGeneracion} · Datos confidenciales
          </Text>
        </View>
      </Page>
    </Document>
  );
}
