#!/usr/bin/env node
// ============================================================
// DataNest - Script para aplicar el schema a la base de datos
// Uso: npm run db:push
// Uso con seed: npm run db:push -- --seed
// ============================================================

const { Pool } = require("pg");
const fs       = require("fs");
const path     = require("path");

// Cargar variables de entorno desde .env.local si existe
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    process.env[key] = process.env[key] ?? val;
  }
}

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : false,
  });

  try {
    console.log("📦 DataNest — Aplicando schema...\n");

    // Leer y ejecutar el schema
    const schemaPath = path.join(__dirname, "../sql/schema.sql");
    const schema     = fs.readFileSync(schemaPath, "utf-8");
    await pool.query(schema);
    console.log("✅ Schema aplicado correctamente");

    // Aplicar seed si se pide
    if (process.argv.includes("--seed")) {
      const seedPath = path.join(__dirname, "../sql/seed.sql");
      const seed     = fs.readFileSync(seedPath, "utf-8");
      await pool.query(seed);
      console.log("🌱 Datos de prueba cargados");
      console.log("   Email: demo@datanest.app");
      console.log("   Pass:  demo1234");
    }

    console.log("\n🚀 Base de datos lista.");
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
