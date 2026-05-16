-- ============================================================
-- DataNest - Schema de base de datos para PostgreSQL / Neon
-- Versión: 1.0.0
-- ============================================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: users
-- Almacena los usuarios de la plataforma (autenticados con NextAuth)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT,
  email         TEXT UNIQUE NOT NULL,
  email_verified TIMESTAMPTZ,
  image         TEXT,
  password_hash TEXT,                         -- Solo para auth de credenciales
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: accounts
-- Cuentas OAuth vinculadas (NextAuth)
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                TEXT NOT NULL,
  provider            TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          BIGINT,
  token_type          TEXT,
  scope               TEXT,
  id_token            TEXT,
  session_state       TEXT,
  UNIQUE (provider, provider_account_id)
);

-- ============================================================
-- TABLA: sessions
-- Sesiones de NextAuth
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token TEXT UNIQUE NOT NULL,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires       TIMESTAMPTZ NOT NULL
);

-- ============================================================
-- TABLA: verification_tokens
-- Tokens de verificación de email (NextAuth)
-- ============================================================
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token      TEXT NOT NULL,
  expires    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ============================================================
-- TABLA: data_sources
-- Fuentes de datos conectadas por el usuario
-- ============================================================
CREATE TABLE IF NOT EXISTS data_sources (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('csv', 'excel', 'mercadopago', 'whatsapp')),
  name        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'error', 'syncing')),
  config      JSONB DEFAULT '{}',             -- Tokens OAuth, configuraciones, etc.
  last_sync   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: clients
-- Clientes extraídos de las fuentes de datos
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  external_id     TEXT,                        -- ID en la fuente original
  source_id       UUID REFERENCES data_sources(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  address         TEXT,
  metadata        JSONB DEFAULT '{}',          -- Datos adicionales de la fuente
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, external_id, source_id)
);

-- ============================================================
-- TABLA: sales
-- Ventas importadas de las fuentes de datos
-- ============================================================
CREATE TABLE IF NOT EXISTS sales (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_id       UUID REFERENCES data_sources(id) ON DELETE SET NULL,
  client_id       UUID REFERENCES clients(id) ON DELETE SET NULL,
  external_id     TEXT,                        -- ID de la venta en la fuente original
  amount          DECIMAL(12, 2) NOT NULL,
  currency        TEXT DEFAULT 'ARS',
  status          TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled', 'refunded')),
  description     TEXT,
  sale_date       TIMESTAMPTZ NOT NULL,
  metadata        JSONB DEFAULT '{}',          -- Datos adicionales (fees, categorías, etc.)
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, external_id, source_id)
);

-- ============================================================
-- TABLA: whatsapp_messages
-- Mensajes de WhatsApp importados manualmente
-- ============================================================
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_id   UUID REFERENCES data_sources(id) ON DELETE CASCADE,
  sender      TEXT NOT NULL,
  content     TEXT NOT NULL,
  sent_at     TIMESTAMPTZ NOT NULL,
  is_outbound BOOLEAN DEFAULT FALSE,
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES para optimizar queries de dashboard
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_sales_user_date    ON sales (user_id, sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_client        ON sales (client_id);
CREATE INDEX IF NOT EXISTS idx_sales_source        ON sales (source_id);
CREATE INDEX IF NOT EXISTS idx_clients_user        ON clients (user_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_user   ON data_sources (user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_user       ON whatsapp_messages (user_id);

-- ============================================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE OR REPLACE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trigger_data_sources_updated_at
  BEFORE UPDATE ON data_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trigger_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VISTAS para consultas de dashboard
-- ============================================================

-- Vista: KPIs mensuales de ventas
CREATE OR REPLACE VIEW v_monthly_sales AS
SELECT
  user_id,
  DATE_TRUNC('month', sale_date) AS month,
  COUNT(*) AS total_transactions,
  SUM(amount) AS total_amount,
  AVG(amount) AS avg_ticket,
  COUNT(DISTINCT client_id) AS unique_clients
FROM sales
WHERE status = 'completed'
GROUP BY user_id, DATE_TRUNC('month', sale_date);

-- Vista: Top clientes por monto total
CREATE OR REPLACE VIEW v_top_clients AS
SELECT
  s.user_id,
  s.client_id,
  c.name AS client_name,
  c.email,
  COUNT(*) AS total_purchases,
  SUM(s.amount) AS total_spent,
  MAX(s.sale_date) AS last_purchase_date
FROM sales s
JOIN clients c ON c.id = s.client_id
WHERE s.status = 'completed'
GROUP BY s.user_id, s.client_id, c.name, c.email;

-- Vista: Clientes inactivos (no compraron en los últimos 30 días)
CREATE OR REPLACE VIEW v_inactive_clients AS
SELECT
  s.user_id,
  s.client_id,
  c.name AS client_name,
  c.email,
  c.phone,
  MAX(s.sale_date) AS last_purchase_date,
  NOW() - MAX(s.sale_date) AS days_since_last_purchase
FROM sales s
JOIN clients c ON c.id = s.client_id
WHERE s.status = 'completed'
GROUP BY s.user_id, s.client_id, c.name, c.email, c.phone
HAVING MAX(s.sale_date) < NOW() - INTERVAL '30 days';
