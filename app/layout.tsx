// ============================================================
// DataNest - Layout raíz de la aplicación
// ============================================================

import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import { Toaster } from "react-hot-toast";
import "./globals.css";

// Tipografía principal: Sora - geométrica, moderna, legible en pantallas pequeñas
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

// Tipografía mono: JetBrains Mono - para el chatbot y datos técnicos
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DataNest — Tu negocio en un solo lugar",
    template: "%s | DataNest",
  },
  description: "Unifica los datos de tu negocio: ventas, clientes y mensajes en una sola plataforma inteligente.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${sora.variable} ${jetbrains.variable}`}>
      <body className="bg-surface-50 text-surface-900 antialiased">
        <Providers>
          {children}
        </Providers>
        {/* Notificaciones tipo toast */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1e293b",
              color: "#f8fafc",
              borderRadius: "12px",
              border: "1px solid rgba(99,102,241,0.2)",
              fontFamily: "var(--font-sora)",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
