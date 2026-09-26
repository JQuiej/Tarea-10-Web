import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { juego_id, persona_id, fecha_prestamo } = await request.json();
    if (!juego_id || !persona_id || !fecha_prestamo) {
      return NextResponse.json({ error: 'Juego, persona y fecha son obligatorios.' }, { status: 400 });
    }
    const ocupado = await query(
      "SELECT 1 FROM prestamos WHERE juego_id = $1 AND estado = 'prestado'",
      [juego_id]
    );
    if (ocupado.rowCount > 0) {
      return NextResponse.json({ error: 'Ese juego ya esta prestado.' }, { status: 400 });
    }
    const { rows } = await query(
      `INSERT INTO prestamos (juego_id, persona_id, fecha_prestamo, estado)
       VALUES ($1, $2, $3, 'prestado') RETURNING id`,
      [juego_id, persona_id, fecha_prestamo]
    );
    return NextResponse.json({ id: rows[0].id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
