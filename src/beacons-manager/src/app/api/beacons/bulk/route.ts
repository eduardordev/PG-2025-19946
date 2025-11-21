import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/database';

// POST /api/beacons/bulk - Crear múltiples beacons
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { beacons: any[] };
    const { beacons } = body;
    
    if (!beacons || !Array.isArray(beacons) || beacons.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Se requiere un array de beacons' },
        { status: 400 }
      );
    }

    // Validar cada beacon
    for (let i = 0; i < beacons.length; i++) {
      const beacon = beacons[i];
      
      if (!beacon.numSensor || !beacon.idenSensor || beacon.nivel === undefined) {
        return NextResponse.json(
          { success: false, error: `Beacon ${i + 1}: numSensor, idenSensor y nivel son requeridos` },
          { status: 400 }
        );
      }
      
      // Validar nivel
      if (![1, 2, 3, 6, 7].includes(Number(beacon.nivel))) {
        return NextResponse.json(
          { success: false, error: `Beacon ${i + 1}: Nivel debe ser 1, 2, 3, 6 o 7` },
          { status: 400 }
        );
      }
      
      // Validar que x, y sean números si se proporcionan
      if (beacon.x !== undefined && isNaN(Number(beacon.x))) {
        return NextResponse.json(
          { success: false, error: `Beacon ${i + 1}: x debe ser un número` },
          { status: 400 }
        );
      }
      if (beacon.y !== undefined && isNaN(Number(beacon.y))) {
        return NextResponse.json(
          { success: false, error: `Beacon ${i + 1}: y debe ser un número` },
          { status: 400 }
        );
      }
    }

    const client = await getConnection();
    
    try {
      await client.query('BEGIN');
      
      // Obtener las áreas para mapear códigos correctos
      const areasResult = await client.query('SELECT numero, codigo FROM areas_beacons ORDER BY numero');
      const areaCodeMap = new Map();
      areasResult.rows.forEach(area => {
        areaCodeMap.set(area.numero, area.codigo);
      });
      
      const insertedBeacons = [];
      
      for (const beacon of beacons) {
        // Generar codSensor usando el código del área correcto
        const areaCode = areaCodeMap.get(beacon.nivel) || `NIVEL-${beacon.nivel}`;
        const codSensor = `${areaCode}-${beacon.numSensor}`;
        
        const result = await client.query(
          `INSERT INTO info_beacons (numSensor, codSensor, idenSensor, x, y, z, unidades, nivel, areaid)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [
            beacon.numSensor,
            codSensor,
            beacon.idenSensor,
            beacon.x,
            beacon.y,
            1.65, // Valor fijo para Z
            beacon.unidades,
            beacon.nivel,
            beacon.areaId
          ]
        );
        
        insertedBeacons.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({
        success: true,
        data: insertedBeacons,
        count: insertedBeacons.length,
        message: `${insertedBeacons.length} beacon${insertedBeacons.length > 1 ? 's' : ''} creado${insertedBeacons.length > 1 ? 's' : ''} exitosamente`
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error al crear beacons:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
