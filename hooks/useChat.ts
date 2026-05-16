// ============================================================
// DataNest - Hook personalizado para el estado del chatbot
// Gestiona mensajes, envío, historial y persistencia en sessionStorage
// ============================================================

import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatMessage } from "@/types";

const WELCOME_MESSAGE: ChatMessage = {
  id:        "welcome",
  role:      "assistant",
  content:   "¡Hola! 👋 Soy tu asistente de DataNest. Puedo responderte preguntas sobre tus ventas, clientes y tendencias del negocio.\n\n¿En qué puedo ayudarte hoy?",
  timestamp: new Date(),
};

const SESSION_KEY = "datanest_chat_history";

interface UseChatReturn {
  messages:   ChatMessage[];
  loading:    boolean;
  error:      string | null;
  sendMessage: (content: string) => Promise<void>;
  clearChat:   () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const abortRef                = useRef<AbortController | null>(null);

  // Restaurar historial de la sesión al montar
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed: ChatMessage[] = JSON.parse(saved);
        if (parsed.length > 1) {
          // Restaurar timestamps como objetos Date
          setMessages(parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })));
        }
      }
    } catch {
      // Silencioso: sessionStorage puede no estar disponible
    }
  }, []);

  // Persistir historial en sessionStorage cuando cambia
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages));
    } catch {
      // Silencioso
    }
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return;

    // Cancelar request anterior si está en curso
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const userMessage: ChatMessage = {
      id:        crypto.randomUUID(),
      role:      "user",
      content:   content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      // Construir historial para enviar (sin el mensaje de bienvenida)
      const history = [...messages, userMessage]
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }))
        // Limitar a los últimos 10 mensajes para no exceder el contexto
        .slice(-10);

      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: history }),
        signal:  abortRef.current.signal,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al obtener respuesta");

      const assistantMessage: ChatMessage = {
        id:        crypto.randomUUID(),
        role:      "assistant",
        content:   data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;

      const errorMsg = err instanceof Error ? err.message : "Error inesperado";
      setError(errorMsg);

      setMessages((prev) => [
        ...prev,
        {
          id:        crypto.randomUUID(),
          role:      "assistant",
          content:   `❌ ${errorMsg}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages]);

  const clearChat = useCallback(() => {
    setMessages([{ ...WELCOME_MESSAGE, timestamp: new Date() }]);
    setError(null);
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* silencioso */ }
  }, []);

  return { messages, loading, error, sendMessage, clearChat };
}
