import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export function withDatabase(handler: (request: NextRequest, db: any) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Asegurar que la base de datos esté inicializada
      const db = getDatabase();
      
      // Verificar que la tabla existe
      const tableExists = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='info_beacons'
      `).get();

      if (!tableExists) {
        console.error('Table info_beacons does not exist, reinitializing...');
        // Re-inicializar si la tabla no existe
        const { initializeDatabase } = await import('@/lib/schema');
        initializeDatabase();
      }

      return await handler(request, db);
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Database connection error' },
        { status: 500 }
      );
    }
  };
}
