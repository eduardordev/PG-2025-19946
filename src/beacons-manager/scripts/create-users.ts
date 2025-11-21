// Script para crear tabla de usuarios
import { pool } from '../src/lib/database';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

console.log('🔐 Creando tabla de usuarios...');

async function createUsersTable(): Promise<void> {
  try {
    const client = await pool.connect();
    
    // Crear tabla de usuarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Tabla users creada exitosamente');
    
    // Crear usuario de prueba
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    try {
      await client.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
        ['admin', 'admin@beacons.com', hashedPassword]
      );
      console.log('✅ Usuario de prueba creado:');
      console.log('   Email: admin@beacons.com');
      console.log('   Password: admin123');
    } catch (error: any) {
      if (error.code === '23505') {
        console.log('ℹ️  Usuario admin ya existe');
      } else {
        throw error;
      }
    }
    
    client.release();
    
  } catch (error: any) {
    console.error('❌ Error al crear tabla de usuarios:', error.message);
  } finally {
    await pool.end();
  }
}

createUsersTable().catch((error: Error) => {
  console.error('❌ Error fatal:', error.message);
  process.exit(1);
});
