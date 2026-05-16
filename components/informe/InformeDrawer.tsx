// ============================================================
// DataNest - InformeDrawer
// Panel deslizante lateral que lista todos los items del informe,
// permite quitarlos individualmente o vaciar todo, y navega a la
// página de preview/generación del PDF.
// ============================================================

"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  FileText,
  Trash2,
  ArrowRight,
  BookmarkX,
  MessageSquareText,
} from "lucide-react";
import { useInformeStore } from "@/lib/store/informe-store";
import { cn, formatDate } from "@/lib/utils";

// ── Ítem individual del drawer ─────────────────────────────
function DrawerItem({ id, pregunta, respuesta, fecha }: {
  id: string;
  pregunta: string;
  respuesta: string;
  fecha: string;
}) {
  const quitarItem = useInformeStore((s) => s.quitarItem);

  // Truncar respuesta para el preview
  const preview = respuesta.length > 120
    ? respuesta.slice(0, 120) + "…"
    : respuesta;

  return (
    <div className="group relative flex flex-col gap-1.5 p-3 rounded-xl border
                    border-surface-200 bg-surface-50 hover:bg-white hover:shadow-card
                    transition-all duration-150">
      {/* Botón quitar */}
      <button
        onClick={() => quitarItem(id)}
        title="Quitar del informe"
        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-lg flex items-center justify-center
                   opacity-0 group-hover:opacity-100 transition-opacity
                   bg-danger-400/10 text-danger-500 hover:bg-danger-400/20"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Pregunta */}
      <div className="flex items-start gap-2">
        <MessageSquareText className="w-3.5 h-3.5 text-brand-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs font-semibold text-brand-700 leading-snug pr-6">
          {pregunta}
        </p>
      </div>

      {/* Respuesta truncada */}
      <p className="text-xs text-surface-500 leading-relaxed pl-5">
        {preview}
      </p>

      {/* Fecha */}
      <p className="text-[10px] text-surface-400 pl-5">
        {formatDate(fecha)}
      </p>
    </div>
  );
}

// ── Drawer principal ────────────────────────────────────────
export function InformeDrawer() {
  const router          = useRouter();
  const overlayRef      = useRef<HTMLDivElement>(null);

  const {
    items,
    isDrawerOpen,
    cerrarDrawer,
    vaciarInforme,
  } = useInformeStore();

  const cantidad = items.length;

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrarDrawer();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [cerrarDrawer]);

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isDrawerOpen]);

  const handleGoToPreview = () => {
    cerrarDrawer();
    router.push("/informe");
  };

  const handleVaciar = () => {
    if (confirm("¿Seguro que querés vaciar el informe? Se eliminarán todos los elementos.")) {
      vaciarInforme();
      cerrarDrawer();
    }
  };

  return (
    <>
      {/* ── Overlay oscuro ───────────────────────────────── */}
      <div
        ref={overlayRef}
        onClick={cerrarDrawer}
        className={cn(
          "fixed inset-0 z-40 bg-surface-900/40 backdrop-blur-[2px]",
          "transition-opacity duration-300",
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      {/* ── Panel deslizante ─────────────────────────────── */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de informe PDF"
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-sm",
          "bg-white shadow-2xl flex flex-col",
          "transition-transform duration-300 ease-in-out",
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ── Header del drawer ────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-surface-900">Informe PDF</p>
              <p className="text-xs text-surface-400">
                {cantidad === 0
                  ? "Sin elementos"
                  : `${cantidad} elemento${cantidad !== 1 ? "s" : ""} seleccionado${cantidad !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <button
            onClick={cerrarDrawer}
            className="w-8 h-8 rounded-xl hover:bg-surface-100 flex items-center justify-center
                       transition-colors text-surface-500 hover:text-surface-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Lista de items ───────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cantidad === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-14 h-14 bg-surface-100 rounded-2xl flex items-center justify-center mb-3">
                <BookmarkX className="w-7 h-7 text-surface-400" />
              </div>
              <p className="text-sm font-semibold text-surface-700 mb-1">
                Informe vacío
              </p>
              <p className="text-xs text-surface-400 max-w-[200px]">
                Agregá respuestas del chatbot usando el botón{" "}
                <span className="font-medium text-brand-500">Agregar al informe</span>.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <DrawerItem key={item.id} {...item} />
            ))
          )}
        </div>

        {/* ── Footer con acciones ──────────────────────── */}
        {cantidad > 0 && (
          <div className="border-t border-surface-200 p-4 space-y-2">
            {/* Botón principal: ir al preview */}
            <button
              onClick={handleGoToPreview}
              className="btn-primary w-full justify-between group"
            >
              <span>Ver y generar PDF</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Botón secundario: vaciar */}
            <button
              onClick={handleVaciar}
              className="flex items-center justify-center gap-2 w-full py-2 text-xs
                         text-danger-500 hover:text-danger-600 hover:bg-danger-400/5
                         rounded-xl transition-all duration-150"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Vaciar informe
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
