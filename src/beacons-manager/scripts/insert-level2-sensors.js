import { pool } from '../src/lib/database.js';

async function insertLevel2Sensors() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Insertando sensores del nivel 2...');
    
    const query = `
      INSERT INTO info_beacons (numSensor, codSensor, idenSensor, x, y, z, unidades, nivel) VALUES
      ('2', '2-2', 'SENSOR_L2_001', 5.5, 4.75, 2.1, 'metros', 2),
      ('3', '2-3', 'SENSOR_L2_002', 17.0, -2.9, 2.1, 'metros', 2),
      ('4', '2-4', 'SENSOR_L2_003', 19.26, 5.0, 2.1, 'metros', 2),
      ('5', '2-5', 'SENSOR_L2_004', 13.03, 12.2, 2.1, 'metros', 2),
      ('6', '2-6', 'SENSOR_L2_005', 14.58, 23.0, 2.1, 'metros', 2),
      ('7', '2-7', 'SENSOR_L2_007', 17.0, 29.6, 2.1, 'metros', 2),
      ('8', '2-8', 'SENSOR_L2_008', 24.0, 22.4, 2.1, 'metros', 2),
      ('9', '2-9', 'SENSOR_L2_009', 37.0, 25.41, 2.1, 'metros', 2),
      ('10', '2-10', 'SENSOR_L2_010', 46.0, 22.4, 2.1, 'metros', 2),
      ('11', '2-11', 'SENSOR_L2_011', 58.5, 25.4, 2.1, 'metros', 2),
      ('12', '2-12', 'SENSOR_L2_012', 63.15, 23.5, 2.1, 'metros', 2),
      ('13', '2-13', 'SENSOR_L2_013', 53.41, 19.5, 2.1, 'metros', 2),
      ('14', '2-14', 'SENSOR_L2_014', 69.5, 18.1, 2.1, 'metros', 2),
      ('15', '2-15', 'SENSOR_L2_015', 81.6, 19.5, 2.1, 'metros', 2)
    `;
    
    const result = await client.query(query);
    
    console.log('✅ Sensores insertados exitosamente!');
    console.log(`📊 Total de sensores insertados: ${result.rowCount}`);
    
    // Verificar la inserción
    const checkQuery = 'SELECT COUNT(*) as count FROM info_beacons WHERE nivel = 2';
    const checkResult = await client.query(checkQuery);
    console.log(`🔍 Total de sensores en nivel 2: ${checkResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error al insertar sensores:', error);
  } finally {
    client.release();
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  insertLevel2Sensors()
    .then(() => {
      console.log('🎉 Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

export { insertLevel2Sensors };
