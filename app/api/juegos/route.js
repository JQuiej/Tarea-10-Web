import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { titulo, plataforma, genero } = await request.json();
    if (!titulo?.trim() || !plataforma?.trim() || !genero?.trim()) {
      return NextResponse.json({ error: 'Titulo, plataforma y genero son obligatorios.' }, { status: 400 });
    }
    const { rows } = await query(
      'INSERT INTO juegos (titulo, plataforma, genero) VALUES ($1, $2, $3) RETURNING id',
      [titulo.trim(), plataforma.trim(), genero.trim()]
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
      "SELECT 1 FROM prestamos WHERE juego_id = $1 AND estado = 'prestado'",
      [id]
    );
    if (activo.rowCount > 0) {
      return NextResponse.json({ error: 'No se puede eliminar un juego prestado.' }, { status: 400 });
    }
    await query('DELETE FROM juegos WHERE id = $1', [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
