// Script de prueba directa de conexión PostgreSQL
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

console.log('🔍 Prueba directa de conexión PostgreSQL...');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

async function testConnection() {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('📊 Intentando conectar...');
    const client = await pool.connect();
    console.log('✅ Conexión exitosa!');
    
    const result = await client.query('SELECT 1 as test');
    console.log('✅ Query exitosa:', result.rows[0]);
    
    client.release();
    await pool.end();
    
  } catch (error: any) {
    console.error('❌ Error de conexión:', error.message);
    console.error('Código:', error.code);
    console.error('Hostname:', error.hostname);
  }
}

testConnection();
