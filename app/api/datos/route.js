import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const juegos = await query(`
      SELECT j.id, j.titulo, j.plataforma, j.genero,
             CASE WHEN p.id IS NULL THEN 'Disponible' ELSE 'Prestado' END AS estado,
             per.nombre AS prestado_a,
             p.fecha_prestamo,
             p.id AS prestamo_id
        FROM juegos j
        LEFT JOIN prestamos p ON p.juego_id = j.id AND p.estado = 'prestado'
        LEFT JOIN personas per ON per.id = p.persona_id
       ORDER BY j.titulo
    `);

    const personas = await query('SELECT id, nombre, contacto FROM personas ORDER BY nombre');

    const prestamos = await query(`
      SELECT p.id, p.fecha_prestamo, p.fecha_devolucion, p.estado,
             j.titulo, j.plataforma, per.nombre AS persona
        FROM prestamos p
        JOIN juegos j ON j.id = p.juego_id
        JOIN personas per ON per.id = p.persona_id
       ORDER BY p.fecha_prestamo DESC, p.id DESC
    `);

    return NextResponse.json({
      juegos: juegos.rows,
      personas: personas.rows,
      prestamos: prestamos.rows,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
