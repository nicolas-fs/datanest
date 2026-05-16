# 🪺 DataNest — Unificador de datos para pymes

**DataNest** centraliza las ventas, clientes y conversaciones de tu negocio en una sola plataforma inteligente. Conecta Excel, Mercado Pago y WhatsApp para obtener KPIs automáticos y consultar tus datos en lenguaje natural.

---

## ✨ Funcionalidades del MVP

| Feature | Descripción |
|---------|-------------|
| 🔐 **Login** | Google OAuth + Email/Contraseña (NextAuth.js) |
| 📊 **Fuentes de datos** | Subir Excel/CSV, conectar Mercado Pago (OAuth real), importar chat de WhatsApp |
| 📈 **Dashboard** | KPIs mensuales, ticket promedio, top 5 clientes, alertas de inactividad (30 días) |
| 🤖 **Chatbot IA** | GPT-4o-mini con RAG básico — preguntás en español, responde con tus datos reales |

---

## 🏗️ Stack tecnológico

```
Frontend:  Next.js 14 (App Router) + Tailwind CSS
Backend:   Next.js API Routes
Base de datos: PostgreSQL (Neon cloud)
Auth:      NextAuth.js v4
IA:        OpenAI GPT-4o-mini
Pagos:     Mercado Pago OAuth API
```

---

## 📁 Estructura del proyecto

```
datanest/
├── app/
│   ├── (auth)/login/          # Página de login
│   ├── (dashboard)/
│   │   ├── layout.tsx         # Layout con sidebar
│   │   ├── page.tsx           # Dashboard principal con KPIs
│   │   ├── connect/           # Conectar fuentes de datos
│   │   └── chat/              # Chatbot con IA
│   ├── api/
│   │   ├── auth/              # NextAuth handlers + registro
│   │   ├── sources/           # Upload, Mercado Pago callback, WhatsApp
│   │   ├── dashboard/         # KPIs y métricas
│   │   └── chat/              # Endpoint del chatbot (RAG)
│   ├── layout.tsx             # Layout raíz con fuentes y providers
│   └── globals.css            # Estilos globales y sistema de diseño
├── components/
│   └── layout/
│       ├── Sidebar.tsx        # Navegación lateral
│       └── Providers.tsx      # SessionProvider de NextAuth
├── lib/
│   ├── db.ts                  # Pool de conexiones PostgreSQL
│   ├── auth.ts                # Configuración de NextAuth
│   └── utils.ts               # Helpers: formateo, RAG context builder, parser de WhatsApp
├── types/index.ts             # Tipos TypeScript de la aplicación
├── middleware.ts              # Protección de rutas
├── sql/schema.sql             # Schema completo de la BD
├── docker-compose.yml         # PostgreSQL local + app
├── Dockerfile                 # Build multi-stage para producción
└── .env.example               # Variables de entorno necesarias
```

---

## 🚀 Inicio rápido — Desarrollo local

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/tu-usuario/datanest.git
cd datanest
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Editá `.env.local` con tus credenciales (ver sección **Configuración** abajo).

### 3. Levantar la base de datos local

```bash
docker compose up postgres -d
```

El script `sql/schema.sql` se ejecuta automáticamente al iniciar.

### 4. Iniciar la aplicación

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

---

## ☁️ Deploy en Vercel + Neon (producción)

### Paso 1 — Crear base de datos en Neon

1. Entrá a [neon.tech](https://neon.tech) y creá un proyecto llamado `datanest`
2. Ejecutá el schema en el SQL Editor de Neon:
   ```sql
   -- Copiar y pegar el contenido de sql/schema.sql
   ```
3. Copiá el **Connection String** (formato: `postgresql://user:pass@host/datanest?sslmode=require`)

### Paso 2 — Deploy en Vercel

```bash
# Instalar CLI de Vercel si no lo tenés
npm i -g vercel

# Deploy (te pedirá autenticarte y configurar el proyecto)
vercel
```

O bien: conectá el repositorio desde [vercel.com/new](https://vercel.com/new).

### Paso 3 — Variables de entorno en Vercel

En el panel de Vercel → tu proyecto → **Settings → Environment Variables**, agregá:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | Connection string de Neon |
| `NEXTAUTH_SECRET` | Resultado de `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://tu-app.vercel.app` |
| `GOOGLE_CLIENT_ID` | De Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | De Google Cloud Console |
| `OPENAI_API_KEY` | De platform.openai.com |
| `MERCADOPAGO_CLIENT_ID` | Del panel de desarrolladores de MP |
| `MERCADOPAGO_CLIENT_SECRET` | Del panel de desarrolladores de MP |
| `MERCADOPAGO_REDIRECT_URI` | `https://tu-app.vercel.app/api/sources/mercadopago/callback` |

---

## ⚙️ Configuración de credenciales

### Google OAuth

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Crear un proyecto → APIs & Services → Credentials → **Create OAuth 2.0 Client ID**
3. Tipo: **Web application**
4. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (desarrollo)
   - `https://tu-app.vercel.app/api/auth/callback/google` (producción)

### Mercado Pago OAuth

1. Ir a [mercadopago.com.ar/developers](https://www.mercadopago.com.ar/developers/panel)
2. Crear una nueva aplicación
3. En **Redirect URIs** agregar:
   - `http://localhost:3000/api/sources/mercadopago/callback`
   - `https://tu-app.vercel.app/api/sources/mercadopago/callback`
4. Copiar **Client ID** y **Client Secret**

### OpenAI

1. Ir a [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Crear una nueva API key
3. El modelo usado es `gpt-4o-mini` (muy económico, ~$0.15/1M tokens)

---

## 📋 Formato de archivo Excel/CSV para importar ventas

El archivo debe tener estas columnas (el nombre puede variar, DataNest detecta variantes):

| Columna | Variantes aceptadas | Requerido |
|---------|---------------------|-----------|
| `client_name` | `cliente`, `nombre`, `name` | ✅ |
| `amount` | `monto`, `total`, `precio` | ✅ |
| `date` | `fecha`, `sale_date` | ✅ |
| `client_email` | `email` | ❌ |
| `description` | `descripcion` | ❌ |
| `status` | — | ❌ (default: `completed`) |

**Formatos de fecha aceptados:** `DD/MM/YYYY`, `YYYY-MM-DD`, `DD-MM-YYYY`

**Ejemplo:**
```csv
client_name,amount,date,client_email,description
Juan Pérez,15000,15/01/2024,juan@email.com,Servicio mensual
María García,8500,20/01/2024,,Producto A
```

---

## 🤖 Chatbot — Ejemplos de preguntas

El chatbot tiene acceso a los datos reales del negocio en tiempo real:

- *"¿Cuánto vendí en enero?"*
- *"¿Cuáles son mis 3 mejores clientes?"*
- *"¿Qué clientes no me compraron en el último mes?"*
- *"¿Cómo van mis ventas comparado con el mes anterior?"*
- *"¿Cuántas ventas tuve este mes?"*
- *"Dame un resumen del negocio"*

---

## 🗄️ Arquitectura de datos

```
users ──┬── accounts (OAuth)
        ├── sessions
        └── data_sources ──┬── sales ── clients
                           └── whatsapp_messages
```

**Vistas útiles:**
- `v_monthly_sales` — Ventas por mes agregadas
- `v_top_clients` — Clientes ordenados por total gastado
- `v_inactive_clients` — Clientes sin compras en 30+ días

---

## 🔒 Seguridad

- Contraseñas hasheadas con **bcrypt** (cost factor 12)
- Sesiones JWT firmadas con `NEXTAUTH_SECRET`
- Tokens de Mercado Pago almacenados en campo `config` (JSONB) de `data_sources`
- Todas las API routes validan sesión antes de operar
- Queries parametrizadas para prevenir SQL injection
- Cada usuario solo accede a sus propios datos (user_id en todos los filtros)

---

## 📝 Variables de entorno — referencia completa

```bash
# Base de datos
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# NextAuth
NEXTAUTH_SECRET=clave-aleatoria-32-chars
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# OpenAI
OPENAI_API_KEY=sk-xxx

# Mercado Pago
MERCADOPAGO_CLIENT_ID=123456789
MERCADOPAGO_CLIENT_SECRET=xxx
MERCADOPAGO_REDIRECT_URI=http://localhost:3000/api/sources/mercadopago/callback
```

---

## 🛠️ Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo con hot reload
npm run build    # Build de producción
npm run start    # Iniciar servidor de producción
npm run lint     # Ejecutar ESLint
```

---

## 🗺️ Roadmap (post-MVP)

- [ ] Sincronización automática con Mercado Pago (webhooks)
- [ ] Conector para Tienda Nube / WooCommerce
- [ ] Exportar reportes en PDF
- [ ] Notificaciones por email (alertas de clientes inactivos)
- [ ] Multi-tenant con plan por empresa
- [ ] Gráficos de cohortes de clientes

---

## 📄 Licencia

MIT — Libre para uso comercial y modificación.

---

*DataNest — Construido con ❤️ para las pymes latinoamericanas*
