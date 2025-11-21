import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/database';

// GET /api/areas - Obtener todas las áreas
export async function GET() {
  try {
    const client = await getConnection();
    try {
      const result = await client.query('SELECT * FROM areas_beacons ORDER BY numero');
      return NextResponse.json({
        success: true,
        value: result.rows,
        Count: result.rows.length
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error obteniendo áreas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/areas - Crear nueva área
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos requeridos
    if (!body.numero || !body.nombre || !body.codigo || !body.ubicacion || !body.color) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const client = await getConnection();
    try {
      // Verificar que el número de área no exista
      const existingResult = await client.query(
        'SELECT * FROM areas_beacons WHERE numero = $1',
        [body.numero]
      );
      
      if (existingResult.rows.length > 0) {
        return NextResponse.json(
          { error: 'Ya existe un área con ese número' },
          { status: 400 }
        );
      }

      // Crear nueva área
      const result = await client.query(
        'INSERT INTO areas_beacons (numero, nombre, codigo, descripcion, ubicacion, color, activo) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [
          body.numero,
          body.nombre,
          body.codigo,
          body.descripcion || '',
          body.ubicacion,
          body.color,
          body.activo !== undefined ? body.activo : true
        ]
      );

      return NextResponse.json(result.rows[0], { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creando área:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}