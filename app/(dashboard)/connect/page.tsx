// ============================================================
// DataNest - Página "Conectar fuente"
// Opciones: Excel/CSV, Mercado Pago OAuth, WhatsApp (chat exportado)
// ============================================================

"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  CreditCard,
  MessageCircle,
  CheckCircle2,
  Loader2,
  AlertCircle,
  PlugZap,
  RefreshCw,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import type { DataSource } from "@/types";

// --- Componente de fuente conectada ---
function SourceCard({ source }: { source: DataSource }) {
  const icons: Record<DataSource["type"], string> = {
    csv:        "📊",
    excel:      "📗",
    mercadopago: "💳",
    whatsapp:   "💬",
  };
  const labels: Record<DataSource["type"], string> = {
    csv:        "CSV",
    excel:      "Excel",
    mercadopago: "Mercado Pago",
    whatsapp:   "WhatsApp",
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-surface-50 rounded-xl border border-surface-200">
      <span className="text-2xl">{icons[source.type]}</span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-surface-800">{source.name}</p>
        <p className="text-xs text-surface-400">
          {labels[source.type]} •{" "}
          {source.lastSync ? `Sincronizado ${formatDate(source.lastSync)}` : "Sin sincronizar"}
        </p>
      </div>
      <span className={cn("badge", source.status === "active" ? "badge-green" : "badge-red")}>
        {source.status === "active" ? "Activo" : source.status}
      </span>
    </div>
  );
}

// --- Sección: Subir Excel / CSV ---
function FileUploadSection() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ rowsImported: number } | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/sources/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir archivo");

      setResult({ rowsImported: data.rowsImported });
      toast.success(`✅ ${data.rowsImported} ventas importadas correctamente`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10 MB
    disabled: uploading,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200",
          isDragActive
            ? "border-brand-400 bg-brand-50"
            : "border-surface-300 hover:border-brand-300 hover:bg-surface-50",
          uploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
            <p className="text-sm text-surface-500">Procesando archivo…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className={cn("w-8 h-8", isDragActive ? "text-brand-500" : "text-surface-400")} />
            <p className="text-sm font-medium text-surface-700">
              {isDragActive ? "Soltá el archivo aquí" : "Arrastrá un archivo o hacé clic"}
            </p>
            <p className="text-xs text-surface-400">Excel (.xlsx, .xls) o CSV · Máx. 10 MB</p>
          </div>
        )}
      </div>

      {result && (
        <div className="flex items-center gap-3 p-4 bg-accent-400/10 border border-accent-400/20 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-accent-500 flex-shrink-0" />
          <p className="text-sm text-accent-700 font-medium">
            {result.rowsImported} ventas importadas exitosamente
          </p>
        </div>
      )}

      <div className="bg-surface-50 rounded-xl p-4 border border-surface-200">
        <p className="text-xs font-semibold text-surface-700 mb-2">
          📋 Columnas esperadas en el archivo:
        </p>
        <div className="grid grid-cols-2 gap-1">
          {["client_name", "amount", "date", "client_email (opcional)", "description (opcional)", "status (opcional)"].map((col) => (
            <code key={col} className="text-xs bg-white border border-surface-200 rounded-lg px-2 py-1 text-brand-600 font-mono">
              {col}
            </code>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Sección: Mercado Pago OAuth ---
function MercadoPagoSection() {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    // Construir URL de OAuth de Mercado Pago
    const params = new URLSearchParams({
      response_type: "code",
      client_id:     process.env.NEXT_PUBLIC_MP_CLIENT_ID || "",
      redirect_uri:  `${window.location.origin}/api/sources/mercadopago/callback`,
      scope:         "read offline_access",
      state:         crypto.randomUUID(), // Prevenir CSRF
    });
    window.location.href = `https://auth.mercadopago.com.ar/authorization?${params}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 p-5 bg-surface-50 rounded-2xl border border-surface-200">
        <div className="w-12 h-12 bg-[#009ee3]/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-6 h-6 text-[#009ee3]" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-surface-800">Mercado Pago</h3>
          <p className="text-sm text-surface-500 mt-1">
            Conectá tu cuenta de Mercado Pago para importar automáticamente el historial de cobros y pagos.
          </p>
          <ul className="mt-2 space-y-1 text-xs text-surface-400">
            <li>✓ Acceso de solo lectura</li>
            <li>✓ Sincronización automática de cobros</li>
            <li>✓ Identificación de clientes por email</li>
          </ul>
        </div>
      </div>

      <button
        onClick={handleConnect}
        disabled={loading}
        className="btn-primary w-full"
        style={{ background: "#009ee3" }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
        Conectar con Mercado Pago
      </button>

      <p className="text-xs text-surface-400 text-center">
        Serás redirigido a Mercado Pago para autorizar el acceso de forma segura.
      </p>
    </div>
  );
}

// --- Sección: WhatsApp (exportación manual) ---
function WhatsAppSection() {
  const [uploading, setUploading] = useState(false);
  const [chatText, setChatText] = useState("");

  const handleUpload = async () => {
    if (!chatText.trim()) {
      toast.error("Pegá el contenido del chat exportado");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch("/api/sources/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawChat: chatText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al procesar el chat");
      toast.success(`✅ ${data.messagesImported} mensajes importados`);
      setChatText("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-surface-50 rounded-xl p-4 border border-surface-200">
        <p className="text-xs font-semibold text-surface-700 mb-1">¿Cómo exportar tu chat?</p>
        <ol className="text-xs text-surface-500 space-y-1 list-decimal list-inside">
          <li>Abrí el chat en WhatsApp</li>
          <li>Tocá los tres puntos → &quot;Más&quot; → &quot;Exportar chat&quot;</li>
          <li>Seleccioná &quot;Sin archivos adjuntos&quot;</li>
          <li>Copiá el contenido del archivo .txt y pegalo abajo</li>
        </ol>
      </div>

      <textarea
        value={chatText}
        onChange={(e) => setChatText(e.target.value)}
        placeholder="Pegá aquí el contenido exportado de WhatsApp…"
        className="input h-40 resize-none font-mono text-xs"
        disabled={uploading}
      />

      <button
        onClick={handleUpload}
        disabled={uploading || !chatText.trim()}
        className="btn-primary w-full"
        style={{ background: "#25d366" }}
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
        Importar conversación
      </button>
    </div>
  );
}

// --- Página principal ---
export default function ConnectPage() {
  const [active, setActive] = useState<"file" | "mercadopago" | "whatsapp">("file");
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);

  const fetchSources = async () => {
    try {
      const res = await fetch("/api/sources");
      const data = await res.json();
      setSources(data.sources || []);
    } catch {
      // Silencioso
    } finally {
      setLoadingSources(false);
    }
  };

  useEffect(() => { fetchSources(); }, []);

  const tabs = [
    { id: "file" as const,        icon: Upload,        label: "Excel / CSV" },
    { id: "mercadopago" as const, icon: CreditCard,    label: "Mercado Pago" },
    { id: "whatsapp" as const,    icon: MessageCircle, label: "WhatsApp" },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="animate-in-1">
        <h1 className="text-2xl font-bold text-surface-900">Conectar fuente de datos</h1>
        <p className="text-sm text-surface-500 mt-0.5">
          Importá tus ventas desde diferentes plataformas
        </p>
      </div>

      {/* Fuentes conectadas */}
      {(sources.length > 0 || loadingSources) && (
        <div className="card animate-in-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-surface-700 flex items-center gap-2">
              <PlugZap className="w-4 h-4 text-brand-400" />
              Fuentes conectadas
            </h2>
            <button onClick={fetchSources} className="text-surface-400 hover:text-surface-600 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          {loadingSources ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {sources.map((s) => <SourceCard key={s.id} source={s} />)}
            </div>
          )}
        </div>
      )}

      {/* Selector de fuente */}
      <div className="card animate-in-3">
        {/* Tabs */}
        <div className="flex gap-1 bg-surface-100 rounded-xl p-1 mb-6">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all duration-200",
                active === id
                  ? "bg-white text-brand-600 shadow-card"
                  : "text-surface-500 hover:text-surface-700"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Contenido por tab */}
        {active === "file"        && <FileUploadSection />}
        {active === "mercadopago" && <MercadoPagoSection />}
        {active === "whatsapp"    && <WhatsAppSection />}
      </div>

      {/* Aviso de privacidad */}
      <div className="flex items-start gap-2 text-xs text-surface-400 animate-in-4">
        <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <p>Tus datos son privados y solo vos podés verlos. No compartimos información con terceros.</p>
      </div>
    </div>
  );
}
