// ============================================================
// DataNest - Página /informe
// Preview del informe: lista los items seleccionados,
// permite reordenarlos, quitarlos y descargar el PDF.
// Usa @react-pdf/renderer con BlobProvider para preview en browser.
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter }   from "next/navigation";
import { useSession }  from "next-auth/react";
import {
  FileText,
  Download,
  Printer,
  Trash2,
  ArrowLeft,
  GripVertical,
  X,
  BookmarkX,
  Loader2,
  Eye,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useInformeStore }  from "@/lib/store/informe-store";
import { formatDate, cn }   from "@/lib/utils";
import type { InformeItem } from "@/types";

// @react-pdf/renderer requiere lazy loading (no SSR)
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  { ssr: false, loading: () => <span /> }
);
const BlobProvider = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.BlobProvider),
  { ssr: false }
);
const InformePDFDynamic = dynamic(
  () => import("@/components/informe/InformePDF").then((m) => m.InformePDF),
  { ssr: false }
);

// ── Ítem con botón de quitar ────────────────────────────────
function InformeItemRow({
  item,
  index,
  onRemove,
}: {
  item:     InformeItem;
  index:    number;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white border border-surface-200
                    rounded-2xl shadow-card hover:shadow-card-hover transition-all group">
      {/* Handle de drag (decorativo en MVP) */}
      <GripVertical className="w-4 h-4 text-surface-300 flex-shrink-0 mt-1 cursor-grab" />

      {/* Número */}
      <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center
                      text-white text-xs font-black flex-shrink-0">
        {index + 1}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Pregunta */}
        <p className="text-sm font-semibold text-brand-700 leading-snug">
          {item.pregunta}
        </p>
        {/* Respuesta truncada */}
        <p className="text-xs text-surface-500 leading-relaxed line-clamp-2">
          {item.respuesta}
        </p>
        {/* Fecha */}
        <p className="text-[10px] text-surface-400">{formatDate(item.fecha)}</p>
      </div>

      {/* Botón quitar */}
      <button
        onClick={() => onRemove(item.id)}
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                   opacity-0 group-hover:opacity-100 transition-all
                   bg-danger-400/10 text-danger-500 hover:bg-danger-400/20"
        title="Quitar del informe"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Página principal ────────────────────────────────────────
export default function InformePage() {
  const router         = useRouter();
  const { data: session } = useSession();
  const {
    items,
    quitarItem,
    vaciarInforme,
  } = useInformeStore();

  // Evitar hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const userName = session?.user?.name ?? "Usuario";
  const cantidad = items.length;

  // Acción: vaciar con confirmación
  const handleVaciar = () => {
    if (confirm("¿Vaciar el informe completo? Esta acción no se puede deshacer.")) {
      vaciarInforme();
    }
  };

  // Nombre del archivo descargado
  const fileName = `informe-datanest-${new Date().toISOString().slice(0, 10)}.pdf`;

  if (!mounted) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between animate-in-1">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs text-surface-500
                       hover:text-surface-800 mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver
          </button>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-brand-500" />
            Informe PDF
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">
            {cantidad === 0
              ? "Seleccioná respuestas del chatbot para incluir en el informe"
              : `${cantidad} análisis seleccionado${cantidad !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Acciones globales */}
        {cantidad > 0 && (
          <div className="flex items-center gap-2 animate-in-2">
            <button
              onClick={handleVaciar}
              className="btn-secondary text-sm text-danger-500 hover:text-danger-600
                         hover:bg-danger-400/5 border-danger-200"
            >
              <Trash2 className="w-4 h-4" />
              Vaciar
            </button>
          </div>
        )}
      </div>

      {/* ── Estado vacío ──────────────────────────────────────── */}
      {cantidad === 0 && (
        <div className="card flex flex-col items-center py-20 text-center animate-in-2">
          <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mb-4">
            <BookmarkX className="w-8 h-8 text-surface-400" />
          </div>
          <h2 className="text-base font-semibold text-surface-700 mb-1">
            Informe vacío
          </h2>
          <p className="text-sm text-surface-400 max-w-xs mb-6">
            Andá al chatbot y tocá{" "}
            <span className="font-medium text-brand-500">Agregar al informe</span>
            {" "}en las respuestas que te interesen.
          </p>
          <button
            onClick={() => router.push("/chat")}
            className="btn-primary"
          >
            Ir al Asistente IA →
          </button>
        </div>
      )}

      {/* ── Lista de items ─────────────────────────────────────── */}
      {cantidad > 0 && (
        <>
          <div className="space-y-3 animate-in-3">
            {items.map((item, idx) => (
              <InformeItemRow
                key={item.id}
                item={item}
                index={idx}
                onRemove={quitarItem}
              />
            ))}
          </div>

          {/* ── Acciones de descarga ─────────────────────────────── */}
          <div className="card animate-in-4 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-surface-800 mb-0.5">
                Generar PDF
              </h2>
              <p className="text-xs text-surface-400">
                El archivo incluirá una portada, resumen ejecutivo y todos los análisis seleccionados.
              </p>
            </div>

            {/* Preview metadata */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Análisis", value: String(cantidad) },
                {
                  label: "Fecha",
                  value: new Intl.DateTimeFormat("es-AR", {
                    day: "2-digit", month: "2-digit", year: "numeric",
                  }).format(new Date()),
                },
                { label: "Formato", value: "A4 PDF" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-surface-50 rounded-xl p-3 text-center border border-surface-200">
                  <p className="text-sm font-bold text-surface-900">{value}</p>
                  <p className="text-xs text-surface-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Botones de descarga e impresión */}
            {mounted && (
              <BlobProvider
                document={
                  <InformePDFDynamic items={items} userName={userName} />
                }
              >
                {({ blob, url, loading, error }) => {
                  if (error) {
                    return (
                      <p className="text-xs text-danger-500 text-center">
                        Error al generar el PDF. Intentá de nuevo.
                      </p>
                    );
                  }

                  return (
                    <div className="flex gap-3">
                      {/* Descargar */}
                      <a
                        href={url ?? "#"}
                        download={fileName}
                        className={cn(
                          "btn-primary flex-1 justify-center",
                          (!url || loading) && "opacity-60 pointer-events-none"
                        )}
                      >
                        {loading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Generando…</>
                        ) : (
                          <><Download className="w-4 h-4" /> Descargar PDF</>
                        )}
                      </a>

                      {/* Imprimir */}
                      <button
                        disabled={!url || loading}
                        onClick={() => {
                          if (!url) return;
                          const win = window.open(url, "_blank");
                          win?.print();
                        }}
                        className={cn(
                          "btn-secondary",
                          (!url || loading) && "opacity-60 cursor-not-allowed"
                        )}
                        title="Imprimir"
                      >
                        <Printer className="w-4 h-4" />
                        Imprimir
                      </button>

                      {/* Preview en nueva pestaña */}
                      <a
                        href={url ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          "btn-secondary",
                          (!url || loading) && "opacity-60 pointer-events-none"
                        )}
                        title="Ver PDF en nueva pestaña"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    </div>
                  );
                }}
              </BlobProvider>
            )}

            <p className="text-xs text-surface-400 text-center">
              El PDF se genera localmente en tu navegador · Tus datos nunca salen del dispositivo
            </p>
          </div>
        </>
      )}
    </div>
  );
}
