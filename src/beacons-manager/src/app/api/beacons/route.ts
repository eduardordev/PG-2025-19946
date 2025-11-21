import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/database';
import { InfoBeacon, BeaconFilters } from '@/types';

// GET /api/beacons - Obtener todos los beacons con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nivel = searchParams.get('nivel');
    const codSensor = searchParams.get('codSensor');
    
    let query = 'SELECT * FROM info_beacons';
    const params: any[] = [];
    const conditions: string[] = [];
    
    // Aplicar filtros
    if (nivel) {
      conditions.push('nivel = $' + (params.length + 1));
      params.push(parseInt(nivel));
    }
    
    if (codSensor) {
      conditions.push('codSensor ILIKE $' + (params.length + 1));
      params.push(`%${codSensor}%`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const client = await getConnection();
    const result = await client.query(query, params);
    client.release();
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
    
  } catch (error: any) {
    console.error('Error al obtener beacons:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/beacons - Crear un nuevo beacon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { numSensor: string; idenSensor: string; x?: number; y?: number; z?: number; unidades?: string; nivel: number; areaId?: string };
    const { numSensor, idenSensor, x, y, z, unidades, nivel, areaId } = body;
    
    
    // Validaciones
    if (!numSensor || !idenSensor || nivel === undefined) {
      return NextResponse.json(
        { success: false, error: 'numSensor, idenSensor y nivel son requeridos' },
        { status: 400 }
      );
    }
    
    // Validar nivel
    if (![1, 2, 3, 6, 7].includes(Number(nivel))) {
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
    
    // Obtener el código del área para generar codSensor correctamente
    const client = await getConnection();
    const areaResult = await client.query('SELECT codigo FROM areas_beacons WHERE numero = $1', [nivel]);
    const areaCode = areaResult.rows[0]?.codigo || `NIVEL-${nivel}`;
    const codSensor = `${areaCode}-${numSensor}`;
    const result = await client.query(
      `INSERT INTO info_beacons (numSensor, codSensor, idenSensor, x, y, z, unidades, nivel, areaid)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [numSensor, codSensor, idenSensor, x, y, 1.65, unidades, nivel, areaId]
    );
    client.release();
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Beacon creado exitosamente'
    });
    
  } catch (error: any) {
    console.error('Error al crear beacon:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}