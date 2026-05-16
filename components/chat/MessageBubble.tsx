// ============================================================
// DataNest - Componente MessageBubble para el chatbot
// Renderiza mensajes de usuario y asistente con formato diferenciado
// ============================================================

import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-3 animate-fade-in",
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

      {/* Burbuja de texto */}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-brand-500 text-white rounded-tr-sm"
            : "bg-white border border-surface-200 text-surface-800 rounded-tl-sm shadow-card"
        )}
      >
        {/* Renderizar con soporte de saltos de línea y listas simples */}
        {message.content.split("\n").map((line, i, arr) => {
          const isLast = i === arr.length - 1;
          return (
            <p key={i} className={cn(!isLast && line !== "" && "mb-1.5")}>
              {line || <br />}
            </p>
          );
        })}

        {/* Timestamp */}
        <p
          className={cn(
            "text-[10px] mt-2 select-none",
            isUser ? "text-brand-200" : "text-surface-400"
          )}
        >
          {new Intl.DateTimeFormat("es-AR", {
            hour:   "2-digit",
            minute: "2-digit",
          }).format(new Date(message.timestamp))}
        </p>
      </div>
    </div>
  );
}
