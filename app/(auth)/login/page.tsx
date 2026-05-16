// ============================================================
// DataNest - Página de login
// Soporta: Google OAuth y Email + Contraseña
// ============================================================

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Database, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // --- Login con Google ---
  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl });
  };

  // --- Login con credenciales ---
  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "register") {
        // Registrar nuevo usuario
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al registrarse");
        toast.success("Cuenta creada. Iniciando sesión…");
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) throw new Error("Email o contraseña incorrectos");
      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-in-1">
        {/* Logo y header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500 rounded-2xl shadow-glow mb-4">
            <Database className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-surface-900">DataNest</h1>
          <p className="mt-1 text-surface-500 text-sm">Tu negocio en un solo lugar</p>
        </div>

        {/* Tarjeta de login */}
        <div className="card">
          {/* Tabs: Ingresar / Registrarse */}
          <div className="flex bg-surface-100 rounded-xl p-1 mb-6">
            {(["login", "register"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMode(tab)}
                className={cn(
                  "flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
                  mode === tab
                    ? "bg-white text-brand-600 shadow-card"
                    : "text-surface-500 hover:text-surface-700"
                )}
              >
                {tab === "login" ? "Ingresar" : "Registrarse"}
              </button>
            ))}
          </div>

          {/* Botón de Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="btn-secondary w-full mb-4 relative"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continuar con Google
          </button>

          {/* Divisor */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-surface-200" />
            <span className="text-xs text-surface-400 font-medium">o con email</span>
            <div className="flex-1 h-px bg-surface-200" />
          </div>

          {/* Formulario */}
          <form onSubmit={handleCredentials} className="space-y-3">
            {mode === "register" && (
              <input
                type="text"
                placeholder="Tu nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="input"
              />
            )}

            <input
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="input"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {mode === "login" ? "Ingresar" : "Crear cuenta"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-surface-400 mt-6">
          Al ingresar aceptás nuestros{" "}
          <a href="#" className="text-brand-500 hover:underline">Términos de uso</a>
        </p>
      </div>
    </div>
  );
}
