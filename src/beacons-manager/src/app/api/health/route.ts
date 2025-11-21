import { NextResponse } from 'next/server';
import { checkConnection } from '@/lib/database';

export async function GET() {
  try {
    const isConnected = await checkConnection();
    
    if (isConnected) {
      return NextResponse.json({
        status: 'healthy',
        database: 'PostgreSQL (Xata)',
        timestamp: new Date().toISOString(),
        message: 'Conexión a la base de datos exitosa'
      });
    } else {
      return NextResponse.json(
        {
          status: 'unhealthy',
          database: 'PostgreSQL (Xata)',
          timestamp: new Date().toISOString(),
          message: 'Error de conexión a la base de datos'
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        database: 'PostgreSQL (Xata)',
        timestamp: new Date().toISOString(),
        message: 'Error interno del servidor',
        error: error.message
      },
      { status: 500 }
    );
  }
}