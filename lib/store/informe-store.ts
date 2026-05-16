// ============================================================
// DataNest - Store global de Informe PDF (Zustand + persist)
// Persiste en localStorage para sobrevivir recargas de página.
// Guarda los pares pregunta/respuesta que el usuario selecciona
// desde el chatbot para compilarlos en un informe PDF único.
// ============================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { InformeItem } from "@/types";

// --- Forma del store (sin el campo computed "cantidad") ---
interface State {
  items:         InformeItem[];
  isDrawerOpen:  boolean;
}

interface Actions {
  agregarItem:   (item: InformeItem) => void;
  quitarItem:    (id: string) => void;
  vaciarInforme: () => void;
  abrirDrawer:   () => void;
  cerrarDrawer:  () => void;
  estaEnInforme: (id: string) => boolean;
}

export type InformeStoreType = State & Actions & { cantidad: number };

export const useInformeStore = create<InformeStoreType>()(
  persist(
    (set, get) => ({
      // ── Estado inicial ────────────────────────────────────
      items:        [],
      isDrawerOpen: false,

      // ── Cantidad como getter dinámico ─────────────────────
      get cantidad() {
        return get().items.length;
      },

      // ── Acciones ──────────────────────────────────────────

      // Evita duplicados por id
      agregarItem: (item: InformeItem) =>
        set((state) => {
          if (state.items.some((i) => i.id === item.id)) return state;
          return { items: [...state.items, item] };
        }),

      quitarItem: (id: string) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      vaciarInforme: () => set({ items: [] }),

      abrirDrawer:  () => set({ isDrawerOpen: true }),
      cerrarDrawer: () => set({ isDrawerOpen: false }),

      // Comprueba si un mensaje ya está en el informe
      estaEnInforme: (id: string) =>
        get().items.some((item) => item.id === id),
    }),
    {
      name:    "datanest-informe",
      storage: createJSONStorage(() => {
        // Devolver noop storage en SSR para evitar hidration mismatch
        if (typeof window === "undefined") {
          return {
            getItem:    () => null,
            setItem:    () => undefined,
            removeItem: () => undefined,
          };
        }
        return localStorage;
      }),
      // Solo persistir los items, nunca el estado del drawer
      partialize: (state) => ({ items: state.items }),
    }
  )
);
