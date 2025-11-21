const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkStatusColumn() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Verificando estructura de la tabla info_beacons...');
    
    // Verificar si la columna status existe
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'info_beacons' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Columnas de la tabla info_beacons:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });
    
    // Verificar si existe la columna status
    const hasStatus = result.rows.some(row => row.column_name === 'status');
    
    if (!hasStatus) {
      console.log('\n❌ La columna "status" NO existe en la tabla');
      console.log('🔧 Necesitas agregar la columna con:');
      console.log('ALTER TABLE info_beacons ADD COLUMN status VARCHAR(10) DEFAULT \'healthy\' CHECK (status IN (\'healthy\', \'down\'));');
    } else {
      console.log('\n✅ La columna "status" existe');
      
      // Verificar valores actuales
      const statusResult = await pool.query(`
        SELECT status, COUNT(*) as count 
        FROM info_beacons 
        GROUP BY status;
      `);
      
      console.log('\n📊 Valores de status actuales:');
      statusResult.rows.forEach(row => {
        console.log(`- ${row.status || 'NULL'}: ${row.count} sensores`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkStatusColumn();
