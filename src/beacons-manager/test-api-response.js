const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testApiResponse() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Probando respuesta de la API...');
    
    // Simular la consulta que hace la API
    const result = await pool.query(`
      SELECT * FROM info_beacons 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    
    console.log('\n📊 Primeros 3 sensores de la DB:');
    result.rows.forEach((beacon, index) => {
      console.log(`\n${index + 1}. Sensor:`, {
        id: beacon.id,
        numSensor: beacon.numsensor,
        codSensor: beacon.codsensor,
        idenSensor: beacon.idensensor,
        status: beacon.status,
        x: beacon.x,
        y: beacon.y,
        nivel: beacon.nivel
      });
    });
    
    // Verificar si hay sensores sin status
    const nullStatusResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM info_beacons 
      WHERE status IS NULL
    `);
    
    console.log(`\n❓ Sensores con status NULL: ${nullStatusResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testApiResponse();
