import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { nombre, contacto } = await request.json();
    if (!nombre?.trim()) {
      return NextResponse.json({ error: 'El nombre es obligatorio.' }, { status: 400 });
    }
    const { rows } = await query(
      'INSERT INTO personas (nombre, contacto) VALUES ($1, $2) RETURNING id',
      [nombre.trim(), contacto?.trim() || null]
    );
    return NextResponse.json({ id: rows[0].id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    const activo = await query(
      "SELECT 1 FROM prestamos WHERE persona_id = $1 AND estado = 'prestado'",
      [id]
    );
    if (activo.rowCount > 0) {
      return NextResponse.json({ error: 'La persona tiene prestamos activos.' }, { status: 400 });
    }
    await query('DELETE FROM personas WHERE id = $1', [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
