// ============================================================
// DataNest - API: Registro de nuevos usuarios con credenciales
// POST /api/auth/register
// ============================================================

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { query } from "@/lib/db";

// Esquema de validación con Zod
const registerSchema = z.object({
  name:     z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email:    z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    // Verificar si el email ya existe
    const existing = await query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    if (existing.rowCount && existing.rowCount > 0) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email" },
        { status: 409 }
      );
    }

    // Hashear contraseña con bcrypt (cost factor 12)
    const passwordHash = await bcrypt.hash(password, 12);

    // Crear usuario
    const result = await query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email.toLowerCase(), passwordHash]
    );

    return NextResponse.json({ user: result.rows[0] }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[Register] Error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
