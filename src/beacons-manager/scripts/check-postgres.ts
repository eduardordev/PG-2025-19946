// Script de verificación PostgreSQL con TypeScript
import { checkConnection, pool } from '../src/lib/database';
import { InfoBeacon } from '../src/types';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

console.log('🔍 Verificando conexión PostgreSQL con TypeScript...');

async function checkPostgreSQLSetup(): Promise<void> {
  try {
    console.log('📊 Configuración PostgreSQL:');
    console.log(`   - Database URL: ${process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada'}`);
    
    // Verificar conexión
    const isConnected: boolean = await checkConnection();
    
    if (isConnected) {
      console.log('✅ Conexión PostgreSQL exitosa');
      
      // Verificar si la tabla existe
      try {
        const client = await pool.connect();
        
        // Verificar si la tabla info_beacons existe
        const tableCheck = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'info_beacons'
          );
        `);
        
        const tableExists = tableCheck.rows[0].exists;
        
        if (tableExists) {
          console.log('✅ Tabla info_beacons existe');
          
          // Contar registros
          const countResult = await client.query('SELECT COUNT(*) FROM info_beacons');
          const count = countResult.rows[0].count;
          console.log(`📈 Registros encontrados: ${count}`);
          
          if (parseInt(count) > 0) {
            // Mostrar algunos registros
            const beacons = await client.query('SELECT * FROM info_beacons LIMIT 3');
            console.log('📋 Primeros registros:');
            beacons.rows.forEach((beacon: InfoBeacon, index: number) => {
              console.log(`   ${index + 1}. ID: ${beacon.id}, Nivel: ${beacon.nivel || 'N/A'}`);
            });
          } else {
            console.log('📭 No hay registros aún - ¡Perfecto para empezar!');
          }
          
        } else {
          console.log('❌ Tabla info_beacons no existe');
          console.log('💡 Creando tabla...');
          
          // Crear la tabla
          await client.query(`
            CREATE TABLE IF NOT EXISTS info_beacons (
              id SERIAL PRIMARY KEY,
              numSensor VARCHAR(255) NOT NULL,
              codSensor VARCHAR(255) NOT NULL,
              idenSensor VARCHAR(255) NOT NULL,
              x REAL,
              y REAL,
              z REAL,
              unidades VARCHAR(100),
              nivel INTEGER,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);
          
          console.log('✅ Tabla info_beacons creada exitosamente');
        }
        
        client.release();
        
      } catch (error: any) {
        console.error('❌ Error al verificar tabla:', error.message);
      }
      
    } else {
      console.log('❌ Error de conexión PostgreSQL');
      console.log('💡 Verifica tu DATABASE_URL en .env.local');
    }
    
  } catch (error: any) {
    console.error('❌ Error durante la verificación:', error.message);
  } finally {
    // Cerrar la conexión
    await pool.end();
  }
}

// Ejecutar la verificación
checkPostgreSQLSetup().catch((error: Error) => {
  console.error('❌ Error fatal:', error.message);
  process.exit(1);
});
