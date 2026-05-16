// ============================================================
// DataNest - Página del Chatbot IA
// Usa: useChat hook + MessageBubble (con soporte de informe)
// + TypingIndicator
//
// Para cada mensaje del asistente, busca la pregunta del usuario
// inmediatamente anterior y se la pasa como prop a MessageBubble,
// de modo que el store guarde el par pregunta/respuesta completo.
// ============================================================

"use client";

import { useRef, useEffect } from "react";
import { Send, Sparkles, RefreshCw } from "lucide-react";
import { useChat }         from "@/hooks/useChat";
import { MessageBubble }   from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { cn } from "@/lib/utils";

const EXAMPLE_PROMPTS = [
  "¿Cuánto vendí el mes pasado?",
  "¿Cuáles son mis 3 mejores clientes?",
  "¿Qué clientes no compraron en 30 días?",
  "¿Cuál es mi ticket promedio?",
  "Dame un resumen del negocio",
];

export default function ChatPage() {
  const { messages, loading, sendMessage, clearChat } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const formRef   = useRef<HTMLFormElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const textarea = inputRef.current;
    if (!textarea) return;
    const value = textarea.value.trim();
    if (!value) return;
    sendMessage(value);
    textarea.value = "";
    textarea.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const isFirstMessage = messages.length <= 1;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-3xl mx-auto">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-4 border-b border-surface-200 animate-in-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface-900 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-surface-900">Asistente IA</h1>
            <p className="text-xs text-surface-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse-soft inline-block" />
              GPT-4o-mini · Contexto en tiempo real
            </p>
          </div>
        </div>
        <button onClick={clearChat} className="btn-secondary text-xs">
          <RefreshCw className="w-3.5 h-3.5" />
          Nueva
        </button>
      </div>

      {/* ── Lista de mensajes ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-5 space-y-4">
        {messages.map((msg, idx) => {
          // Para los mensajes del asistente, encontrar la pregunta anterior del usuario
          const pregunta = msg.role === "assistant"
            ? messages.slice(0, idx).reverse().find((m) => m.role === "user")?.content
            : undefined;

          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              pregunta={pregunta}
            />
          );
        })}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* ── Prompts de ejemplo ────────────────────────────── */}
      {isFirstMessage && !loading && (
        <div className="pb-3 animate-in-3">
          <p className="text-xs text-surface-400 mb-2 font-medium">Podés preguntarme:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-xs px-3 py-1.5 bg-surface-100 hover:bg-brand-50
                           text-surface-600 hover:text-brand-600 rounded-full border
                           border-surface-200 hover:border-brand-200 transition-all duration-150"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input ─────────────────────────────────────────── */}
      <div className="border-t border-surface-200 pt-4 animate-in-4">
        <form ref={formRef} onSubmit={handleSubmit} className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            rows={1}
            placeholder="Preguntá algo sobre tu negocio…"
            onKeyDown={handleKeyDown}
            disabled={loading}
            className={cn(
              "input flex-1 resize-none min-h-[44px] max-h-32 py-3 font-sans",
              "overflow-y-auto leading-relaxed"
            )}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
              "transition-all duration-200",
              loading
                ? "bg-surface-100 text-surface-300 cursor-not-allowed"
                : "bg-brand-500 text-white hover:bg-brand-600 shadow-glow"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-xs text-surface-400 mt-2 text-center">
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  );
}
