import { getDatabase } from './database';

export interface DatabaseHealth {
  isConnected: boolean;
  tableExists: boolean;
  recordCount: number;
  error?: string;
}

export function checkDatabaseHealth(): DatabaseHealth {
  try {
    const db = getDatabase();
    
    // Verificar conexión
    db.prepare('SELECT 1').get();
    
    // Verificar que la tabla existe
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='info_beacons'
    `).get();

    if (!tableExists) {
      return {
        isConnected: true,
        tableExists: false,
        recordCount: 0,
        error: 'Table info_beacons does not exist'
      };
    }

    // Contar registros
    const count = db.prepare('SELECT COUNT(*) as count FROM info_beacons').get() as { count: number };

    return {
      isConnected: true,
      tableExists: true,
      recordCount: count.count
    };
  } catch (error) {
    return {
      isConnected: false,
      tableExists: false,
      recordCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function ensureDatabaseExists(): boolean {
  try {
    const health = checkDatabaseHealth();
    
    if (!health.isConnected) {
      console.error('Database connection failed');
      return false;
    }

    if (!health.tableExists) {
      console.log('Table does not exist, initializing...');
      const { initializeDatabase } = require('./schema');
      initializeDatabase();
      console.log('Database initialized successfully');
    }

    return true;
  } catch (error) {
    console.error('Failed to ensure database exists:', error);
    return false;
  }
}
