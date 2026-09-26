import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { id, fecha_devolucion } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Prestamo no valido.' }, { status: 400 });
    }
    const fecha = fecha_devolucion || new Date().toISOString().slice(0, 10);
    const { rowCount } = await query(
      `UPDATE prestamos
          SET estado = 'devuelto', fecha_devolucion = $2
        WHERE id = $1 AND estado = 'prestado'`,
      [id, fecha]
    );
    if (rowCount === 0) {
      return NextResponse.json({ error: 'El prestamo ya fue devuelto.' }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
