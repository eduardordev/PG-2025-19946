import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/database';
import { InfoBeacon } from '@/types';

// GET /api/beacons/[id] - Obtener un beacon específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const client = await getConnection();
    const result = await client.query(
      'SELECT * FROM info_beacons WHERE id = $1',
      [id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Beacon no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error: any) {
    console.error('Error al obtener beacon:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/beacons/[id] - Actualizar un beacon
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json() as { numSensor?: string; idenSensor?: string; x?: number; y?: number; z?: number; unidades?: string; nivel?: number };
    const { numSensor, idenSensor, x, y, z, unidades, nivel } = body;
    
    
    // Validar nivel si se proporciona
    if (nivel !== undefined && ![1, 2, 3, 6, 7].includes(Number(nivel))) {
      return NextResponse.json(
        { success: false, error: 'Nivel debe ser 1, 2, 3, 6 o 7' },
        { status: 400 }
      );
    }
    
    
    // Validar que x, y, z, nivel sean números si se proporcionan
    if (x !== undefined && isNaN(Number(x))) {
      return NextResponse.json(
        { success: false, error: 'x debe ser un número' },
        { status: 400 }
      );
    }
    if (y !== undefined && isNaN(Number(y))) {
      return NextResponse.json(
        { success: false, error: 'y debe ser un número' },
        { status: 400 }
      );
    }
    if (z !== undefined && isNaN(Number(z))) {
      return NextResponse.json(
        { success: false, error: 'z debe ser un número' },
        { status: 400 }
      );
    }
    if (nivel !== undefined && isNaN(Number(nivel))) {
      return NextResponse.json(
        { success: false, error: 'nivel debe ser un número' },
        { status: 400 }
      );
    }
    
    const client = await getConnection();
    
    // Generar codSensor automáticamente si se proporcionan nivel y numSensor
    let codSensor = undefined;
    if (nivel !== undefined && numSensor) {
      // Obtener el código del área para generar codSensor correctamente
      try {
        const areaResult = await client.query('SELECT codigo FROM areas_beacons WHERE numero = $1', [nivel]);
        const areaCode = areaResult.rows[0]?.codigo || `NIVEL-${nivel}`;
        codSensor = `${areaCode}-${numSensor}`;
      } catch (error) {
        console.error('Error obteniendo código de área:', error);
        codSensor = `${nivel}-${numSensor}`; // Fallback
      }
    }
    
    
    const result = await client.query(
      `UPDATE info_beacons 
       SET numSensor = COALESCE($1, numSensor),
           codSensor = COALESCE($2, codSensor),
           idenSensor = COALESCE($3, idenSensor),
           x = COALESCE($4, x),
           y = COALESCE($5, y),
           z = 1.65,
           unidades = COALESCE($6, unidades),
           nivel = COALESCE($7, nivel),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [numSensor, codSensor, idenSensor, x, y, unidades, nivel, id]
    );
    client.release();
    
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Beacon no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Beacon actualizado exitosamente'
    });
    
  } catch (error: any) {
    console.error('Error al actualizar beacon:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/beacons/[id] - Eliminar un beacon
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const client = await getConnection();
    const result = await client.query(
      'DELETE FROM info_beacons WHERE id = $1 RETURNING *',
      [id]
    );
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Beacon no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Beacon eliminado exitosamente',
      data: result.rows[0]
    });
    
  } catch (error: any) {
    console.error('Error al eliminar beacon:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}