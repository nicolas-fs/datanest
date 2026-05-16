// ============================================================
// DataNest - Componente TypingIndicator
// Animación de "el asistente está escribiendo..."
// ============================================================

import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      {/* Avatar del bot */}
      <div className="w-8 h-8 rounded-full bg-surface-800 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Bot className="w-4 h-4 text-white" />
      </div>

      {/* Burbuja con puntos animados */}
      <div className="bg-white border border-surface-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-card">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-surface-400 animate-bounce"
              style={{
                animationDelay:    `${i * 160}ms`,
                animationDuration: "0.9s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
