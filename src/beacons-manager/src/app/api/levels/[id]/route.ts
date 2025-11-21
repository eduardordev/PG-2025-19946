import { NextRequest, NextResponse } from 'next/server';
import { getXataClient } from '@/lib/database';

const xata = getXataClient();

// GET /api/levels/[id] - Obtener nivel específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const level = await xata.db.levels.read(params.id);
    
    if (!level) {
      return NextResponse.json(
        { error: 'Nivel no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(level);
  } catch (error) {
    console.error('Error obteniendo nivel:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/levels/[id] - Actualizar nivel
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validar datos requeridos
    if (!body.numero || !body.nombre || !body.codigo || !body.area || !body.color) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el número de nivel no exista en otro nivel
    const existingLevel = await xata.db.levels
      .filter({ numero: body.numero })
      .filter({ id: { $ne: params.id } })
      .getFirst();
    
    if (existingLevel) {
      return NextResponse.json(
        { error: 'Ya existe otro nivel con ese número' },
        { status: 400 }
      );
    }

    const updatedLevel = await xata.db.levels.update(params.id, {
      numero: body.numero,
      nombre: body.nombre,
      codigo: body.codigo,
      descripcion: body.descripcion || '',
      area: body.area,
      color: body.color,
      activo: body.activo !== undefined ? body.activo : true
    });

    if (!updatedLevel) {
      return NextResponse.json(
        { error: 'Nivel no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedLevel);
  } catch (error) {
    console.error('Error actualizando nivel:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/levels/[id] - Eliminar nivel
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si hay sensores asociados a este nivel
    const beacons = await xata.db.beacons
      .filter({ nivel: parseInt(params.id) })
      .getAll();
    
    if (beacons.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el nivel porque tiene sensores asociados' },
        { status: 400 }
      );
    }

    const deletedLevel = await xata.db.levels.delete(params.id);
    
    if (!deletedLevel) {
      return NextResponse.json(
        { error: 'Nivel no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Nivel eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando nivel:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
