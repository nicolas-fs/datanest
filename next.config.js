/** @type {import('next').NextConfig} */

// ============================================================
// DataNest - Configuración de Next.js 14
// ============================================================

const nextConfig = {
  // Habilitar output standalone para Docker
  output: "standalone",

  images: {
    remotePatterns: [
      // Imágenes de Google (avatars de OAuth)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Imágenes de Mercado Pago
      { protocol: "https", hostname: "*.mercadopago.com" },
    ],
  },

  // Variables de entorno expuestas al cliente
  env: {
    APP_NAME: process.env.APP_NAME || "DataNest",
  },
};

module.exports = nextConfig;
