const { checkXataConnection, getXataClient } = require('../src/lib/xata.ts');

console.log('🔍 Verificando conexión a Xata...');

async function checkXataSetup() {
  try {
    const xata = getXataClient();
    
    console.log('📊 Configuración de Xata:');
    console.log(`   - API Key: ${process.env.XATA_API_KEY ? '✅ Configurada' : '❌ No configurada'}`);
    console.log(`   - Database URL: ${process.env.XATA_DATABASE_URL ? '✅ Configurada' : '❌ No configurada'}`);
    console.log(`   - Branch: ${process.env.XATA_BRANCH || 'main'}`);
    
    // Verificar conexión
    const isConnected = await checkXataConnection();
    
    if (isConnected) {
      console.log('✅ Conexión a Xata exitosa');
      
      // Intentar obtener algunos registros para verificar la tabla
      try {
        const result = await xata.db.info_beacons.getAll();
        const records = result.records || result;
        console.log(`📈 Registros encontrados: ${records.length}`);
        
        if (records.length > 0) {
          console.log('📋 Primeros registros:');
          records.slice(0, 3).forEach((record, index) => {
            console.log(`   ${index + 1}. ID: ${record.id}, Nivel: ${record.nivel || 'N/A'}`);
          });
        } else {
          console.log('📭 No hay registros aún - ¡Perfecto para empezar!');
        }
      } catch (error) {
        console.log('⚠️  Tabla info_beacons no existe o no es accesible');
        console.log('💡 Necesitas crear la tabla en el dashboard de Xata');
        console.log('🔗 Ve a: https://Eduardo-Ram-rez-s-workspace-dbu6or.us-east-1.xata.sh/db/beacons-db:main');
      }
      
    } else {
      console.log('❌ Error de conexión a Xata');
      console.log('💡 Verifica tus credenciales en .env.local');
      console.log('🔗 Dashboard: https://Eduardo-Ram-rez-s-workspace-dbu6or.us-east-1.xata.sh/db/beacons-db:main');
    }
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    console.log('💡 Asegúrate de que:');
    console.log('   1. Las credenciales de Xata sean correctas');
    console.log('   2. La tabla info_beacons exista en Xata');
    console.log('   3. Tengas conexión a internet');
  }
}

checkXataSetup();
