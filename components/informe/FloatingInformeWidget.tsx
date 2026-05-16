// ============================================================
// DataNest - FloatingInformeWidget
// Botón flotante (bottom-right) que muestra cuántos items hay
// en el carrito de informe. Al hacerle click abre el Drawer.
// Se monta en el layout del dashboard para estar en todas las rutas.
// ============================================================

"use client";

import { FileText } from "lucide-react";
import { useInformeStore } from "@/lib/store/informe-store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function FloatingInformeWidget() {
  const { items, abrirDrawer } = useInformeStore();
  const cantidad = items.length;

  // Evitar hydration mismatch: mostrar solo en cliente
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Animación de "bump" al agregar un nuevo item
  const [bumping, setBumping] = useState(false);
  const [prevCount, setPrevCount] = useState(cantidad);

  useEffect(() => {
    if (!mounted) return;
    if (cantidad > prevCount) {
      setBumping(true);
      setTimeout(() => setBumping(false), 400);
    }
    setPrevCount(cantidad);
  }, [cantidad, mounted, prevCount]);

  if (!mounted || cantidad === 0) return null;

  return (
    <button
      onClick={abrirDrawer}
      title={`Ver informe (${cantidad} elementos)`}
      className={cn(
        // Posición fija, por encima de todo
        "fixed bottom-6 right-6 z-50",
        // Forma y colores
        "flex items-center gap-2.5 pl-4 pr-3 py-3 rounded-2xl",
        "bg-brand-600 text-white shadow-glow",
        // Hover
        "hover:bg-brand-700 hover:scale-105",
        // Transición
        "transition-all duration-200",
        // Animación de bump
        bumping && "scale-110"
      )}
    >
      <FileText className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm font-semibold leading-none">
        Informe
      </span>
      {/* Badge con cantidad */}
      <span className={cn(
        "min-w-[22px] h-[22px] rounded-full bg-white text-brand-600",
        "flex items-center justify-center text-xs font-black leading-none",
        "transition-transform duration-200",
        bumping && "scale-125"
      )}>
        {cantidad}
      </span>
    </button>
  );
}
