import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/database';

// GET /api/areas/[id] - Obtener área específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await getConnection();
    try {
      const result = await client.query(
        'SELECT * FROM areas_beacons WHERE xata_id = $1',
        [params.id]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Área no encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error obteniendo área:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/areas/[id] - Actualizar área
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      // Verificar que el área existe
      const existingResult = await client.query(
        'SELECT * FROM areas_beacons WHERE xata_id = $1',
        [params.id]
      );
      
      if (existingResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Área no encontrada' },
          { status: 404 }
        );
      }

      // Verificar que el número de área no exista en otra área
      const duplicateResult = await client.query(
        'SELECT * FROM areas_beacons WHERE numero = $1 AND xata_id != $2',
        [body.numero, params.id]
      );
      
      if (duplicateResult.rows.length > 0) {
        return NextResponse.json(
          { error: 'Ya existe otra área con ese número' },
          { status: 400 }
        );
      }

      // Actualizar área
      const result = await client.query(
        'UPDATE areas_beacons SET numero = $1, nombre = $2, codigo = $3, descripcion = $4, ubicacion = $5, color = $6, activo = $7 WHERE xata_id = $8 RETURNING *',
        [
          body.numero,
          body.nombre,
          body.codigo,
          body.descripcion || '',
          body.ubicacion,
          body.color,
          body.activo !== undefined ? body.activo : true,
          params.id
        ]
      );

      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error actualizando área:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/areas/[id] - Eliminar área
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await getConnection();
    try {
      // Obtener el número de área para verificar sensores asociados
      const areaResult = await client.query(
        'SELECT numero FROM areas_beacons WHERE xata_id = $1',
        [params.id]
      );
      
      if (areaResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Área no encontrada' },
          { status: 404 }
        );
      }

      const areaNumber = areaResult.rows[0].numero;

      // Verificar si hay sensores asociados a esta área
      const beaconsResult = await client.query(
        'SELECT * FROM info_beacons WHERE nivel = $1',
        [areaNumber]
      );
      
      if (beaconsResult.rows.length > 0) {
        return NextResponse.json(
          { error: 'No se puede eliminar el área porque tiene sensores asociados' },
          { status: 400 }
        );
      }

      // Eliminar área
      const deleteResult = await client.query(
        'DELETE FROM areas_beacons WHERE xata_id = $1 RETURNING *',
        [params.id]
      );

      return NextResponse.json({ message: 'Área eliminada correctamente' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error eliminando área:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}