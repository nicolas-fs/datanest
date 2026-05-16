-- ============================================================
-- DataNest - Datos de prueba (seed) para desarrollo
-- EJECUTAR SOLO EN ENTORNO LOCAL, nunca en producción
-- Uso: psql $DATABASE_URL < sql/seed.sql
-- ============================================================

-- Limpiar datos existentes (orden inverso de dependencias)
TRUNCATE TABLE whatsapp_messages, sales, clients, data_sources, sessions, accounts, users RESTART IDENTITY CASCADE;

-- ============================================================
-- Usuario de prueba
-- Email: demo@datanest.app  |  Password: demo1234
-- Hash generado con bcrypt cost=12
-- ============================================================
INSERT INTO users (id, name, email, password_hash) VALUES
  ('00000000-0000-0000-0000-000000000001',
   'Demo User',
   'demo@datanest.app',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpwBAHHe4FsRe.');
   -- La contraseña es: demo1234

-- ============================================================
-- Fuente de datos: CSV importado
-- ============================================================
INSERT INTO data_sources (id, user_id, type, name, status, last_sync) VALUES
  ('10000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'csv', 'ventas_2024.csv', 'active', NOW() - INTERVAL '1 hour');

-- ============================================================
-- Clientes de prueba
-- ============================================================
INSERT INTO clients (id, user_id, source_id, name, email, phone) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'María González',   'maria@ejemplo.com',    '+54 9 11 1234-5678'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Juan Rodríguez',   'juan@empresa.com.ar',  '+54 9 351 2345-6789'),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Laura Martínez',   'laura@negocio.ar',     '+54 9 11 3456-7890'),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Carlos López',     'carlos@cba.com.ar',    '+54 9 351 4567-8901'),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Ana Fernández',    'ana@gmail.com',        NULL),
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Roberto Sánchez',  'roberto@hotmail.com',  '+54 9 11 5678-9012'),
  ('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Sofía Pérez',      'sofia@empresa.ar',     NULL),
  ('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Diego Torres',     NULL,                   '+54 9 11 6789-0123');

-- ============================================================
-- Ventas de los últimos 12 meses
-- Distribuidas para que el gráfico tenga variación realista
-- ============================================================
INSERT INTO sales (user_id, source_id, client_id, amount, currency, status, description, sale_date) VALUES
  -- Junio 2024 (hace ~11 meses)
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 45000,  'ARS', 'completed', 'Servicio mensual',  NOW() - INTERVAL '11 months' + INTERVAL '3 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 28000,  'ARS', 'completed', 'Producto A',        NOW() - INTERVAL '11 months' + INTERVAL '7 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 15000,  'ARS', 'completed', 'Consultoría',       NOW() - INTERVAL '11 months' + INTERVAL '12 days'),

  -- Julio 2024
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 52000,  'ARS', 'completed', 'Servicio mensual',  NOW() - INTERVAL '10 months' + INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 33000,  'ARS', 'completed', 'Producto B',        NOW() - INTERVAL '10 months' + INTERVAL '8 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 19500,  'ARS', 'completed', NULL,                NOW() - INTERVAL '10 months' + INTERVAL '15 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 41000,  'ARS', 'completed', 'Renovación',        NOW() - INTERVAL '10 months' + INTERVAL '20 days'),

  -- Agosto 2024
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 58000,  'ARS', 'completed', 'Servicio mensual',  NOW() - INTERVAL '9 months'  + INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 25000,  'ARS', 'completed', 'Evento',            NOW() - INTERVAL '9 months'  + INTERVAL '9 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 47000,  'ARS', 'completed', 'Pack premium',      NOW() - INTERVAL '9 months'  + INTERVAL '14 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007', 12000,  'ARS', 'completed', NULL,                NOW() - INTERVAL '9 months'  + INTERVAL '22 days'),

  -- Septiembre 2024
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 60000,  'ARS', 'completed', 'Servicio mensual',  NOW() - INTERVAL '8 months'  + INTERVAL '3 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 38000,  'ARS', 'completed', 'Ampliación',        NOW() - INTERVAL '8 months'  + INTERVAL '11 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 22000,  'ARS', 'completed', NULL,                NOW() - INTERVAL '8 months'  + INTERVAL '18 days'),

  -- Octubre 2024
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 65000,  'ARS', 'completed', 'Servicio mensual',  NOW() - INTERVAL '7 months'  + INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 54000,  'ARS', 'completed', 'Evento especial',   NOW() - INTERVAL '7 months'  + INTERVAL '7 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 31000,  'ARS', 'completed', NULL,                NOW() - INTERVAL '7 months'  + INTERVAL '16 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 18000,  'ARS', 'completed', 'Adicional',         NOW() - INTERVAL '7 months'  + INTERVAL '24 days'),

  -- Noviembre 2024
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 72000,  'ARS', 'completed', 'Servicio mensual',  NOW() - INTERVAL '6 months'  + INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 48000,  'ARS', 'completed', 'Proyecto',          NOW() - INTERVAL '6 months'  + INTERVAL '9 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', 15000,  'ARS', 'completed', NULL,                NOW() - INTERVAL '6 months'  + INTERVAL '20 days'),

  -- Diciembre 2024 (pico estacional)
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 85000,  'ARS', 'completed', 'Servicio + bonus',  NOW() - INTERVAL '5 months'  + INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 67000,  'ARS', 'completed', 'Pack navideño',     NOW() - INTERVAL '5 months'  + INTERVAL '10 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 42000,  'ARS', 'completed', NULL,                NOW() - INTERVAL '5 months'  + INTERVAL '15 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 38000,  'ARS', 'completed', 'Cierre año',        NOW() - INTERVAL '5 months'  + INTERVAL '28 days'),

  -- Enero 2025
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 70000,  'ARS', 'completed', 'Servicio mensual',  NOW() - INTERVAL '4 months'  + INTERVAL '4 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 55000,  'ARS', 'completed', 'Proyecto nuevo',    NOW() - INTERVAL '4 months'  + INTERVAL '12 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 28000,  'ARS', 'completed', NULL,                NOW() - INTERVAL '4 months'  + INTERVAL '19 days'),

  -- Febrero 2025
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 75000,  'ARS', 'completed', 'Servicio mensual',  NOW() - INTERVAL '3 months'  + INTERVAL '3 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007', 35000,  'ARS', 'completed', 'Consultoría',       NOW() - INTERVAL '3 months'  + INTERVAL '11 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 29000,  'ARS', 'completed', NULL,                NOW() - INTERVAL '3 months'  + INTERVAL '22 days'),

  -- Marzo 2025
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 82000,  'ARS', 'completed', 'Servicio mensual',  NOW() - INTERVAL '2 months'  + INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 61000,  'ARS', 'completed', 'Renovación anual',  NOW() - INTERVAL '2 months'  + INTERVAL '8 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 47000,  'ARS', 'completed', 'Evento Q1',         NOW() - INTERVAL '2 months'  + INTERVAL '17 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 23000,  'ARS', 'completed', NULL,                NOW() - INTERVAL '2 months'  + INTERVAL '25 days'),

  -- Abril 2025 (mes anterior)
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 90000,  'ARS', 'completed', 'Servicio mensual',  NOW() - INTERVAL '1 month'   + INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 44000,  'ARS', 'completed', 'Pack especial',     NOW() - INTERVAL '1 month'   + INTERVAL '9 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 36000,  'ARS', 'completed', NULL,                NOW() - INTERVAL '1 month'   + INTERVAL '15 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', 19000,  'ARS', 'completed', 'Adicional',         NOW() - INTERVAL '1 month'   + INTERVAL '23 days'),

  -- Mayo 2025 (mes actual)
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 95000,  'ARS', 'completed', 'Servicio mensual',  NOW() - INTERVAL '8 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 68000,  'ARS', 'completed', 'Proyecto Q2',       NOW() - INTERVAL '5 days'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 31000,  'ARS', 'completed', NULL,                NOW() - INTERVAL '2 days');

-- ============================================================
-- Mensajes de WhatsApp de prueba
-- ============================================================
INSERT INTO data_sources (id, user_id, type, name, status, last_sync) VALUES
  ('10000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000001',
   'whatsapp', 'Chat con clientes 2024', 'active', NOW() - INTERVAL '2 hours');

INSERT INTO whatsapp_messages (user_id, source_id, sender, content, sent_at, is_outbound, client_id) VALUES
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'María González', '¡Hola! Quería consultar por el servicio premium', NOW() - INTERVAL '45 days', false, '20000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Vos', 'Hola María! Claro, te cuento todas las opciones...', NOW() - INTERVAL '45 days' + INTERVAL '10 minutes', true, '20000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Juan Rodríguez', 'Necesito una cotización para 3 unidades', NOW() - INTERVAL '32 days', false, '20000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Carlos López', 'Cuándo tienen disponible el producto B?', NOW() - INTERVAL '65 days', false, '20000000-0000-0000-0000-000000000004');

-- ============================================================
-- Verificar que los datos se cargaron correctamente
-- ============================================================
SELECT 'Usuarios'   AS tabla, COUNT(*) AS total FROM users    UNION ALL
SELECT 'Clientes'   AS tabla, COUNT(*) AS total FROM clients  UNION ALL
SELECT 'Ventas'     AS tabla, COUNT(*) AS total FROM sales    UNION ALL
SELECT 'Fuentes'    AS tabla, COUNT(*) AS total FROM data_sources UNION ALL
SELECT 'WhatsApp'   AS tabla, COUNT(*) AS total FROM whatsapp_messages;
