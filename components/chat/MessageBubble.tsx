// ============================================================
// DataNest - MessageBubble con soporte de Informe PDF
// Los mensajes del asistente muestran un botón de bookmark
// que guarda el par pregunta/respuesta en el InformeStore.
// ============================================================

"use client";

import { useState } from "react";
import { Bot, User, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInformeStore } from "@/lib/store/informe-store";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message:   ChatMessage;
  // Pregunta del usuario que originó esta respuesta del asistente.
  // El padre (chat/page.tsx) la resuelve buscando el mensaje anterior.
  pregunta?: string;
}

export function MessageBubble({ message, pregunta }: MessageBubbleProps) {
  const isUser = message.role === "user";

  const [justAdded, setJustAdded] = useState(false);

  const { agregarItem, quitarItem, estaEnInforme, abrirDrawer } =
    useInformeStore();

  const enInforme = estaEnInforme(message.id);

  const handleToggle = () => {
    if (enInforme) {
      quitarItem(message.id);
    } else {
      agregarItem({
        id:        message.id,
        pregunta:  pregunta ?? "(sin pregunta)",
        respuesta: message.content,
        fecha:     (message.timestamp instanceof Date
          ? message.timestamp
          : new Date(message.timestamp)
        ).toISOString(),
      });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
      setTimeout(() => abrirDrawer(), 350);
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 animate-fade-in group/bubble",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
          isUser ? "bg-brand-500" : "bg-surface-800"
        )}
      >
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Bot  className="w-4 h-4 text-white" />
        }
      </div>

      {/* Burbuja + botón agregar */}
      <div className={cn("flex flex-col gap-1.5 max-w-[78%]", isUser && "items-end")}>

        {/* Burbuja */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all duration-200",
            isUser
              ? "bg-brand-500 text-white rounded-tr-sm"
              : "bg-white border text-surface-800 rounded-tl-sm shadow-card",
            !isUser && enInforme
              ? "border-brand-300 shadow-card-hover ring-1 ring-brand-200"
              : !isUser && "border-surface-200"
          )}
        >
          {message.content.split("\n").map((line, i, arr) => (
            <p key={i} className={cn(i < arr.length - 1 && line !== "" && "mb-1.5")}>
              {line || <br />}
            </p>
          ))}

          <p className={cn(
            "text-[10px] mt-2 select-none",
            isUser ? "text-brand-200" : "text-surface-400"
          )}>
            {new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" })
              .format(new Date(message.timestamp))}
          </p>
        </div>

        {/* Botón bookmark — solo en respuestas del asistente */}
        {!isUser && (
          <button
            onClick={handleToggle}
            title={enInforme ? "Quitar del informe" : "Agregar al informe PDF"}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              "transition-all duration-200 border",
              enInforme
                ? "bg-brand-50 border-brand-200 text-brand-600"
                : justAdded
                  ? "bg-accent-400/10 border-accent-400/30 text-accent-600"
                  : "opacity-0 group-hover/bubble:opacity-100 bg-white border-surface-200 " +
                    "text-surface-500 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50"
            )}
          >
            {enInforme ? (
              <><BookmarkCheck className="w-3.5 h-3.5" /> En el informe</>
            ) : justAdded ? (
              <><BookmarkCheck className="w-3.5 h-3.5 text-accent-500" /> ¡Agregado!</>
            ) : (
              <><BookmarkPlus className="w-3.5 h-3.5" /> Agregar al informe</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
