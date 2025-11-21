import { NextRequest, NextResponse } from 'next/server';
import { getXataClient } from '@/lib/database';

const xata = getXataClient();

// GET /api/levels - Obtener todos los niveles
export async function GET() {
  try {
    const levels = await xata.db.levels.getAll();
    return NextResponse.json(levels);
  } catch (error) {
    console.error('Error obteniendo niveles:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/levels - Crear nuevo nivel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos requeridos
    if (!body.numero || !body.nombre || !body.codigo || !body.area || !body.color) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el número de nivel no exista
    const existingLevel = await xata.db.levels
      .filter({ numero: body.numero })
      .getFirst();
    
    if (existingLevel) {
      return NextResponse.json(
        { error: 'Ya existe un nivel con ese número' },
        { status: 400 }
      );
    }

    const newLevel = await xata.db.levels.create({
      numero: body.numero,
      nombre: body.nombre,
      codigo: body.codigo,
      descripcion: body.descripcion || '',
      area: body.area,
      color: body.color,
      activo: body.activo !== undefined ? body.activo : true
    });

    return NextResponse.json(newLevel, { status: 201 });
  } catch (error) {
    console.error('Error creando nivel:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
